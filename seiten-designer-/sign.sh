#!/usr/bin/env bash
# Lässt die Erweiterung von Mozilla signieren (macOS/Linux). Kanal und Store-Angaben: web-ext-config.mjs
# Die API-Zugangsdaten gibt es unter https://addons.mozilla.org/developers/addon/api/key/
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "${WEB_EXT_API_KEY:-}" ]; then
  read -r -p "AMO JWT-Aussteller (user:...): " WEB_EXT_API_KEY
fi
if [ -z "${WEB_EXT_API_SECRET:-}" ]; then
  read -r -s -p "AMO JWT-Geheimnis: " WEB_EXT_API_SECRET
  echo
fi
export WEB_EXT_API_KEY WEB_EXT_API_SECRET

npx --yes web-ext@10.7.0 lint
npx --yes web-ext@10.7.0 sign
echo
echo "Fertig. Bei Kanal \"listed\" prüft Mozilla die Version; danach erscheint sie im Add-on-Store."
