import serverUrl from "./serverUrl.js";

async function getStoredValue(key) {
  let value = await browser.storage.sync.get(key);
  let textValue = value[`${key}`];
  return textValue ? textValue : "";
}

async function sendEvent(url) {
  let token = await getStoredValue("token");
  if (token) {
    let eventData = {
      type: "general",
      token: token,
      url: url,
    };
    const response = await fetch(`${serverUrl}/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
  }
}

let prev = {
  url: null,
  timestamp: null,
};

let regexWatchList = null;
const delay = 5;
async function handleEvent(tabId, changeInfo, tabInfo) {
  const url = changeInfo.url;
  if (url && regexWatchList.some((regexUrl) => url.match(regexUrl))) {
    const timestamp = Date.now();
    const elapsed = timestamp - prev.timestamp;
    if (url !== prev.url || elapsed > delay * 1000) {
      await sendEvent(url);
    }
    prev.url = url;
    prev.timestamp = timestamp;
  }
}

function updateRegexWatchList(watchList) {
  regexWatchList = [];
  if (watchList) {
    watchList.forEach((url) => {
      url = url.replaceAll(".", "\\.");
      url = url.replaceAll("*", ".*");
      let regexUrl = new RegExp(url);
      regexWatchList.push(regexUrl);
    });
  }
}

async function updateWatchlist() {
  let watchList = await getStoredValue("watchList");
  updateRegexWatchList(watchList);
  browser.tabs.onUpdated.removeListener(handleEvent);
  if (watchList.length) {
    browser.tabs.onUpdated.addListener(handleEvent);
    /*
    browser.tabs.onUpdated.addListener(handleEvent, {
      urls: watchList,
      properties: ["url"],
    });
    */
  }
}

async function handleUpdate(changes, areaName) {
  if (areaName !== "sync") return;
  await updateWatchlist();
}

async function initPage() {
  await updateWatchlist();
}

initPage();

browser.storage.onChanged.addListener(handleUpdate);
