// Einstellungen für Mozillas Werkzeug web-ext (lint, build, sign).
export default {
  artifactsDir: "dist",
  ignoreFiles: ["test", "dist", "web-ext-config.mjs", "sign.ps1", "sign.sh", "amo-metadata.json", "*.md"],
  build: { overwriteDest: true },
  sign: {
    // "listed" = öffentlich im Add-on-Store (addons.mozilla.org), wird von Mozilla geprüft.
    // Für eine private, nur signierte Version stattdessen "unlisted" eintragen.
    channel: "listed",
    // Store-Angaben (Kurzbeschreibung, Kategorie, Lizenz, Support) für die erste öffentliche Einreichung.
    amoMetadata: "amo-metadata.json",
  },
};
