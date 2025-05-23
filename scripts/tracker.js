let startTime = Date.now();
let hostname = window.location.hostname;
let pageUrl = window.location.href;

// Get tracking settings
chrome.storage.local.get(['trackingEnabled', 'trackingInterval'], (settings) => {
  if (!settings.trackingEnabled) return;

  // Default to 15 minutes if not set
  const intervalMinutes = settings.trackingInterval || 15;
  const intervalMs = intervalMinutes * 60 * 1000;

  // Save data at each interval
  const saveInterval = setInterval(() => {
    const timeSpentMs = Date.now() - startTime;
    const timeSpentSec = Math.floor(timeSpentMs / 1000);

    chrome.storage.local.get(['trackingData'], (result) => {
      let trackingData = result.trackingData || [];
      trackingData.push({
        url: pageUrl,
        domain: hostname,
        timeSpent: timeSpentSec,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ trackingData }, () => {
        console.log('Tracking data saved:', trackingData); // <-- Add this line
      });
    });

    startTime = Date.now(); // Reset timer for next interval
  }, intervalMs);

  // Also save on unload
  window.addEventListener('beforeunload', () => {
    clearInterval(saveInterval);
    const timeSpentMs = Date.now() - startTime;
    const timeSpentSec = Math.floor(timeSpentMs / 1000);

    chrome.storage.local.get(['trackingData']).then((result) => {
      let trackingData = result.trackingData || [];
      trackingData.push({
        url: pageUrl,
        domain: hostname,
        timeSpent: timeSpentSec,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ trackingData }, () => {
        console.log('Tracking data saved:', trackingData); // <-- Add this line
      });
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "forceSave") {
    // Save current session immediately
    const timeSpentMs = Date.now() - startTime;
    const timeSpentSec = Math.floor(timeSpentMs / 1000);
    chrome.storage.local.get(['trackingData'], (result) => {
      let trackingData = result.trackingData || [];
      trackingData.push({
        url: pageUrl,
        domain: hostname,
        timeSpent: timeSpentSec,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ trackingData });
      startTime = Date.now(); // Reset timer
    });
  }
});