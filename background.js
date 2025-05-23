chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    console.log('Visited URL:', tab.url);
    // You can save tab.url to storage here
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log('Switched to tab with URL:', tab.url);
    // You can save tab.url or tabId to storage here
  });
});