const KEY = "shortsBlockerEnabled";

async function getEnabled() {
  const data = await chrome.storage.local.get(KEY);
  return data[KEY] ?? true;
}

async function setBadge(enabled) {
  await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({ color: enabled ? "#15803d" : "#6b7280" });
  await chrome.action.setTitle({
    title: enabled ? "YouTube Shorts Blocker: ON" : "YouTube Shorts Blocker: OFF",
  });
}

async function syncBadge() {
  const enabled = await getEnabled();
  await setBadge(enabled);
}

chrome.runtime.onInstalled.addListener(() => {
  syncBadge();
});

chrome.runtime.onStartup.addListener(() => {
  syncBadge();
});

chrome.action.onClicked.addListener(async (tab) => {
  const enabled = await getEnabled();
  const next = !enabled;

  await chrome.storage.local.set({ [KEY]: next });
  await setBadge(next);

  if (tab?.id && tab.url && tab.url.includes("youtube.com")) {
    await chrome.tabs.reload(tab.id);
  }
});
