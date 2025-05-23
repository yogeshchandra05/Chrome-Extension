document.getElementById('help-btn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {
      url: chrome.runtime.getURL('help.html')
    });
  });
});


document.getElementById('settings-btn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {
      url: chrome.runtime.getURL('settings.html')
    });
  });
});

// function to update the minutes spent today
function updateMinutesToday() {
  chrome.storage.local.get(['trackingEnabled', 'trackingData'], (result) => {
    // Only update if tracking is enabled
    if (!result.trackingEnabled) {
      document.getElementById('today-mins').textContent = '--';
      return;
    }
    const data = result.trackingData || [];
    if (data.length === 0) {
      document.getElementById('today-mins').textContent = '0';
      return;
    }

    const now = new Date();
    // Filter only entries from today
    const todayData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      );
    });

    // Sum timeSpent in seconds
    const totalSeconds = todayData.reduce((sum, item) => sum + item.timeSpent, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);

    document.getElementById('today-mins').textContent = totalMinutes.toString();
  });
}

function updateSitesVisitedToday() {
  chrome.storage.local.get(['trackingEnabled', 'trackingData'], (result) => {
    const container = document.getElementById('sites-today');
    container.innerHTML = ''; // Clear previous

    if (!result.trackingEnabled) {
      container.textContent = 'Tracking is disabled.';
      return;
    }

    const data = result.trackingData || [];
    if (data.length === 0) {
      container.textContent = 'No sites visited today.';
      return;
    }

    const now = new Date();

    // Filter only entries from today
    const todayData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      );
    });

    // Get unique domains
    const uniqueDomains = [...new Set(todayData.map(item => item.domain))];

    if (uniqueDomains.length === 0) {
      container.textContent = 'No sites visited today.';
      return;
    }

    // Show number of unique sites
    container.textContent = `${uniqueDomains.length}`;
  });
}

//daily activity  
function updateDailyActivity() {
  
    // Filter only today's entries
    const todayData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      );
    });

    if (todayData.length === 0) {
      container.textContent = 'No activity yet today.';
      return;
    }

    // Aggregate time spent per domain
    const domainMap = {};
    todayData.forEach(item => {
      if (!domainMap[item.domain]) {
        domainMap[item.domain] = 0;
      }
      domainMap[item.domain] += item.timeSpent;
    });

    // Create a list
    const ul = document.createElement('ul');
    Object.entries(domainMap).forEach(([domain, seconds]) => {
      const li = document.createElement('li');
      li.textContent = `${domain}: ${(seconds / 60).toFixed(1)} min`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  
}

// Call this in your DOMContentLoaded handler:
document.addEventListener('DOMContentLoaded', () => {
  updateMinutesToday();
  updateSitesVisitedToday();
  updateDailyActivity();
  setInterval(() => {
    updateMinutesToday();
    updateSitesVisitedToday();
    updateDailyActivity();
  }, 5000);
});

