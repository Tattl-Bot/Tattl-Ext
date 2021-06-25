const filter = {
  urls: ["*://*.youtube.com/*"],
  properties: ["url"],
};

var port = browser.runtime.connectNative("accountability_bot");

port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

let prev = {
  url: null,
  timestamp: null,
};
const delay = 5;
function sendMsg(tabId, changeInfo, tabInfo) {
  const url = changeInfo.url;
  const timestamp = Date.now();
  const elapsed = timestamp - prev.timestamp;
  if (url !== prev.url || elapsed > delay * 1000) {
    port.postMessage({
      type: "youtube",
      url: changeInfo.url,
    });
  }
  prev.url = url;
  prev.timestamp = timestamp;
}

// Send custom msg via console (for debugging)
function msg(msg) {
  port.postMessage(msg);
}

browser.tabs.onUpdated.addListener(sendMsg, filter);
