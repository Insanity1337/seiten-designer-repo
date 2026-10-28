# Seiten-Designer (Firefox-Erweiterung)

Passe Layout und Aussehen jeder Website visuell an – wie in einem Website-Baukasten.
Änderungen werden pro Domain gespeichert und gelten auf allen Seiten und Subdomains dieser Domain
(z. B. `www.example.com/…` und `shop.example.com/…`). Beim nächsten Besuch werden sie automatisch angewendet.

**Datenschutz:** Alle Anpassungen bleiben lokal in deinem Browser. Die Erweiterung sendet keine Daten,
lädt keinen Code nach und hat keine Netzwerkzugriffe.

## Installieren

**Aus dem Add-on-Store:** Seiten-Designer auf [addons.mozilla.org](https://addons.mozilla.org) suchen und hinzufügen.
Beim ersten Start im Popup **Zugriff erlauben** klicken, damit gespeicherte Anpassungen automatisch erscheinen.

**Aus dem Quellcode (zum Ausprobieren):**

1. In Firefox `about:debugging#/runtime/this-firefox` öffnen.
2. **Temporäres Add-on laden …** klicken und die Datei `manifest.json` aus diesem Ordner wählen.
3. Das Symbol erscheint in der Symbolleiste (ggf. über das Puzzle-Symbol anheften).

Temporäre Add-ons verschwinden beim Neustart von Firefox.

## Benutzung

- Symbol klicken → **Diese Seite bearbeiten** (oder `Alt+Shift+E`).
- **Element-Tab:** Element auf der Seite anklicken, dann Schrift, Farben, Abstände, Rahmen, Größe und
  Effekte einstellen. „Alle ähnlichen“ wendet die Änderung auf gleichartige Elemente an.
- **Verschieben:** am ausgewählten Element den orangen Griff **✥ Verschieben** ziehen.
  Mit gedrückter Umschalttaste lässt es sich auch in andere Bereiche hineinziehen.
- **Ganze Seite:** Vorlagen (Leseansicht, Dunkel, Groß & kontrastreich), Dunkelmodus, Schriftart,
  Zoom, Zeilenabstand, Lesebreite, Linkfarbe.
- **Vorlagen:** acht fertige Designs (z. B. Modern & Minimal, Klassische Zeitung, Nachtblau, Pastell,
  Retro-Terminal). Überfahren zeigt eine Vorschau, Klicken übernimmt. Eigene Element-Änderungen haben Vorrang.
- **Vorlagen → Layouts:** verbessern den Aufbau der Seite, nicht nur Farben. Sechs fertige Layout-Pakete
  (Blog & Artikel, Moderne Web-App, Fokus & Lesen, Barrierearm, Dunkles Dashboard, Magazin) oder einzeln
  per Schalter wählbar: lesbarer Inhaltsbereich, Typografie, Abstände, fixierte Kopfzeile, moderne Navigation,
  Karten-Optik, Buttons & Formulare, Links, Bilder, Tabellen, Fokus-Modus, weiches Scrollen,
  Lesefortschritt-Balken und Nach-oben-Button. Manche haben Unteroptionen (z. B. Breite, Kartenstil, Button-Form).
- `Strg+Z` / `Strg+Y` = Rückgängig / Wiederholen, `Esc` = Auswahl aufheben, ⏸ = Seite normal bedienen.
- Im Popup: Anpassungen ein-/ausschalten, kopieren/einfügen (z. B. auf einen anderen Rechner), zurücksetzen.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `content/apply.js` | Läuft auf jeder Seite, wendet gespeicherte Styles, Theme und Verschiebungen an |
| `content/editor.js` | Das schwebende Editor-Panel (nur geladen, wenn man bearbeitet) |
| `content/editor.css.js` | Styles des Panels (im Shadow DOM, unabhängig vom Seiten-CSS) |
| `lib/selector.js` | Erzeugt stabile CSS-Selektoren, damit Änderungen nach dem Neuladen wieder greifen |
| `lib/templates.js` | Die Design-Vorlagen – neue Vorlage = neuer Eintrag in `LIST` |
| `lib/layouts.js` | Layout-Verbesserungen und -Pakete, inkl. Fortschrittsbalken und Nach-oben-Button |
| `lib/store.js` | Speichern/Laden pro Domain (Subdomains werden zusammengefasst) |
| `popup/` | Menü beim Klick auf das Symbol |
| `web-ext-config.mjs`, `amo-metadata.json` | Einstellungen für Paket, Signierung und Store-Eintrag |
| `sign.sh`, `sign.ps1` | Bei Mozilla signieren und einreichen (macOS/Linux bzw. Windows) |

## Neue Version veröffentlichen (für Maintainer)

Voraussetzungen: [Node.js](https://nodejs.org) (für `npx`) und API-Zugangsdaten von
<https://addons.mozilla.org/developers/addon/api/key/> (**JWT-Aussteller** `user:…` und **JWT-Geheimnis** –
beides geheim halten, niemals einchecken).

1. In `manifest.json` die `version` erhöhen (Mozilla nimmt jede Versionsnummer nur einmal an).
   Die Add-on-ID (`browser_specific_settings.gecko.id`) **nie ändern**.
2. Signieren und einreichen:
   - macOS/Linux: `./sign.sh`
   - Windows (PowerShell): `.\sign.ps1` (falls Skripte blockiert sind: einmalig
     `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`)
3. Mozilla prüft die Version; danach ist sie im Store verfügbar.

Der Kanal steht in `web-ext-config.mjs` auf `listed` (öffentlich). Für eine private, nur signierte Version
dort `unlisted` eintragen. Nur ein unsigniertes Paket bauen: `npx web-ext@10.7.0 build`.

## Grenzen

Wenn eine Website ihren Aufbau stark ändert (Redesign, zufällig generierte Klassennamen), können
einzelne gespeicherte Anpassungen ihr Element nicht mehr finden – sie werden dann einfach ignoriert.

## Mitmachen & Support

- Fehler und Wünsche: bitte als **Issue** in diesem Repository.
- Sicherheitslücken: bitte **nicht** öffentlich, siehe [SECURITY.md](SECURITY.md).
- Kontakt: jdthereal@tuta.com

## Lizenz

[MIT](LICENSE) – frei nutzbar, veränderbar und weitergebbar, solange der Lizenzhinweis erhalten bleibt.
Ohne Gewährleistung.
