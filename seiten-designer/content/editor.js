// Visueller Editor: schwebendes Panel, Element-Auswahl, Style-Steuerelemente, Drag & Drop, Themes.
// Wird bei Bedarf injiziert; ein zweites Injizieren schaltet den Editor um (öffnen/schließen).
(() => {
  if (window.__sdEditor) {
    window.__sdEditor.toggle();
    return;
  }

  // ---------------------------------------------------------------- Konstanten

  const FONTS = [
    ["", "Original"],
    ["system-ui, sans-serif", "System"],
    ["Arial, Helvetica, sans-serif", "Arial"],
    ["Verdana, Geneva, sans-serif", "Verdana"],
    ["'Segoe UI', Tahoma, sans-serif", "Segoe UI"],
    ["'Trebuchet MS', sans-serif", "Trebuchet"],
    ["Georgia, serif", "Georgia"],
    ["'Times New Roman', Times, serif", "Times"],
    ["'Courier New', monospace", "Courier"],
    ["'Comic Sans MS', 'Comic Sans', cursive", "Comic Sans"],
  ];

  const SWATCHES = ["#000000", "#ffffff", "#1e293b", "#64748b", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777"];

  const NAMES = {
    h1: "Überschrift 1", h2: "Überschrift 2", h3: "Überschrift 3", h4: "Überschrift 4", h5: "Überschrift 5", h6: "Überschrift 6",
    p: "Absatz", a: "Link", img: "Bild", picture: "Bild", svg: "Grafik", video: "Video", button: "Button",
    nav: "Navigation", header: "Kopfbereich", footer: "Fußbereich", aside: "Seitenleiste", main: "Hauptinhalt",
    section: "Abschnitt", article: "Artikel", ul: "Liste", ol: "Liste", li: "Listenpunkt", form: "Formular",
    input: "Eingabefeld", textarea: "Textfeld", select: "Auswahlfeld", label: "Beschriftung", table: "Tabelle",
    tr: "Tabellenzeile", td: "Tabellenzelle", th: "Tabellenkopf", blockquote: "Zitat", figure: "Abbildung",
    figcaption: "Bildunterschrift", span: "Text", strong: "Fetter Text", em: "Kursiver Text", body: "Ganze Seite",
    iframe: "Eingebetteter Inhalt", hr: "Trennlinie", code: "Code", pre: "Code-Block",
  };

  const LEAF = /^(p|h[1-6]|a|span|img|picture|svg|video|button|input|textarea|select|label|strong|em|b|i|code|hr|br|iframe|canvas|td|th|li)$/;

  const GROUPS = [
    {
      title: "Text",
      fields: [
        { prop: "font-family", label: "Schriftart", type: "select", options: FONTS },
        { prop: "font-size", label: "Schriftgröße", type: "range", min: 8, max: 96, unit: "px" },
        {
          prop: "font-weight", label: "Schriftstärke", type: "select",
          options: [["", "Original"], ["300", "Dünn"], ["400", "Normal"], ["600", "Halbfett"], ["700", "Fett"], ["900", "Extra fett"]],
        },
        { prop: "color", label: "Textfarbe", type: "color" },
        {
          prop: "text-align", label: "Ausrichtung", type: "segmented",
          options: [["left", "Links"], ["center", "Mitte"], ["right", "Rechts"], ["justify", "Block"]],
        },
        { prop: "line-height", label: "Zeilenabstand", type: "range", min: 0.8, max: 3, step: 0.05, unit: "", read: readLineHeight },
      ],
    },
    {
      title: "Hintergrund",
      fields: [{ prop: "background-color", label: "Hintergrundfarbe", type: "color" }],
    },
    { title: "Abstände", type: "spacing" },
    {
      title: "Rahmen & Ecken",
      fields: [
        { prop: "border-width", label: "Rahmenstärke", type: "range", min: 0, max: 20, unit: "px", read: (el) => parseFloat(getComputedStyle(el).borderTopWidth) },
        {
          prop: "border-style", label: "Rahmenart", type: "select",
          options: [["", "Original"], ["none", "Kein Rahmen"], ["solid", "Durchgezogen"], ["dashed", "Gestrichelt"], ["dotted", "Gepunktet"], ["double", "Doppelt"]],
        },
        { prop: "border-color", label: "Rahmenfarbe", type: "color", read: (el) => getComputedStyle(el).borderTopColor },
        { prop: "border-radius", label: "Eckenrundung", type: "range", min: 0, max: 80, unit: "px", read: (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) },
      ],
    },
    {
      title: "Größe",
      fields: [
        { prop: "width", label: "Breite", type: "range", min: 0, max: 1600, unit: "px", read: (el) => el.getBoundingClientRect().width },
        { prop: "max-width", label: "Maximale Breite", type: "range", min: 0, max: 1600, unit: "px", read: (el) => parseFloat(getComputedStyle(el).maxWidth) || el.getBoundingClientRect().width },
        { prop: "height", label: "Höhe", type: "range", min: 0, max: 1200, unit: "px", read: (el) => el.getBoundingClientRect().height },
      ],
    },
    {
      title: "Effekte",
      fields: [
        { prop: "opacity", label: "Deckkraft", type: "range", min: 0, max: 1, step: 0.05, unit: "" },
        {
          prop: "box-shadow", label: "Schatten", type: "select",
          options: [
            ["", "Original"], ["none", "Kein Schatten"],
            ["0 1px 3px rgba(0,0,0,.15)", "Leicht"],
            ["0 6px 16px rgba(0,0,0,.18)", "Mittel"],
            ["0 16px 40px rgba(0,0,0,.28)", "Stark"],
          ],
        },
        {
          prop: "display", label: "Sichtbarkeit", type: "segmented",
          options: [["", "Sichtbar"], ["none", "Ausgeblendet"]],
        },
      ],
    },
  ];

  const PRESETS = [
    { name: "Original", bg: "#ffffff", fg: "#475569", theme: {} },
    { name: "Leseansicht", bg: "#fbf7ee", fg: "#3f3a2e", theme: { font: "Georgia, serif", lineHeight: 1.7, maxWidth: 820 } },
    { name: "Dunkel", bg: "#121212", fg: "#e5e5e5", theme: { dark: true } },
    { name: "Groß & kontrastreich", bg: "#ffffff", fg: "#000000", theme: { zoom: 1.25, contrast: true, lineHeight: 1.8 } },
  ];

  // ---------------------------------------------------------------- Zustand

  const host = SDApply.host;
  let data = SDApply.getData();
  let committed = JSON.stringify(data);
  const undoStack = [];
  const redoStack = [];
  let saveTimer = 0;

  let isOpen = false;
  let paused = false;
  let tab = "element";
  let tplView = "colors"; // Unteransicht im Vorlagen-Tab: "colors" | "layouts"
  let selected = null;
  let selector = null;
  let scope = "one"; // "one" = nur dieses Element, "all" = alle ähnlichen
  let hovered = null;
  let drag = null;
  let rafId = 0;
  let resetArmed = false;
  let pointerOp = false; // läuft gerade ein Ziehen (Panel oder Element)?
  let suppressClickUntil = 0;
  const openGroups = new Set(["Text"]);
  let panelPos = null;

  let hostEl, shadow, ui;

  // ---------------------------------------------------------------- Helfer

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === "class") el.className = v;
      else if (k === "style") el.style.cssText = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = v;
      else if (v === true) el.setAttribute(k, "");
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : String(kid));
    }
    return el;
  }

  function toHex(color) {
    if (!color) return null;
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
  }

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  function readLineHeight(el) {
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight);
    const fs = parseFloat(cs.fontSize) || 16;
    return isNaN(lh) ? 1.2 : lh / fs;
  }

  function nameOf(el) {
    if (!el) return "";
    if (el.localName === "div" || !NAMES[el.localName]) {
      const role = el.getAttribute("role");
      if (role === "navigation") return "Navigation";
      if (role === "banner") return "Kopfbereich";
      if (role === "button") return "Button";
      return el.children.length ? "Bereich" : "Element";
    }
    return NAMES[el.localName];
  }

  function isUi(e) {
    return hostEl && e.composedPath().includes(hostEl);
  }

  function pickable(el) {
    if (!el || el === hostEl || el.nodeType !== 1 || el.localName === "sd-widgets") return null;
    if (el === document.documentElement) return document.body;
    return el;
  }

  function toast(text) {
    const t = h("div", { class: "toast" }, text);
    shadow.append(t);
    setTimeout(() => t.remove(), 1800);
  }

  // ---------------------------------------------------------------- Daten & Verlauf

  function ruleTarget() {
    if (scope === "all") {
      const sim = SDSelector.similar(selected);
      if (sim) return sim.selector;
    }
    return selector;
  }

  function getRule(prop, sel = ruleTarget()) {
    const r = data.rules[sel];
    return r && r[prop] != null && r[prop] !== "" ? r[prop] : null;
  }

  function setRule(prop, value) {
    const sel = ruleTarget();
    if (!sel) return;
    const r = (data.rules[sel] = data.rules[sel] || {});
    if (value === "" || value == null) delete r[prop];
    else r[prop] = String(value);
    // Rahmenstärke ohne Rahmenart wäre unsichtbar – dann automatisch "durchgezogen".
    if (prop === "border-width" && r[prop] && !r["border-style"] && getComputedStyle(selected).borderTopStyle === "none") {
      r["border-style"] = "solid";
    }
    if (!Object.keys(r).length) delete data.rules[sel];
    update();
  }

  function update() {
    SDApply.render(data);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
    syncHistoryButtons();
  }

  function save() {
    saveTimer = 0;
    const now = JSON.stringify(data);
    if (now === committed) return;
    undoStack.push(committed);
    if (undoStack.length > 100) undoStack.shift();
    redoStack.length = 0;
    committed = now;
    SDStore.set(host, data);
    syncHistoryButtons();
  }

  function flush() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      save();
    }
  }

  function restore(json) {
    committed = json;
    data = SDStore.normalize(JSON.parse(json));
    SDApply.render(data);
    SDStore.set(host, data);
    if (selected) selector = SDSelector.get(selected);
    renderPanel();
  }

  function undo() {
    flush();
    if (!undoStack.length) return;
    redoStack.push(committed);
    restore(undoStack.pop());
    toast("Rückgängig gemacht");
  }

  function redo() {
    flush();
    if (!redoStack.length) return;
    undoStack.push(committed);
    restore(redoStack.pop());
    toast("Wiederhergestellt");
  }

  function syncHistoryButtons() {
    if (!ui) return;
    ui.undo.disabled = !undoStack.length && !saveTimer;
    ui.redo.disabled = !redoStack.length;
  }

  // Änderungen von außen (z. B. "Zurücksetzen" im Popup) übernehmen.
  function onStorageChanged(changes, area) {
    const change = changes[SDStore.PREFIX + host];
    if (area !== "local" || !change || saveTimer) return;
    const incoming = JSON.stringify(SDStore.normalize(change.newValue));
    if (incoming === committed) return;
    committed = incoming;
    data = JSON.parse(incoming);
    if (selected) selector = SDSelector.get(selected);
    renderPanel();
  }

  // ---------------------------------------------------------------- Aufbau des Panels

  function build() {
    hostEl = document.createElement("sd-designer");
    hostEl.id = "sd-editor-host";
    hostEl.style.cssText = "all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;";
    // "closed": Skripte der Website können das Panel weder auslesen noch fernsteuern.
    shadow = hostEl.attachShadow({ mode: "closed" });
    shadow.append(h("style", {}, window.SDEditorCss));

    ui = {};
    ui.hoverBox = h("div", { class: "box hover", hidden: true });
    ui.hoverTag = h("div", { class: "tag hover-tag", hidden: true });
    ui.selBox = h("div", { class: "box sel", hidden: true });
    ui.selTag = h("div", { class: "tag", hidden: true });
    ui.handle = h("button", { class: "handle", hidden: true, title: "Gedrückt halten und an eine andere Stelle ziehen", onpointerdown: startDrag }, "✥ Verschieben");
    ui.dropBox = h("div", { class: "box drop-box", hidden: true });
    ui.dropLine = h("div", { class: "drop-line", hidden: true });
    ui.ghost = h("div", { class: "ghost", hidden: true });

    ui.undo = h("button", { class: "icon-btn", title: "Rückgängig (Strg+Z)", onclick: undo }, "↶");
    ui.redo = h("button", { class: "icon-btn", title: "Wiederholen (Strg+Y)", onclick: redo }, "↷");
    ui.pause = h("button", { class: "icon-btn", title: "Seite normal bedienen (Bearbeiten pausieren)", onclick: togglePause }, "⏸");
    ui.min = h("button", { class: "icon-btn", title: "Einklappen", onclick: () => ui.panel.classList.toggle("min") }, "–");
    const close = h("button", { class: "icon-btn", title: "Editor schließen (Änderungen bleiben gespeichert)", onclick: closeEditor }, "✕");
    ui.head = h("div", { class: "head", onpointerdown: startPanelDrag }, h("span", { class: "title" }, "Seiten-Designer"), ui.undo, ui.redo, ui.pause, ui.min, close);
    ui.pauseNote = h("div", { class: "pause-note", hidden: true }, "Pausiert – du kannst die Seite normal bedienen. Klicke ⏸, um weiter zu bearbeiten.");
    ui.tabEl = h("button", { class: "tab", onclick: () => switchTab("element") }, "🎯 Element");
    ui.tabPage = h("button", { class: "tab", onclick: () => switchTab("page") }, "🎨 Ganze Seite");
    ui.tabTpl = h("button", { class: "tab", onclick: () => switchTab("templates") }, "🧩 Vorlagen");
    ui.body = h("div", { class: "body" });
    ui.panel = h("div", { class: "panel" }, ui.head, ui.pauseNote, h("div", { class: "tabs" }, ui.tabEl, ui.tabPage, ui.tabTpl), ui.body);

    shadow.append(ui.hoverBox, ui.selBox, ui.dropBox, ui.dropLine, ui.hoverTag, ui.selTag, ui.handle, ui.ghost, ui.panel);
    placePanel();
  }

  function placePanel() {
    const w = 304;
    let x = panelPos ? panelPos.x : window.innerWidth - w - 16;
    let y = panelPos ? panelPos.y : 16;
    x = Math.max(4, Math.min(x, window.innerWidth - w - 4));
    y = Math.max(4, Math.min(y, window.innerHeight - 48));
    ui.panel.style.left = x + "px";
    ui.panel.style.top = y + "px";
  }

  function startPanelDrag(e) {
    if (e.target.closest && e.target.closest("button")) return;
    e.preventDefault();
    const r = ui.panel.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    const move = (ev) => {
      panelPos = { x: ev.clientX - dx, y: ev.clientY - dy };
      placePanel();
    };
    pointerOp = true;
    const up = () => {
      pointerOp = false;
      suppressClickUntil = Date.now() + 300;
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      browser.storage.local.set({ "sd:panelPos": panelPos });
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
  }

  function switchTab(t) {
    tab = t;
    renderPanel();
  }

  function togglePause() {
    paused = !paused;
    ui.pause.classList.toggle("on", paused);
    ui.pause.textContent = paused ? "▶" : "⏸";
    ui.pauseNote.hidden = !paused;
    hovered = null;
  }

  function renderPanel() {
    if (!ui) return;
    ui.tabEl.classList.toggle("active", tab === "element");
    ui.tabPage.classList.toggle("active", tab === "page");
    ui.tabTpl.classList.toggle("active", tab === "templates");
    const scrollTop = ui.body.scrollTop;
    const render = { element: renderElementTab, page: renderPageTab, templates: renderTemplatesTab }[tab];
    ui.body.replaceChildren(render());
    ui.body.scrollTop = scrollTop;
    syncHistoryButtons();
  }

  // ---------------------------------------------------------------- Tab "Element"

  function renderElementTab() {
    if (!selected) {
      return h("div", { class: "empty" },
        h("div", { class: "big" }, "👆"),
        h("strong", {}, "Klicke auf ein Element der Seite"),
        "Überschriften, Texte, Bilder, Bereiche – alles lässt sich anpassen.",
        h("ul", {},
          h("li", {}, "Farben, Schrift, Abstände und Rahmen per Regler ändern"),
          h("li", {}, "Mit dem orangen ", h("b", {}, "✥ Verschieben"), "-Griff Elemente an eine andere Stelle ziehen"),
          h("li", {}, "Im Tab ", h("b", {}, "Ganze Seite"), " Dunkelmodus, Schrift & Lesebreite wählen"),
          h("li", {}, "Im Tab ", h("b", {}, "Vorlagen"), " der Seite mit einem Klick ein komplett neues Design geben"),
          h("li", {}, "Alles wird automatisch gespeichert und gilt auf allen Seiten von ", h("b", {}, host))));
    }

    const frag = document.createDocumentFragment();
    const rect = selected.getBoundingClientRect();
    const parent = selected.parentElement && selected !== document.body ? selected.parentElement : null;

    frag.append(h("div", { class: "card" },
      h("div", { class: "el-name" }, nameOf(selected)),
      h("div", { class: "el-meta" }, `<${selected.localName}> · ${Math.round(rect.width)} × ${Math.round(rect.height)} px`),
      h("div", { class: "row-btns" },
        parent ? h("button", { class: "btn", title: "Das umgebende Element auswählen", onclick: () => select(parent === document.documentElement ? document.body : parent) }, "↑ Übergeordnetes") : null,
        h("button", { class: "btn", onclick: () => select(null) }, "Abwählen"))));

    const sim = SDSelector.similar(selected);
    if (sim) {
      frag.append(h("div", { class: "field" },
        h("div", { class: "field-head" }, h("label", {}, "Änderungen gelten für")),
        h("div", { class: "seg" },
          h("button", { class: scope === "one" ? "active" : "", onclick: () => { scope = "one"; renderPanel(); } }, "Nur dieses"),
          h("button", { class: scope === "all" ? "active" : "", onclick: () => { scope = "all"; renderPanel(); } }, `Alle ähnlichen (${sim.count})`))));
    }

    if (selected !== document.body) {
      frag.append(h("p", { class: "hint" }, "Zum Verschieben den orangen ", h("b", {}, "✥ Verschieben"), "-Griff am Element ziehen. ",
        "Mit gedrückter ", h("b", {}, "Umschalttaste"), " lässt es sich auch in andere Bereiche hineinziehen."));
    }

    for (const group of GROUPS) {
      const content = group.type === "spacing" ? [spacingControl()] : group.fields.map(fieldControl);
      const changed = group.type === "spacing"
        ? ["margin", "padding"].some((p) => ["top", "right", "bottom", "left"].some((s) => getRule(`${p}-${s}`)))
        : group.fields.some((f) => getRule(f.prop));
      const det = h("details", { open: openGroups.has(group.title) },
        h("summary", {}, group.title, changed ? h("span", { class: "dot", title: "Hier wurde etwas geändert" }) : null),
        h("div", { class: "group-body" }, content));
      det.addEventListener("toggle", () => {
        if (det.open) openGroups.add(group.title);
        else openGroups.delete(group.title);
      });
      frag.append(det);
    }

    frag.append(h("div", { class: "footer" },
      h("button", {
        class: "btn danger block",
        onclick: () => {
          delete data.rules[ruleTarget()];
          update();
          renderPanel();
        },
      }, scope === "all" ? "Änderungen an allen ähnlichen zurücksetzen" : "Änderungen an diesem Element zurücksetzen")));
    return frag;
  }

  function fieldControl(f) {
    const row = h("div", { class: "field" });
    const resetBtn = h("button", { class: "reset", title: "Auf Original zurücksetzen" }, "↺");
    const markChanged = () => {
      const set = getRule(f.prop) != null;
      row.classList.toggle("changed", set);
      resetBtn.hidden = !set;
    };
    const apply = (v) => {
      setRule(f.prop, v);
      markChanged();
    };
    let control;
    let sync;

    if (f.type === "range") {
      const step = f.step || 1;
      const slider = h("input", { type: "range", min: f.min, max: f.max, step });
      const num = h("input", { type: "number", class: "num", min: f.min, step });
      slider.addEventListener("input", () => {
        num.value = slider.value;
        apply(slider.value + f.unit);
      });
      num.addEventListener("change", () => {
        if (num.value === "") return apply("");
        slider.value = num.value;
        apply(num.value + f.unit);
      });
      sync = () => {
        const rule = getRule(f.prop);
        const v = rule != null ? parseFloat(rule) : f.read ? f.read(selected) : parseFloat(getComputedStyle(selected).getPropertyValue(f.prop));
        const val = isNaN(v) ? f.min : round(v);
        slider.max = Math.max(f.max, val);
        slider.value = val;
        num.value = val;
      };
      control = h("div", { class: "range" }, slider, num, h("span", { class: "unit" }, f.unit));
    } else if (f.type === "color") {
      const input = h("input", { type: "color" });
      const code = h("code");
      input.addEventListener("input", () => {
        code.textContent = input.value;
        apply(input.value);
      });
      const swatches = h("div", { class: "swatches" }, SWATCHES.map((c) =>
        h("button", { class: "swatch", style: `background:${c}`, title: c, onclick: () => { apply(c); sync(); } })));
      sync = () => {
        const rule = getRule(f.prop);
        const hex = toHex(rule || (f.read ? f.read(selected) : getComputedStyle(selected).getPropertyValue(f.prop)));
        input.value = hex || "#ffffff";
        code.textContent = hex || "transparent";
      };
      control = h("div", {}, h("div", { class: "color" }, input, code), h("div", { style: "height:6px" }), swatches);
    } else if (f.type === "select") {
      const sel = h("select", { class: "sel-input" }, f.options.map(([v, label]) => h("option", { value: v }, label)));
      sel.addEventListener("change", () => apply(sel.value));
      sync = () => { sel.value = getRule(f.prop) || ""; };
      control = sel;
    } else if (f.type === "segmented") {
      const buttons = f.options.map(([v, label]) => {
        const b = h("button", { onclick: () => { apply(getRule(f.prop) === v ? "" : v); sync(); } }, label);
        b.dataset.v = v;
        return b;
      });
      sync = () => {
        const cur = getRule(f.prop) ?? (f.prop === "display" ? "" : getComputedStyle(selected).getPropertyValue(f.prop));
        for (const b of buttons) b.classList.toggle("active", b.dataset.v === cur || (b.dataset.v === "left" && cur === "start"));
      };
      control = h("div", { class: "seg" }, buttons);
    }

    resetBtn.addEventListener("click", () => {
      apply("");
      sync();
    });
    sync();
    markChanged();
    row.append(h("div", { class: "field-head" }, h("label", {}, f.label), resetBtn), control);
    return row;
  }

  function spacingControl() {
    const cs = getComputedStyle(selected);
    const input = (prop, cls) => {
      const rule = getRule(prop);
      const el = h("input", {
        type: "number", class: cls + (rule ? " set" : ""), title: prop.startsWith("margin") ? "Außenabstand (px)" : "Innenabstand (px)",
        value: rule != null ? parseFloat(rule) : Math.round(parseFloat(cs.getPropertyValue(prop)) || 0),
      });
      el.addEventListener("change", () => {
        setRule(prop, el.value === "" ? "" : el.value + "px");
        el.classList.toggle("set", el.value !== "");
      });
      return el;
    };
    return h("div", {},
      h("div", { class: "spacing" },
        h("span", { class: "cap" }, "Außen"),
        input("margin-top", "t"), input("margin-right", "r"), input("margin-bottom", "b"), input("margin-left", "l"),
        h("div", { class: "inner" },
          h("span", { class: "cap" }, "Innen"),
          input("padding-top", "t"), input("padding-right", "r"), input("padding-bottom", "b"), input("padding-left", "l"),
          h("div", { class: "content" }, "Inhalt"))),
      h("p", { class: "hint" }, "Werte in Pixeln. Feld leeren = Original."));
  }

  // ---------------------------------------------------------------- Tab "Ganze Seite"

  function setTheme(patch) {
    Object.assign(data.theme, patch);
    update();
  }

  function renderPageTab() {
    const t = data.theme;
    const frag = document.createDocumentFragment();

    frag.append(h("div", { class: "section-title" }, "Schnellvorlagen"));
    frag.append(h("div", { class: "presets" }, PRESETS.map((p) =>
      h("button", {
        class: "preset",
        onclick: () => {
          data.theme = Object.assign(SDStore.emptyTheme(), p.theme);
          update();
          renderPanel();
          toast(`Vorlage „${p.name}“ angewendet`);
        },
      },
      h("div", { class: "pv", style: `background:${p.bg};color:${p.fg};border:1px solid #e6e4f0` }, h("i"), h("i"), h("i", { style: "width:80%" })),
      h("span", {}, p.name)))));

    frag.append(h("div", { class: "section-title" }, "Einstellungen"));

    const switchRow = (label, key) => h("label", { class: "switch-row" },
      h("span", {}, label),
      h("span", { class: "switch" },
        h("input", { type: "checkbox", checked: !!t[key], onchange: (e) => setTheme({ [key]: e.target.checked }) }),
        h("span")));
    frag.append(switchRow("🌙 Dunkelmodus", "dark"), switchRow("◐ Mehr Kontrast", "contrast"));

    const font = h("select", { class: "sel-input", onchange: (e) => setTheme({ font: e.target.value }) },
      FONTS.map(([v, label]) => h("option", { value: v }, label)));
    font.value = t.font || "";
    frag.append(h("div", { class: "field", style: "margin-top:8px" }, h("div", { class: "field-head" }, h("label", {}, "Schriftart der ganzen Seite")), font));

    const rangeRow = (label, key, min, max, step, fmt, offValue) => {
      const val = h("span", { class: "unit", style: "width:auto" });
      const slider = h("input", { type: "range", min, max, step, value: t[key] || offValue });
      const show = () => { val.textContent = fmt(Number(slider.value)); };
      slider.addEventListener("input", () => {
        const v = Number(slider.value);
        setTheme({ [key]: v === offValue && key !== "zoom" ? 0 : v });
        show();
      });
      show();
      const reset = h("button", {
        class: "reset", title: "Auf Original zurücksetzen",
        onclick: () => { setTheme({ [key]: key === "zoom" ? 1 : 0 }); renderPanel(); },
      }, "↺");
      return h("div", { class: "field" }, h("div", { class: "field-head" }, h("label", {}, label), reset), h("div", { class: "range" }, slider, val));
    };
    frag.append(
      rangeRow("Zoom", "zoom", 0.5, 2, 0.05, (v) => Math.round(v * 100) + " %", 1),
      rangeRow("Zeilenabstand", "lineHeight", 1, 2.4, 0.05, (v) => (v <= 1 ? "Original" : v.toFixed(2)), 1),
      rangeRow("Lesebreite", "maxWidth", 400, 1800, 20, (v) => (v >= 1800 ? "Original" : v + " px"), 1800));

    const accent = h("input", { type: "color", value: t.accent || "#2563eb", oninput: (e) => setTheme({ accent: e.target.value }) });
    frag.append(h("div", { class: "field" },
      h("div", { class: "field-head" }, h("label", {}, "Linkfarbe"),
        h("button", { class: "reset", title: "Auf Original zurücksetzen", onclick: () => { setTheme({ accent: "" }); renderPanel(); } }, "↺")),
      h("div", { class: "color" }, accent, h("code", {}, t.accent || "Original"))));

    const resetAll = h("button", { class: "btn danger block" }, `Alle Anpassungen für ${host} zurücksetzen`);
    resetAll.addEventListener("click", () => {
      if (!resetArmed) {
        resetArmed = true;
        resetAll.classList.add("confirm");
        resetAll.textContent = "Wirklich alles zurücksetzen? Nochmal klicken";
        setTimeout(() => { resetArmed = false; if (resetAll.isConnected) renderPanel(); }, 3500);
        return;
      }
      resetArmed = false;
      data = SDStore.empty();
      update();
      flush();
      if (selected) selector = SDSelector.get(selected);
      renderPanel();
      toast("Alle Anpassungen entfernt (Rückgängig mit Strg+Z)");
    });
    frag.append(h("div", { class: "footer" }, resetAll));
    return frag;
  }

  // ---------------------------------------------------------------- Tab "Vorlagen"

  function applyTemplate(id) {
    data.template = id;
    update();
    renderPanel();
    const t = SDTemplates.find(id);
    toast(t ? `Vorlage „${t.name}“ angewendet` : "Vorlage entfernt");
  }

  function templateCard(t) {
    const active = data.template === t.id;
    const preview = h("div", { class: "tpl-pv", style: `background:${t.bg};border-color:${t.border};border-radius:${Math.min(parseInt(t.radius), 10)}px` },
      h("div", { class: "tpl-bar", style: `background:${t.surface};border-color:${t.border}` },
        h("i", { style: `background:${t.text}` }), h("i", { style: `background:${t.accent};width:14px` })),
      h("div", { class: "tpl-content" },
        h("div", { class: "tpl-h", style: `color:${t.heading};font-family:${t.headingFont}` }, "Aa"),
        h("i", { style: `background:${t.text}` }), h("i", { style: `background:${t.text};width:70%` }),
        h("span", { class: "tpl-btn", style: `background:${t.accent};border-radius:${t.radius}` })));
    const card = h("button", {
      class: "tpl" + (active ? " active" : ""),
      title: active ? "Klicken, um die Vorlage zu entfernen" : "Klicken, um die Vorlage anzuwenden",
      onclick: () => applyTemplate(active ? "" : t.id),
      // Vorschau beim Überfahren – ohne zu speichern.
      onmouseenter: () => SDApply.render(Object.assign({}, data, { template: t.id })),
      onmouseleave: () => SDApply.render(data),
    },
    preview,
    h("span", { class: "tpl-name" }, active ? "✓ " + t.name : t.name),
    h("span", { class: "tpl-desc" }, t.desc));
    return card;
  }

  function renderTemplatesTab() {
    const n = SDLayouts.activeCount(data.layout);
    const view = (v) => () => { tplView = v; renderPanel(); };
    return h("div", {},
      h("div", { class: "seg", style: "margin-bottom:10px" },
        h("button", { class: tplView === "colors" ? "active" : "", onclick: view("colors") }, "🎨 Farbthemen"),
        h("button", { class: tplView === "layouts" ? "active" : "", onclick: view("layouts") }, n ? `📐 Layouts (${n})` : "📐 Layouts")),
      tplView === "colors" ? renderColorThemes() : renderLayouts());
  }

  function renderColorThemes() {
    return h("div", {},
      h("p", { class: "hint", style: "margin-top:0" },
        "Fahre mit der Maus über eine Vorlage für eine Vorschau, klicke zum Übernehmen. ",
        "Deine eigenen Element-Änderungen bleiben erhalten und haben Vorrang."),
      h("div", { class: "tpl-grid" }, SDTemplates.LIST.map(templateCard)),
      data.template ? h("button", { class: "btn block", onclick: () => applyTemplate("") }, "Ohne Vorlage (Original-Design)") : null);
  }

  // ---------------------------------------------------------------- Layouts (Pakete + einzelne Verbesserungen)

  function sameLayout(a, b) {
    const norm = (o) => JSON.stringify(Object.keys(o || {}).filter((k) => o[k]).sort().map((k) => [k, o[k]]));
    return norm(a) === norm(b);
  }

  function packActive(p) {
    return sameLayout(data.layout, p.layout) && (!p.template || data.template === p.template);
  }

  function applyPack(p) {
    if (packActive(p)) {
      data.layout = {};
      if (p.template) data.template = "";
      toast(`Layout „${p.name}“ entfernt`);
    } else {
      data.layout = Object.assign({}, p.layout);
      if (p.template) data.template = p.template;
      toast(`Layout „${p.name}“ angewendet`);
    }
    update();
    renderPanel();
  }

  function setLayout(id, value) {
    data.layout = Object.assign({}, data.layout);
    if (value) data.layout[id] = value;
    else delete data.layout[id];
    update();
    renderPanel();
  }

  // Kleine Drahtgitter-Skizze, die zeigt, wie das Paket die Seite aufbaut.
  function packPreview(p) {
    const pv = p.preview || {};
    const t = SDTemplates.find(p.template);
    const bg = t ? t.bg : "#f8fafc";
    const surface = t ? t.surface : "#e2e8f0";
    const ink = t ? t.text : "#94a3b8";
    const accent = t ? t.accent : "#6366f1";
    const line = (w) => h("i", { class: "wf-line", style: `background:${ink};width:${w}%` + (pv.big ? ";height:5px" : "") });
    const body = [];
    if (pv.cards) {
      body.push(h("div", { class: "wf-cards", style: `grid-template-columns:repeat(${Math.min(pv.cards, 3)},1fr)` },
        Array.from({ length: pv.cards }, () => h("span", { class: "wf-card", style: `background:${surface};border-color:${accent}33` }))));
    }
    if (pv.lines) {
      const col = h("div", { class: "wf-col" + (pv.narrow ? " narrow" : "") },
        Array.from({ length: pv.lines }, (_, i) => line(i % 3 === 2 ? 70 : 100)));
      body.push(pv.narrow || pv.noSidebar || pv.cards ? col
        : h("div", { class: "wf-split" }, col, h("span", { class: "wf-side", style: `background:${surface}` })));
    }
    return h("div", { class: "wf", style: `background:${bg}` },
      h("div", { class: "wf-head", style: `background:${surface}` }, h("i", { style: `background:${ink}` }), h("b", { style: `background:${accent}` })),
      h("div", { class: "wf-body" }, body),
    );
  }

  function packCard(p) {
    const active = packActive(p);
    return h("button", {
      class: "tpl" + (active ? " active" : ""),
      title: active ? "Klicken, um das Layout zu entfernen" : "Klicken, um das Layout anzuwenden",
      onclick: () => applyPack(p),
      onmouseenter: () => SDApply.render(Object.assign({}, data, { layout: p.layout, template: p.template || data.template })),
      onmouseleave: () => SDApply.render(data),
    },
    packPreview(p),
    h("span", { class: "tpl-name" }, active ? "✓ " + p.name : p.name),
    h("span", { class: "tpl-desc" }, p.desc));
  }

  function featureRow(f) {
    const value = data.layout[f.id];
    const on = !!value;
    const current = value === true && f.option ? f.option.default : value;
    const toggle = h("span", { class: "switch" },
      h("input", { type: "checkbox", checked: on, onchange: (e) => setLayout(f.id, e.target.checked ? (f.option ? f.option.default : true) : null) }),
      h("span"));
    return h("div", { class: "feat" + (on ? " on" : "") },
      h("label", { class: "feat-main" },
        h("span", { class: "feat-icon" }, f.icon),
        h("span", { class: "feat-text" }, h("b", {}, f.name), h("span", {}, f.desc)),
        toggle),
      on && f.option ? h("div", { class: "chips" },
        h("span", {}, f.option.label + ":"),
        f.option.choices.map(([v, label]) =>
          h("button", { class: "chip" + (current === v ? " active" : ""), onclick: () => setLayout(f.id, v) }, label))) : null);
  }

  function renderLayouts() {
    const n = SDLayouts.activeCount(data.layout);
    return h("div", {},
      h("p", { class: "hint", style: "margin-top:0" },
        "Layouts verändern den Aufbau der Seite – Abstände, Karten, Navigation, Buttons und mehr. ",
        "Sie lassen sich mit jedem Farbthema kombinieren."),
      h("div", { class: "section-title" }, "Fertige Layout-Pakete"),
      h("div", { class: "tpl-grid" }, SDLayouts.PACKS.map(packCard)),
      h("div", { class: "section-title", style: "margin-top:16px" }, "Was soll verbessert werden?"),
      h("div", { class: "feat-list" }, SDLayouts.FEATURES.map(featureRow)),
      n ? h("button", { class: "btn danger block", style: "margin-top:10px", onclick: () => { data.layout = {}; update(); renderPanel(); toast("Alle Layout-Verbesserungen aus"); } },
        "Alle Layout-Verbesserungen ausschalten") : null);
  }

  // ---------------------------------------------------------------- Auswahl & Hervorhebung

  function select(el) {
    selected = pickable(el);
    selector = selected ? SDSelector.get(selected) : null;
    if (selected && scope === "all" && !SDSelector.similar(selected)) scope = "one";
    tab = "element";
    renderPanel();
  }

  function placeBox(box, tag, el, label) {
    if (!el || !el.isConnected) {
      box.hidden = true;
      if (tag) tag.hidden = true;
      return null;
    }
    const r = el.getBoundingClientRect();
    box.hidden = false;
    Object.assign(box.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    if (tag) {
      tag.hidden = false;
      tag.replaceChildren(label, h("small", {}, `${Math.round(r.width)}×${Math.round(r.height)}`));
      tag.style.left = Math.max(2, r.left) + "px";
      tag.style.top = (r.top > 22 ? r.top - 21 : r.top + 2) + "px";
    }
    return r;
  }

  function frame() {
    if (!isOpen) return;
    if (selected && !selected.isConnected) select(null);

    const showHover = !paused && !drag && hovered && hovered !== selected;
    placeBox(ui.hoverBox, ui.hoverTag, showHover ? hovered : null, nameOf(hovered));
    const r = placeBox(ui.selBox, ui.selTag, selected, nameOf(selected));

    const canMove = r && selected !== document.body && !paused;
    ui.handle.hidden = !canMove || !!drag;
    if (canMove) {
      // Griff direkt neben dem Namensschild – links, damit das Panel ihn selten verdeckt.
      const tr = ui.selTag.getBoundingClientRect();
      const hw = ui.handle.offsetWidth || 96;
      ui.handle.style.left = Math.min(window.innerWidth - hw - 4, tr.right + 6) + "px";
      ui.handle.style.top = tr.top + tr.height / 2 - 11 + "px";
    }
    rafId = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- Drag & Drop

  function startDrag(e) {
    if (!selected) return;
    e.preventDefault();
    e.stopPropagation();
    flush();
    drag = { el: selected, drop: null };
    pointerOp = true;
    ui.ghost.textContent = "✥ " + nameOf(selected) + " verschieben";
    ui.ghost.hidden = false;
    document.documentElement.style.cursor = "grabbing";
    window.addEventListener("pointermove", onDragMove, true);
    window.addEventListener("pointerup", onDragEnd, true);
    onDragMove(e);
  }

  function computeDrop(x, y, precise) {
    let t = document.elementFromPoint(x, y);
    if (!t || t === hostEl) return null;
    if (t === document.documentElement) t = document.body;
    if (drag.el.contains(t)) return null;
    if (t === document.body) return { ref: t, pos: "inside" };

    // Standard: innerhalb derselben Ebene umsortieren (z. B. Karte neben Karte statt in die Karte hinein).
    // Mit gedrückter Umschalttaste wird das tiefste Element unter dem Mauszeiger genommen.
    if (!precise) {
      for (let a = t; a && a !== document.body; a = a.parentElement) {
        if (a.parentElement === drag.el.parentElement) {
          t = a;
          break;
        }
      }
    }

    const r = t.getBoundingClientRect();
    const cs = getComputedStyle(t);
    const pcs = t.parentElement ? getComputedStyle(t.parentElement) : null;
    const horizontal = !!pcs && (
      (/flex/.test(pcs.display) && !/column/.test(pcs.flexDirection)) ||
      (/grid/.test(pcs.display) && r.width < t.parentElement.getBoundingClientRect().width * 0.7) ||
      /^inline/.test(cs.display));
    const f = horizontal ? (x - r.left) / r.width : (y - r.top) / r.height;
    const container = !LEAF.test(t.localName) && /^(block|flex|grid|flow-root|inline-flex|inline-grid|list-item)$/.test(cs.display);
    const sibling = t.parentElement === drag.el.parentElement;
    if (container && (precise || !sibling) && f > 0.25 && f < 0.75) return { ref: t, pos: "inside" };
    return { ref: t, pos: f < 0.5 ? "before" : "after", horizontal };
  }

  function onDragMove(e) {
    e.preventDefault();
    ui.ghost.style.left = e.clientX + 14 + "px";
    ui.ghost.style.top = e.clientY + 14 + "px";
    const overPanel = ui.panel.contains(shadow.elementFromPoint ? shadow.elementFromPoint(e.clientX, e.clientY) : null);
    drag.drop = overPanel ? null : computeDrop(e.clientX, e.clientY, e.shiftKey);

    const d = drag.drop;
    ui.dropBox.hidden = !d || d.pos !== "inside";
    ui.dropLine.hidden = !d || d.pos === "inside";
    if (!d) return;
    const r = d.ref.getBoundingClientRect();
    if (d.pos === "inside") {
      Object.assign(ui.dropBox.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    } else if (d.horizontal) {
      const x = d.pos === "before" ? r.left : r.right;
      Object.assign(ui.dropLine.style, { left: x - 2 + "px", top: r.top + "px", width: "4px", height: r.height + "px" });
    } else {
      const y = d.pos === "before" ? r.top : r.bottom;
      Object.assign(ui.dropLine.style, { left: r.left + "px", top: y - 2 + "px", width: r.width + "px", height: "4px" });
    }
  }

  function onDragEnd(e) {
    e.preventDefault();
    pointerOp = false;
    suppressClickUntil = Date.now() + 300;
    window.removeEventListener("pointermove", onDragMove, true);
    window.removeEventListener("pointerup", onDragEnd, true);
    document.documentElement.style.cursor = "";
    ui.ghost.hidden = ui.dropBox.hidden = ui.dropLine.hidden = true;
    const { el, drop } = drag;
    drag = null;
    if (drop) performMove(el, drop);
  }

  function performMove(el, drop) {
    const refSel = SDSelector.get(drop.ref);
    const existing = el.getAttribute("data-sd-moved");
    const entry = existing && data.moves.find((m) => m.id === existing);
    if (entry) {
      entry.ref = refSel;
      entry.pos = drop.pos;
    } else {
      const id = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const oldSel = SDSelector.get(el);
      data.moves.push({ id, el: oldSel, ref: refSel, pos: drop.pos });
      // Verschobene Elemente werden über ihre Move-ID angesprochen – bisherige Styles mitnehmen.
      const newSel = `[data-sd-moved="${id}"]`;
      if (data.rules[oldSel]) {
        data.rules[newSel] = data.rules[oldSel];
        delete data.rules[oldSel];
      }
    }
    update();
    flush();
    if (selected) selector = SDSelector.get(selected);
    renderPanel();
    toast("Verschoben ✓");
  }

  // ---------------------------------------------------------------- Ereignisse der Seite

  const BLOCKED = ["click", "dblclick", "auxclick", "mousedown", "mouseup", "pointerdown", "pointerup", "submit", "contextmenu"];

  function onBlocked(e) {
    if (paused || isUi(e)) return;
    if (e.type === "contextmenu") return; // Rechtsklick-Menü erlauben
    e.preventDefault();
    // Während Panel- oder Element-Ziehen müssen unsere eigenen pointerup-Listener noch laufen.
    if (pointerOp) return;
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.type === "click" && Date.now() > suppressClickUntil) select(e.target);
  }

  function onMouseMove(e) {
    if (paused || drag) return;
    hovered = isUi(e) ? null : pickable(e.target);
  }

  function isEditable(el) {
    return el && (el.isContentEditable || /^(input|textarea|select)$/.test(el.localName));
  }

  function onKeyDown(e) {
    let origin = e.composedPath()[0];
    // Bei geschlossenem Shadow DOM endet der Pfad am Host – das fokussierte Feld liefert shadow.activeElement.
    if (origin === hostEl && shadow) origin = shadow.activeElement || origin;
    if (isEditable(origin)) return;
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Escape") {
      if (selected) select(null);
      else return;
    } else if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
      undo();
    } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
      redo();
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }

  function onResize() {
    if (ui) placePanel();
  }

  // ---------------------------------------------------------------- Öffnen / Schließen

  async function openEditor() {
    if (isOpen) return;
    isOpen = true;
    const stored = await browser.storage.local.get("sd:panelPos");
    panelPos = stored["sd:panelPos"] || null;
    const fresh = await SDStore.get(host);
    data = fresh;
    committed = JSON.stringify(fresh);

    build();
    document.documentElement.append(hostEl);
    for (const type of BLOCKED) window.addEventListener(type, onBlocked, true);
    window.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onResize);
    browser.storage.onChanged.addListener(onStorageChanged);
    renderPanel();
    rafId = requestAnimationFrame(frame);
  }

  function closeEditor() {
    if (!isOpen) return;
    flush();
    isOpen = false;
    cancelAnimationFrame(rafId);
    for (const type of BLOCKED) window.removeEventListener(type, onBlocked, true);
    window.removeEventListener("mousemove", onMouseMove, true);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("resize", onResize);
    browser.storage.onChanged.removeListener(onStorageChanged);
    hostEl.remove();
    hostEl = shadow = ui = null;
    selected = hovered = null;
    paused = false;
  }

  window.__sdEditor = {
    toggle: () => (isOpen ? closeEditor() : openEditor()),
  };
  openEditor();
})();
