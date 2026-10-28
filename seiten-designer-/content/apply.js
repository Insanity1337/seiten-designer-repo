// Wendet die gespeicherten Anpassungen einer Website an: Stylesheet (Element-Styles + Theme)
// und Verschiebungen. Läuft ab document_start, damit die Seite nicht erst im Original aufblitzt.
(() => {
  if (window.SDApply) return;

  // Schlüssel ist die Domain (inkl. aller Subdomains und Unterseiten), nicht die einzelne Seite.
  const host = SDStore.hostOf(location.href);
  const styleEl = document.createElement("style");
  styleEl.id = "sd-style";
  let data = SDStore.empty();
  let observer = null;
  let moveTimer = 0;
  const origins = new Map(); // Move-ID → ursprüngliche Position des Elements

  const INVERT = "invert(1) hue-rotate(180deg)";
  const MEDIA = "img, video, picture, canvas, iframe, embed, object, svg image, [style*='background-image']";
  const NO_FONT = ":not(code):not(pre):not(kbd):not(samp):not(i):not([class*='icon']):not([class*='fa-']):not(.material-icons):not(.material-symbols-outlined)";

  // Werte können aus importierten (fremden) Einstellungen stammen. Alles, was externe Ressourcen
  // nachladen könnte (url(), image-set(), @import …), wird verworfen – sonst ließen sich per CSS
  // z. B. Formularinhalte an fremde Server melden.
  const UNSAFE_VALUE = /url\s*\(|image-set|image\s*\(|cross-fade|element\s*\(|src\s*\(|@import|expression\s*\(|javascript:|\\|\/\*/i;

  function clean(value) {
    const s = String(value).replace(/[;{}<>]/g, "").trim();
    return UNSAFE_VALUE.test(s) ? "" : s;
  }

  function validProp(prop) {
    return /^-?[a-z][a-z-]*$/i.test(prop);
  }

  function validSelector(sel) {
    if (typeof sel !== "string" || sel.includes("/*")) return false;
    try {
      document.createDocumentFragment().querySelector(sel);
      return true;
    } catch {
      return false;
    }
  }

  function themeCss(t) {
    let css = "";
    const filters = [];
    if (t.dark) filters.push(INVERT);
    if (t.contrast) filters.push("contrast(1.25)");
    if (filters.length) {
      css += `html { filter: ${filters.join(" ")} !important; background-color: #fff !important; }\n`;
    }
    if (t.dark) {
      css += `${MEDIA} { filter: ${INVERT} !important; }\n`;
      css += `#sd-editor-host, sd-widgets { filter: ${INVERT} !important; }\n`;
    }
    if (t.font) {
      css += `body, body *${NO_FONT} { font-family: ${clean(t.font)} !important; }\n`;
    }
    if (t.zoom && Number(t.zoom) !== 1) {
      css += `body { zoom: ${Number(t.zoom)} !important; }\n`;
    }
    if (t.lineHeight) {
      css += `body p, body li, body dd, body blockquote, body td { line-height: ${Number(t.lineHeight)} !important; }\n`;
    }
    if (t.maxWidth) {
      css += `body { max-width: ${Number(t.maxWidth)}px !important; margin-left: auto !important; margin-right: auto !important; }\n`;
    }
    if (t.accent) {
      css += `a, a:visited { color: ${clean(t.accent)} !important; }\n`;
    }
    return css;
  }

  function buildCss(d) {
    if (!d.enabled) return "";
    // Reihenfolge: Farbthema, Layout-Verbesserungen, Seiten-Einstellungen, zuletzt eigene Element-Regeln (haben Vorrang).
    let css = SDTemplates.css(d.template) + SDLayouts.css(d.layout) + themeCss(d.theme);
    for (const [sel, props] of Object.entries(d.rules)) {
      if (!props || !validSelector(sel)) continue;
      if (typeof props !== "object") continue;
      const body = Object.entries(props)
        .filter(([p, v]) => v !== "" && v != null && validProp(p))
        .map(([p, v]) => [p, clean(v)])
        .filter(([, v]) => v !== "")
        .map(([p, v]) => `  ${p}: ${v} !important;`)
        .join("\n");
      if (body) css += `${sel} {\n${body}\n}\n`;
    }
    return css;
  }

  function mountStyle() {
    const parent = document.head || document.documentElement;
    // Immer als letztes Element einhängen, damit unsere Regeln bei Gleichstand gewinnen.
    if (styleEl.parentNode !== parent || styleEl.nextElementSibling) parent.appendChild(styleEl);
  }

  // Verschiebt Elemente gemäß data.moves. Idempotent: bereits verschobene Elemente bleiben, wo sie sind.
  function applyMoves() {
    if (!document.body || !data.enabled) return;
    for (const m of data.moves) {
      const el = document.querySelector(`[data-sd-moved="${CSS.escape(m.id)}"]`) || SDSelector.query(m.el);
      const ref = SDSelector.query(m.ref);
      if (!el || !ref || el === ref || el.contains(ref)) continue;
      if (!origins.has(m.id)) origins.set(m.id, { el, parent: el.parentNode, next: el.nextSibling });
      el.setAttribute("data-sd-moved", m.id);
      if (m.pos === "before" && ref.previousElementSibling !== el) ref.before(el);
      else if (m.pos === "after" && ref.nextElementSibling !== el) ref.after(el);
      else if (m.pos === "inside" && (el.parentElement !== ref || ref.lastElementChild !== el)) ref.append(el);
    }
  }

  // Setzt Elemente zurück an ihren Ursprungsort, deren Verschiebung entfernt wurde
  // (Rückgängig, Zurücksetzen, Abschalten) – ohne die Seite neu zu laden.
  function restoreMoves() {
    const active = new Set(data.enabled ? data.moves.map((m) => m.id) : []);
    for (const [id, o] of Array.from(origins.entries()).reverse()) {
      if (active.has(id)) continue;
      const next = o.next && o.next.parentNode === o.parent ? o.next : null;
      if (o.parent && o.parent.isConnected) o.parent.insertBefore(o.el, next);
      o.el.removeAttribute("data-sd-moved");
      origins.delete(id);
    }
  }

  function scheduleMoves() {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(applyMoves, 250);
  }

  function watchDom() {
    if (observer || !document.body) return;
    observer = new MutationObserver((records) => {
      if (!data.moves.length) return;
      // Eigene Verschiebungen lösen ebenfalls Mutationen aus; applyMoves ist idempotent, daher kein Loop.
      if (records.some((r) => r.type === "childList")) scheduleMoves();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function render(d) {
    data = SDStore.normalize(d);
    styleEl.textContent = buildCss(data);
    mountStyle();
    restoreMoves();
    applyMoves();
    SDLayouts.syncWidgets(data.enabled ? data.layout : null);
  }

  window.SDApply = {
    host,
    render,
    getData: () => JSON.parse(JSON.stringify(data)),
  };

  mountStyle();
  SDStore.get(host).then(render);

  document.addEventListener("DOMContentLoaded", () => {
    mountStyle();
    applyMoves();
    watchDom();
  });
  if (document.readyState !== "loading") watchDom();

  browser.storage.onChanged.addListener((changes, area) => {
    const change = changes[SDStore.PREFIX + host];
    if (area !== "local" || !change) return;
    render(change.newValue);
  });
})();
