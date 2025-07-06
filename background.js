let activeTabId = null;
let activeStartTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    handleTabChange(tab);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs.length > 0) {
        handleTabChange(tabs[0]);
      }
    });
  }
});

function handleTabChange(tab) {
  stopTracking();

  activeTabId = tab.id;
  activeStartTime = Date.now();
}

function stopTracking() {
  if (activeTabId !== null && activeStartTime !== null) {
    const timeSpent = Date.now() - activeStartTime;
    chrome.tabs.get(activeTabId, (tab) => {
      if (tab && tab.url) {
        const url = new URL(tab.url).hostname;
        storeTime(url, timeSpent);
      }
    });
  }
  activeTabId = null;
  activeStartTime = null;
}

function storeTime(domain, timeSpent) {
  chrome.storage.local.get([domain], (result) => {
    const previous = result[domain] || 0;
    chrome.storage.local.set({ [domain]: previous + timeSpent });
  });
}

chrome.runtime.onSuspend.addListener(() => {
  stopTracking();
});