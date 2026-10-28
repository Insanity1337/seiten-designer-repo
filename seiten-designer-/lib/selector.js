// Erzeugt möglichst stabile, eindeutige CSS-Selektoren für Elemente,
// damit gespeicherte Anpassungen nach dem Neuladen wieder das richtige Element treffen.
window.SDSelector = window.SDSelector || (() => {
  const esc = (s) => CSS.escape(s);

  // Automatisch erzeugte Namen (CSS-in-JS, Hashes, Zähler) ändern sich oft beim nächsten Build.
  const GENERATED = /^(css|sc|jsx|svelte|emotion|ng|ember|tw)-|^_|[0-9a-f]{6,}|\d{3,}|^sd-/i;
  const STATE = /^(is-|has-)|^(active|hover|focus|open|opened|selected|current|show|visible|hidden|collapsed|expanded)$/i;

  function goodId(id) {
    return !!id && id.length < 40 && !GENERATED.test(id) && !/\d{2,}/.test(id);
  }

  function goodClasses(el) {
    return Array.from(el.classList)
      .filter((c) => c.length < 40 && !GENERATED.test(c) && !STATE.test(c))
      .slice(0, 2);
  }

  function isUnique(sel, el) {
    try {
      const found = document.querySelectorAll(sel);
      return found.length === 1 && found[0] === el;
    } catch {
      return false;
    }
  }

  function nthOfType(el) {
    let i = 1;
    for (let s = el.previousElementSibling; s; s = s.previousElementSibling) {
      if (s.localName === el.localName) i++;
    }
    return i;
  }

  function segment(el) {
    let seg = el.localName + goodClasses(el).map((c) => "." + esc(c)).join("");
    const parent = el.parentElement;
    if (parent) {
      const twins = Array.from(parent.children).filter((c) => {
        try { return c.matches(seg); } catch { return false; }
      });
      if (twins.length > 1) seg += `:nth-of-type(${nthOfType(el)})`;
    }
    return seg;
  }

  function get(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el === document.documentElement) return "html";
    if (el === document.body) return "body";

    const moved = el.getAttribute("data-sd-moved");
    if (moved) return `[data-sd-moved="${esc(moved)}"]`;

    if (goodId(el.id) && isUnique("#" + esc(el.id), el)) return "#" + esc(el.id);

    for (const attr of ["data-testid", "data-test", "data-qa", "aria-label", "name"]) {
      const v = el.getAttribute(attr);
      if (v && v.length < 60) {
        const sel = `${el.localName}[${attr}="${esc(v)}"]`;
        if (isUnique(sel, el)) return sel;
      }
    }

    const parts = [];
    for (let cur = el; cur && cur !== document.documentElement; cur = cur.parentElement) {
      if (cur !== el && goodId(cur.id) && isUnique("#" + esc(cur.id), cur)) {
        parts.unshift("#" + esc(cur.id));
        break;
      }
      const curMoved = cur !== el && cur.getAttribute("data-sd-moved");
      if (curMoved) {
        parts.unshift(`[data-sd-moved="${esc(curMoved)}"]`);
        break;
      }
      parts.unshift(cur === document.body ? "body" : segment(cur));
      const candidate = parts.join(" > ");
      if (isUnique(candidate, el)) return candidate;
    }
    return parts.join(" > ");
  }

  // Selektor für "alle ähnlichen Elemente": gleicher Tag + gleiche (stabile) Klassen.
  function similar(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    const classes = goodClasses(el);
    const sel = el.localName + classes.map((c) => "." + esc(c)).join("");
    try {
      const count = document.querySelectorAll(sel).length;
      // Nur Tag ohne Klassen ist zu breit (z. B. alle <div>), außer bei typischen Inhalts-Tags.
      if (!classes.length && !/^(h[1-6]|p|a|img|button|li|blockquote|figure|table)$/.test(el.localName)) return null;
      return count > 1 ? { selector: sel, count } : null;
    } catch {
      return null;
    }
  }

  function query(sel) {
    try { return document.querySelector(sel); } catch { return null; }
  }

  return { get, similar, query, isUnique };
})();
