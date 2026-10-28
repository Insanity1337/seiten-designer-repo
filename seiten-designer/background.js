// Injiziert den Editor in einen Tab. Die Bibliotheken werden mitgeladen, falls der Tab
// schon offen war, bevor die Erweiterung installiert wurde (sie schützen sich gegen Doppel-Laden).
const EDITOR_FILES = ["lib/store.js", "lib/selector.js", "lib/templates.js", "lib/layouts.js", "content/apply.js", "content/editor.css.js", "content/editor.js"];

async function toggleEditor(tabId) {
  await browser.scripting.executeScript({ target: { tabId }, files: EDITOR_FILES });
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.cmd === "toggle-editor") return toggleEditor(msg.tabId);
});

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-editor") return;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab) toggleEditor(tab.id).catch((e) => console.warn("Seiten-Designer:", e));
});
