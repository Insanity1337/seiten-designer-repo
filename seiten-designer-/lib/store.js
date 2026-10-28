// Speichert die Anpassungen pro Domain in storage.local. Alle Seiten und Subdomains einer Domain
// (www.example.com, shop.example.com/…) teilen sich dieselben Anpassungen.
window.SDStore = window.SDStore || (() => {
  const PREFIX = "site:";

  // Zweistufige Endungen, bei denen die Domain aus drei Teilen besteht (z. B. bbc.co.uk).
  const MULTI_PART_SUFFIXES = new Set([
    "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "ltd.uk", "plc.uk", "co.at", "or.at", "ac.at", "gv.at",
    "com.au", "net.au", "org.au", "edu.au", "gov.au", "co.nz", "org.nz", "co.jp", "ne.jp", "or.jp", "ac.jp",
    "co.kr", "com.br", "com.cn", "com.mx", "com.ar", "com.tr", "com.pl", "co.za", "co.in", "co.il", "com.sg",
    "com.hk", "com.tw", "github.io", "gitlab.io", "netlify.app", "vercel.app", "pages.dev", "web.app",
    "firebaseapp.com", "herokuapp.com", "blogspot.com", "wordpress.com", "azurewebsites.net", "cloudfront.net",
  ]);

  // Hostname → Domain, unter der gespeichert wird: "shop.example.co.uk" → "example.co.uk".
  function siteOf(hostname) {
    if (!hostname) return "lokale-datei";
    const h = hostname.toLowerCase().replace(/\.$/, "");
    if (/^[\d.]+$/.test(h) || h.includes(":") || !h.includes(".")) return h; // IP-Adresse, localhost
    const parts = h.split(".");
    const take = MULTI_PART_SUFFIXES.has(parts.slice(-2).join(".")) ? 3 : 2;
    return parts.slice(-take).join(".");
  }

  function hostOf(url) {
    try {
      const u = new URL(url);
      return u.protocol === "file:" ? "lokale-datei" : siteOf(u.hostname);
    } catch {
      return "lokale-datei";
    }
  }

  function emptyTheme() {
    return { dark: false, contrast: false, font: "", zoom: 1, lineHeight: 0, maxWidth: 0, accent: "" };
  }

  function empty() {
    return { enabled: true, template: "", layout: {}, theme: emptyTheme(), rules: {}, moves: [] };
  }

  function normalize(raw) {
    const d = empty();
    if (!raw || typeof raw !== "object") return d;
    d.enabled = raw.enabled !== false;
    d.template = typeof raw.template === "string" ? raw.template : "";
    d.layout = raw.layout && typeof raw.layout === "object" ? raw.layout : {};
    d.theme = Object.assign(emptyTheme(), raw.theme || {});
    d.rules = raw.rules && typeof raw.rules === "object" ? raw.rules : {};
    d.moves = Array.isArray(raw.moves) ? raw.moves : [];
    return d;
  }

  async function get(site) {
    const key = PREFIX + site;
    const res = await browser.storage.local.get(key);
    if (res[key]) return normalize(res[key]);
    return normalize(await migrate(site));
  }

  // Frühere Versionen speicherten pro Hostname (z. B. "site:www.example.com").
  // Solche Einträge werden einmalig unter der Domain zusammengeführt.
  async function migrate(site) {
    const all = await browser.storage.local.get(null);
    const legacy = Object.keys(all).filter((k) => k.startsWith(PREFIX) && k !== PREFIX + site && siteOf(k.slice(PREFIX.length)) === site);
    if (!legacy.length) return null;
    const merged = empty();
    for (const k of legacy) {
      const d = normalize(all[k]);
      Object.assign(merged.rules, d.rules);
      merged.moves.push(...d.moves);
      if (d.template) merged.template = d.template;
      Object.assign(merged.layout, d.layout);
      if (isThemeActive(d.theme)) merged.theme = d.theme;
    }
    await browser.storage.local.set({ [PREFIX + site]: merged });
    await browser.storage.local.remove(legacy);
    return merged;
  }

  async function set(host, data) {
    await browser.storage.local.set({ [PREFIX + host]: data });
  }

  async function remove(host) {
    await browser.storage.local.remove(PREFIX + host);
  }

  function isThemeActive(theme) {
    const t = Object.assign(emptyTheme(), theme);
    return t.dark || t.contrast || !!t.font || t.zoom !== 1 || !!t.lineHeight || !!t.maxWidth || !!t.accent;
  }

  return { PREFIX, siteOf, hostOf, empty, emptyTheme, normalize, get, set, remove, isThemeActive };
})();
