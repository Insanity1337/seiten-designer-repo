const $ = (id) => document.getElementById(id);
const ALL_SITES = { origins: ["<all_urls>"] };

let tab = null;
let host = "";
let resetArmed = false;

function message(text, isError = false) {
  $("msg").textContent = text;
  $("msg").classList.toggle("err", isError);
}

function canModify(url) {
  return /^(https?|file):/.test(url || "") && !/^https:\/\/(addons\.mozilla\.org|accounts-static\.cdn\.mozilla\.net)/.test(url);
}

async function renderStats() {
  const data = await SDStore.get(host);
  $("enabled").checked = data.enabled;
  const parts = [];
  if (data.template) parts.push("Farbthema aktiv");
  const layouts = Object.values(data.layout).filter(Boolean).length;
  if (layouts) parts.push(`${layouts} Layout-Verbesserungen`);
  const styled = Object.keys(data.rules).length;
  if (styled) parts.push(`${styled} ${styled === 1 ? "Element" : "Elemente"} gestaltet`);
  if (data.moves.length) parts.push(`${data.moves.length} verschoben`);
  if (SDStore.isThemeActive(data.theme)) parts.push("Seiten-Theme aktiv");
  $("stats").textContent = parts.length ? parts.join(" · ") : "Noch keine Anpassungen auf dieser Domain.";
}

async function init() {
  [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  host = SDStore.hostOf(tab.url);
  $("host").textContent = host === "lokale-datei" ? "Lokale Datei" : `Gilt für alle Seiten von ${host}`;

  if (!canModify(tab.url)) {
    $("blocked").hidden = false;
    return;
  }
  $("main").hidden = false;
  $("perm").hidden = await browser.permissions.contains(ALL_SITES);
  renderStats();
}

$("grant").addEventListener("click", async () => {
  const ok = await browser.permissions.request(ALL_SITES);
  $("perm").hidden = ok;
  if (ok) message("Zugriff erteilt. Lade die Seite neu, falls nötig.");
});

$("edit").addEventListener("click", async () => {
  try {
    await browser.runtime.sendMessage({ cmd: "toggle-editor", tabId: tab.id });
    window.close();
  } catch (e) {
    message("Editor konnte nicht gestartet werden: " + e.message, true);
  }
});

$("enabled").addEventListener("change", async (e) => {
  const data = await SDStore.get(host);
  data.enabled = e.target.checked;
  await SDStore.set(host, data);
  message(data.enabled ? "Anpassungen eingeschaltet." : "Original-Ansicht – Anpassungen bleiben gespeichert.");
});

$("export").addEventListener("click", async () => {
  const data = await SDStore.get(host);
  await navigator.clipboard.writeText(JSON.stringify({ seitenDesigner: 1, host, data }, null, 2));
  message("Anpassungen in die Zwischenablage kopiert.");
});

$("import").addEventListener("click", () => {
  $("importBox").hidden = !$("importBox").hidden;
  if (!$("importBox").hidden) $("importText").focus();
});

$("importApply").addEventListener("click", async () => {
  try {
    const parsed = JSON.parse($("importText").value);
    const data = SDStore.normalize(parsed.data || parsed);
    await SDStore.set(host, data);
    $("importBox").hidden = true;
    $("importText").value = "";
    renderStats();
    message("Anpassungen übernommen.");
  } catch {
    message("Das sieht nicht nach kopierten Anpassungen aus.", true);
  }
});

$("reset").addEventListener("click", async () => {
  const btn = $("reset");
  if (!resetArmed) {
    resetArmed = true;
    btn.classList.add("confirm");
    btn.textContent = "Sicher?";
    setTimeout(() => {
      resetArmed = false;
      btn.classList.remove("confirm");
      btn.textContent = "Zurücksetzen";
    }, 3000);
    return;
  }
  await SDStore.remove(host);
  renderStats();
  message(`Alle Anpassungen für ${host} gelöscht.`);
});

init();
