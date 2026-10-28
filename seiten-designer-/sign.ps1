# Lässt die Erweiterung von Mozilla signieren (Windows/PowerShell). Kanal und Store-Angaben: web-ext-config.mjs
# Die API-Zugangsdaten gibt es unter https://addons.mozilla.org/developers/addon/api/key/
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $env:WEB_EXT_API_KEY) {
  $env:WEB_EXT_API_KEY = Read-Host "AMO JWT-Aussteller (user:...)"
}
if (-not $env:WEB_EXT_API_SECRET) {
  $secure = Read-Host "AMO JWT-Geheimnis" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $env:WEB_EXT_API_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

npx --yes web-ext@10.7.0 lint
npx --yes web-ext@10.7.0 sign
Write-Host "`nFertig. Bei Kanal 'listed' prüft Mozilla die Version; danach erscheint sie im Add-on-Store." -ForegroundColor Green
