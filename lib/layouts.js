// Layout-Verbesserungen: einzeln zuschaltbare Änderungen an der Bedienoberfläche (nicht nur Farbe/Schrift)
// sowie fertige Layout-Pakete, die mehrere Verbesserungen (und optional ein Farbthema) kombinieren.
// Gespeichert wird in data.layout als { featureId: Option } – fehlt ein Eintrag, ist die Verbesserung aus.
// Farben kommen aus dem aktiven Farbthema (CSS-Variablen aus templates.js), sonst aus neutralen Standardwerten.
window.SDLayouts = window.SDLayouts || (() => {
  const ACCENT = "var(--sd-accent, #2563eb)";
  const BORDER = "var(--sd-border, rgba(15, 23, 42, .12))";
  const CARD = "color-mix(in srgb, var(--sd-surface, #ffffff) 55%, var(--sd-bg, #ffffff))";
  const BTN = ":where(button, input[type='submit'], input[type='button'], input[type='reset'], .btn, .button, a[role='button'])";
  const FIELD = ":where(input:not([type='checkbox'], [type='radio'], [type='submit'], [type='button'], [type='reset'], [type='hidden'], [type='range'], [type='color']), textarea, select)";

  const FEATURES = [
    {
      id: "readable", icon: "📖", name: "Lesbarer Inhaltsbereich",
      desc: "Hauptinhalt mittig mit angenehmer Zeilenlänge und Zeilenabstand",
      option: { label: "Breite", choices: [["680", "Schmal"], ["820", "Mittel"], ["1100", "Breit"]], default: "820" },
      css: (w) => `
:where(main, [role="main"], article) { max-width: ${Number(w) || 820}px !important; margin-left: auto !important; margin-right: auto !important; box-sizing: border-box !important; }
:where(body) :where(p, li, dd) { line-height: 1.7 !important; }
:where(body) :where(p) { margin-top: 0 !important; margin-bottom: 1.1em !important; }`,
    },
    {
      id: "typography", icon: "🔤", name: "Ausgewogene Typografie",
      desc: "Klare Überschriften-Hierarchie, ausgeglichene Umbrüche, Silbentrennung",
      css: () => `
:where(body) { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
:where(body) :where(h1) { font-size: clamp(1.9rem, 2.4vw + 1rem, 2.9rem) !important; line-height: 1.15 !important; letter-spacing: -.02em !important; }
:where(body) :where(h2) { font-size: clamp(1.45rem, 1.4vw + .9rem, 2rem) !important; line-height: 1.2 !important; letter-spacing: -.01em !important; }
:where(body) :where(h3) { font-size: clamp(1.15rem, .6vw + .9rem, 1.4rem) !important; line-height: 1.3 !important; }
:where(body) :where(h1, h2, h3, h4) { text-wrap: balance; font-weight: 700 !important; }
:where(body) :where(p, li) { text-wrap: pretty; hyphens: auto; }`,
    },
    {
      id: "spacing", icon: "↕️", name: "Luftigere Abstände",
      desc: "Mehr Weißraum zwischen Abschnitten und Überschriften",
      option: { label: "Stärke", choices: [["1", "Etwas"], ["2", "Viel"]], default: "1" },
      css: (s) => {
        const f = s === "2" ? 2 : 1.3;
        return `
:where(body) :where(section, article, aside) { margin-top: ${1.2 * f}rem !important; margin-bottom: ${1.2 * f}rem !important; }
:where(body) :where(h1, h2, h3) { margin-top: ${0.9 * f}em !important; margin-bottom: .5em !important; }
:where(body) :where(header, footer) { padding-top: ${0.6 * f}rem !important; padding-bottom: ${0.6 * f}rem !important; }`;
      },
    },
    {
      id: "stickyHeader", icon: "📌", name: "Fixierte Kopfzeile",
      desc: "Kopfbereich bleibt beim Scrollen oben sichtbar",
      css: () => `
:where(body > header, body > div > header, body > [role="banner"], body > div > [role="banner"]) {
  position: sticky !important; top: 0 !important; z-index: 1000 !important;
  box-shadow: 0 2px 14px rgba(0, 0, 0, .08) !important;
}`,
    },
    {
      id: "nav", icon: "🧭", name: "Moderne Navigation",
      desc: "Menüpunkte als gut klickbare Flächen mit Hover-Effekt",
      css: () => `
:where(nav, [role="navigation"]) :where(li) { list-style: none !important; }
:where(nav, [role="navigation"]) :where(a) {
  display: inline-block !important; padding: .45em .9em !important; border-radius: 999px !important;
  text-decoration: none !important; transition: background-color .15s ease, color .15s ease !important;
}
:where(nav, [role="navigation"]) :where(a):hover, :where(nav, [role="navigation"]) :where(a[aria-current]) {
  background-color: color-mix(in srgb, ${ACCENT} 14%, transparent) !important;
}`,
    },
    {
      id: "cards", icon: "🃏", name: "Karten-Optik",
      desc: "Artikel, Seitenleisten und Kacheln als abgesetzte Karten",
      option: { label: "Stil", choices: [["shadow", "Schatten"], ["border", "Umrandet"], ["flat", "Flach"]], default: "shadow" },
      css: (style) => {
        const look = style === "border"
          ? `border: 1px solid ${BORDER} !important; box-shadow: none !important;`
          : style === "flat"
            ? `border: 0 !important; box-shadow: none !important; background-color: var(--sd-surface, #f4f6f8) !important;`
            : `border: 1px solid ${BORDER} !important; box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 8px 24px rgba(0,0,0,.07) !important;`;
        return `
:where(body) :where(article, aside, [class*="card"], [class*="Card"], [class*="tile"], [class*="teaser"]):where(:not([class*="cards"], [class*="Cards"], [class*="tiles"])) {
  background-color: ${CARD} !important; border-radius: var(--sd-radius, 14px) !important;
  padding: 1.1rem 1.25rem !important; box-sizing: border-box !important; ${look}
  transition: transform .18s ease, box-shadow .18s ease !important;
}
:where(body) :where([class*="card"], [class*="Card"], [class*="tile"], [class*="teaser"]):hover { transform: translateY(-2px) !important; }`;
      },
    },
    {
      id: "buttons", icon: "🔘", name: "Moderne Buttons & Formulare",
      desc: "Größere Klickflächen, Hover-Effekte, deutliche Fokus-Rahmen",
      option: { label: "Form", choices: [["4px", "Eckig"], ["10px", "Rund"], ["999px", "Pille"]], default: "10px" },
      css: (r) => `
:where(body) ${BTN} {
  padding: .6em 1.15em !important; border-radius: ${r} !important; font-weight: 600 !important; cursor: pointer !important;
  transition: filter .15s ease, transform .15s ease, box-shadow .15s ease !important;
}
:where(body) ${BTN}:hover { filter: brightness(1.07) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(0,0,0,.14) !important; }
:where(body) ${FIELD} {
  padding: .6em .8em !important; border-radius: ${r === "999px" ? "12px" : r} !important;
  border: 1px solid ${BORDER} !important; min-height: 2.5em !important; box-sizing: border-box !important;
}
:where(body) :where(a, button, input, textarea, select, [tabindex]):focus-visible {
  outline: 3px solid color-mix(in srgb, ${ACCENT} 50%, transparent) !important; outline-offset: 2px !important;
}`,
    },
    {
      id: "links", icon: "🔗", name: "Dezente Links",
      desc: "Feinere Unterstreichung, sanfter Farbwechsel beim Überfahren",
      css: () => `
:where(body) :where(a) { text-decoration-thickness: 1px !important; text-underline-offset: .2em !important; transition: color .15s ease, text-decoration-color .15s ease !important; }
:where(body) :where(p, li) :where(a):hover { text-decoration-thickness: 2px !important; }`,
    },
    {
      id: "images", icon: "🖼️", name: "Schönere Bilder",
      desc: "Abgerundete Ecken, nie breiter als der Bildschirm",
      css: () => `
:where(body) :where(img, video, picture, iframe) { max-width: 100% !important; border-radius: var(--sd-radius, 10px) !important; }
:where(article, main) :where(figure) { margin: 1.5em 0 !important; }
:where(body) :where(figcaption) { font-size: .9em !important; opacity: .75 !important; margin-top: .5em !important; }`,
    },
    {
      id: "tables", icon: "📊", name: "Übersichtliche Tabellen",
      desc: "Mehr Innenabstand, Zebrastreifen, hervorgehobene Kopfzeile",
      css: () => `
:where(body) :where(table) { border-collapse: collapse !important; width: 100% !important; border-radius: var(--sd-radius, 8px) !important; overflow: hidden !important; }
:where(body) :where(th, td) { padding: .6em .85em !important; border-bottom: 1px solid ${BORDER} !important; text-align: left !important; }
:where(body) :where(th) { background-color: color-mix(in srgb, ${ACCENT} 12%, transparent) !important; font-weight: 700 !important; }
:where(body) :where(tbody tr:nth-child(even)) :where(td) { background-color: color-mix(in srgb, currentColor 4%, transparent) !important; }`,
    },
    {
      id: "focus", icon: "🎯", name: "Fokus-Modus",
      desc: "Seitenleisten ausblenden – nur der Hauptinhalt bleibt",
      css: () => `
:where(aside, [role="complementary"]) { display: none !important; }`,
    },
    {
      id: "smooth", icon: "🌊", name: "Weiches Scrollen",
      desc: "Sprünge zu Abschnitten laufen sanft statt ruckartig",
      css: () => `html { scroll-behavior: smooth !important; }`,
    },
    {
      id: "progress", icon: "📏", name: "Lesefortschritt",
      desc: "Schmaler Balken oben zeigt, wie weit du gelesen hast",
      widget: true,
    },
    {
      id: "backToTop", icon: "⬆️", name: "Nach-oben-Button",
      desc: "Runder Button unten rechts bringt dich zurück zum Seitenanfang",
      widget: true,
    },
  ];

  const PACKS = [
    {
      id: "blog", name: "Blog & Artikel", desc: "Ruhiges Lesen langer Texte",
      preview: { narrow: true, lines: 6 },
      layout: { readable: "820", typography: true, spacing: "1", links: true, images: true, smooth: true, progress: true, backToTop: true },
    },
    {
      id: "app", name: "Moderne Web-App", desc: "Karten, fixierte Kopfzeile, runde Buttons",
      template: "minimal", preview: { cards: 3 },
      layout: { stickyHeader: true, nav: true, cards: "shadow", buttons: "10px", spacing: "1", typography: true, images: true, tables: true, backToTop: true },
    },
    {
      id: "fokus", name: "Fokus & Lesen", desc: "Ohne Seitenleisten, ruhig lesen",
      preview: { narrow: true, lines: 5, noSidebar: true },
      layout: { readable: "680", focus: true, typography: true, spacing: "2", links: true, progress: true },
    },
    {
      id: "barrierearm", name: "Barrierearm", desc: "Große Klickflächen, klare Fokus-Rahmen",
      preview: { lines: 4, big: true },
      layout: { buttons: "10px", nav: true, spacing: "2", typography: true, links: true, tables: true, smooth: true, backToTop: true },
    },
    {
      id: "dashboard", name: "Dunkles Dashboard", desc: "Umrandete Karten auf Nachtblau",
      template: "nachtblau", preview: { cards: 4, dark: true },
      layout: { stickyHeader: true, nav: true, cards: "border", buttons: "4px", tables: true, images: true, typography: true },
    },
    {
      id: "magazin", name: "Magazin", desc: "Zeitungs-Look mit Karten und Bildern",
      template: "zeitung", preview: { cards: 2, lines: 3 },
      layout: { cards: "flat", images: true, typography: true, spacing: "1", nav: true, links: true, progress: true },
    },
  ];

  function find(id) {
    return FEATURES.find((f) => f.id === id) || null;
  }

  function activeCount(layout) {
    return Object.keys(layout || {}).filter((k) => layout[k] && find(k)).length;
  }

  function css(layout) {
    if (!layout) return "";
    let out = "";
    for (const f of FEATURES) {
      const v = layout[f.id];
      if (!v || !f.css) continue;
      // Nur bekannte Optionswerte zulassen: Gespeicherte Daten können importiert (fremd) sein
      // und würden sonst ungeprüft ins Stylesheet eingesetzt.
      let opt = v;
      if (f.option && !f.option.choices.some(([c]) => c === String(v))) opt = f.option.default;
      out += f.css(opt) + "\n";
    }
    return out;
  }

  // Widgets (Fortschrittsbalken, Nach-oben-Button) brauchen echte Elemente; sie leben in einem
  // eigenen Shadow DOM, damit das Seiten-CSS sie nicht verändert. Farben erben sie über CSS-Variablen.
  let widgetHost = null;
  let widgetUi = null;

  function buildWidgets() {
    widgetHost = document.createElement("sd-widgets");
    widgetHost.style.cssText = "all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483646;";
    const root = widgetHost.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      .bar { position: fixed; top: 0; left: 0; height: 3px; width: 0; background: var(--sd-accent, #2563eb); transition: width .1s linear; pointer-events: none; }
      .top {
        position: fixed; right: 22px; bottom: 22px; width: 46px; height: 46px; border-radius: 50%; border: 0; cursor: pointer;
        background: var(--sd-accent, #2563eb); color: var(--sd-accent-text, #fff); font: 700 20px/1 system-ui, sans-serif;
        box-shadow: 0 6px 20px rgba(0,0,0,.25); opacity: 0; transform: translateY(12px); pointer-events: none;
        transition: opacity .2s ease, transform .2s ease;
      }
      .top.show { opacity: .92; transform: none; pointer-events: auto; }
      .top:hover { opacity: 1; }
      [hidden] { display: none !important; }`;
    const bar = document.createElement("div");
    bar.className = "bar";
    const top = document.createElement("button");
    top.className = "top";
    top.title = "Nach oben";
    top.textContent = "↑";
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    root.append(style, bar, top);
    widgetUi = { bar, top };
    window.addEventListener("scroll", updateWidgets, { passive: true });
    window.addEventListener("resize", updateWidgets, { passive: true });
  }

  function updateWidgets() {
    if (!widgetUi) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    widgetUi.bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
    widgetUi.top.classList.toggle("show", window.scrollY > 500);
  }

  function syncWidgets(layout) {
    const progress = !!(layout && layout.progress);
    const backToTop = !!(layout && layout.backToTop);
    if (!progress && !backToTop) {
      if (widgetHost) widgetHost.remove();
      return;
    }
    if (!widgetHost) buildWidgets();
    widgetUi.bar.hidden = !progress;
    widgetUi.top.hidden = !backToTop;
    if (!widgetHost.isConnected) document.documentElement.append(widgetHost);
    updateWidgets();
  }

  return { FEATURES, PACKS, find, activeCount, css, syncWidgets };
})();
