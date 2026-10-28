// Vorgefertigte Design-Vorlagen. Jede Vorlage gestaltet die ganze Seite neu (Farben, Schriften, Ecken).
// Alle Selektoren stehen in :where() (Spezifität 0), damit eigene Element-Anpassungen immer Vorrang haben.
window.SDTemplates = window.SDTemplates || (() => {
  const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  const LIST = [
    {
      id: "minimal", name: "Modern & Minimal", desc: "Hell, klar, viel Weißraum",
      bg: "#ffffff", surface: "#f4f6f8", text: "#1f2933", muted: "#64748b", heading: "#0f172a",
      accent: "#2563eb", accentText: "#ffffff", border: "#e2e8f0", font: SANS, headingFont: SANS, radius: "10px",
    },
    {
      id: "zeitung", name: "Klassische Zeitung", desc: "Serifenschrift auf Papierton",
      bg: "#fbf8f1", surface: "#f1ebdd", text: "#2b2620", muted: "#6b6255", heading: "#1a1612",
      accent: "#8b1e1e", accentText: "#ffffff", border: "#d9cfbb", font: "Georgia, 'Times New Roman', serif",
      headingFont: "'Times New Roman', Times, serif", radius: "0px",
    },
    {
      id: "nachtblau", name: "Nachtblau", desc: "Dunkles Design, augenschonend",
      bg: "#0f172a", surface: "#1e293b", text: "#cbd5e1", muted: "#94a3b8", heading: "#f1f5f9",
      accent: "#38bdf8", accentText: "#0f172a", border: "#334155", font: SANS, headingFont: SANS, radius: "8px",
    },
    {
      id: "pastell", name: "Pastell", desc: "Sanfte Farben, runde Ecken",
      bg: "#fdf6f9", surface: "#f3e8ff", text: "#4b3f57", muted: "#8a7d96", heading: "#7c3aed",
      accent: "#db2777", accentText: "#ffffff", border: "#ead9f2", font: "'Trebuchet MS', sans-serif",
      headingFont: "'Trebuchet MS', sans-serif", radius: "16px",
    },
    {
      id: "natur", name: "Natur", desc: "Grüntöne, ruhig und freundlich",
      bg: "#f4f7f0", surface: "#e3ecd9", text: "#2f3b2a", muted: "#667a5c", heading: "#3f6212",
      accent: "#15803d", accentText: "#ffffff", border: "#cbd8bd", font: "Verdana, Geneva, sans-serif",
      headingFont: "Georgia, serif", radius: "6px",
    },
    {
      id: "warm", name: "Warm & Gemütlich", desc: "Creme, Terrakotta, weiche Schrift",
      bg: "#fff8f0", surface: "#ffedd5", text: "#431407", muted: "#9a6a4f", heading: "#9a3412",
      accent: "#ea580c", accentText: "#ffffff", border: "#fed7aa", font: "Georgia, serif",
      headingFont: "Georgia, serif", radius: "12px",
    },
    {
      id: "terminal", name: "Retro-Terminal", desc: "Grüne Schrift auf Schwarz",
      bg: "#0c0c0c", surface: "#161616", text: "#33ff66", muted: "#1fae47", heading: "#7dff9a",
      accent: "#ffcc00", accentText: "#000000", border: "#1f3d27", font: "'Courier New', Consolas, monospace",
      headingFont: "'Courier New', Consolas, monospace", radius: "0px",
    },
    {
      id: "kontrast", name: "Hoher Kontrast", desc: "Maximal lesbar, barrierearm",
      bg: "#000000", surface: "#111111", text: "#ffffff", muted: "#e5e5e5", heading: "#ffff00",
      accent: "#00ffff", accentText: "#000000", border: "#ffffff", font: "Verdana, Geneva, sans-serif",
      headingFont: "Verdana, Geneva, sans-serif", radius: "0px",
    },
  ];

  const NO_FONT = "code, pre, kbd, samp, i, [class*='icon'], [class*='fa-'], .material-icons, .material-symbols-outlined";

  function find(id) {
    return LIST.find((t) => t.id === id) || null;
  }

  function css(id) {
    const t = find(id);
    if (!t) return "";
    return `
:root {
  --sd-bg: ${t.bg}; --sd-surface: ${t.surface}; --sd-text: ${t.text}; --sd-muted: ${t.muted};
  --sd-heading: ${t.heading}; --sd-accent: ${t.accent}; --sd-accent-text: ${t.accentText};
  --sd-border: ${t.border}; --sd-font: ${t.font}; --sd-hfont: ${t.headingFont}; --sd-radius: ${t.radius};
}
:where(html, body) { background: var(--sd-bg) !important; color: var(--sd-text) !important; }
:where(body) :where(div, section, article, main, aside, ul, ol, li, dl, dt, dd, table, thead, tbody, tfoot, tr, td, th, form, fieldset, figure, figcaption, span, p, label, blockquote, small, strong, em, b) {
  background-color: transparent !important; color: inherit !important; border-color: var(--sd-border) !important;
}
/* Große Bereiche: auch Verläufe/Hintergrundbilder entfernen, damit die Vorlagenfarbe durchscheint. */
:where(body) :where(section, main, article, aside) { background-image: none !important; }
:where(body) :where(header, nav, footer, [role="banner"], [role="navigation"], [role="contentinfo"]) {
  background: var(--sd-surface) !important; color: var(--sd-text) !important; border-color: var(--sd-border) !important;
}
:where(body, body *:not(${NO_FONT})) { font-family: var(--sd-font) !important; }
:where(body) :where(h1, h2, h3, h4, h5, h6) { font-family: var(--sd-hfont) !important; color: var(--sd-heading) !important; }
:where(body) :where(a, a:visited) { color: var(--sd-accent) !important; }
:where(body) :where(header, nav, footer) :where(a, a:visited) { color: var(--sd-text) !important; }
:where(body) :where(button, input[type="submit"], input[type="button"], .btn, .button) {
  background: var(--sd-accent) !important; color: var(--sd-accent-text) !important;
  border: 0 !important; border-radius: var(--sd-radius) !important;
}
:where(body) :where(input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"]), textarea, select) {
  background: var(--sd-surface) !important; color: var(--sd-text) !important;
  border: 1px solid var(--sd-border) !important; border-radius: var(--sd-radius) !important;
}
:where(body) :where(img, video, iframe) { border-radius: var(--sd-radius) !important; }
:where(body) :where(code, pre, kbd) { background: var(--sd-surface) !important; color: var(--sd-text) !important; }
:where(body) :where(hr) { border-color: var(--sd-border) !important; }
:where(body) :where(blockquote) { border-left: 4px solid var(--sd-accent) !important; color: var(--sd-muted) !important; }
::selection { background: var(--sd-accent); color: var(--sd-accent-text); }
`;
  }

  return { LIST, find, css };
})();
