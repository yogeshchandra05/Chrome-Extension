document.addEventListener('DOMContentLoaded', function () {
  // Load saved settings
  chrome.storage.local.get(['trackingEnabled', 'trackingInterval'], (result) => {
    document.getElementById('trackingToggle').checked = !!result.trackingEnabled;
    if (result.trackingInterval) {
      document.getElementById('trackInterval').value = result.trackingInterval;
    }
  });

});

//export csv
document.addEventListener('DOMContentLoaded', function () {
 document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.local.get(['trackingData'], (result) => {
    console.log('Exporting data:', result.trackingData);
    const data = result.trackingData || [];
    if (data.length === 0) {
      alert('No tracking data available to export.');
      return;
    }

    // Prepare CSV headers
    const headers = ['URL', 'Domain', 'Time Spent (minutes)', 'Timestamp'];
    const rows = data.map(item => [
      `"${item.url}"`,
      `"${item.domain}"`,
      (item.timeSpent / 60).toFixed(1), // Convert seconds to minutes, 2 decimal places
      `"${item.timestamp}"`
    ]);

    // Convert to CSV string
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tracking_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});
});

// reset opions
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Are you sure you want to Reset all settings?')) {
    // Reset values in storage
    chrome.storage.local.set({
      trackingEnabled: false,
      trackingInterval: 15
    }, function () {
      // Update UI immediately
      document.getElementById('trackingToggle').checked = false;
      document.getElementById('trackInterval').value = 15;
      alert('Settings have been Reset to default.');
      location.reload();
    });
  }
});

// Save settings
document.getElementById('settingsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const trackingEnabled = document.getElementById('trackingToggle').checked;
    const trackingInterval = parseInt(document.getElementById('trackInterval').value, 10);

    chrome.storage.local.set({
        trackingEnabled,
        trackingInterval
    }, () => {
        const status = document.getElementById('statusMessage');

        // Clear any existing classes
        status.classList.remove('success', 'error');

        // Set message and show
        status.textContent = '✅ Settings saved!';
        status.classList.add('success');

        setTimeout(() => {
            status.textContent = '';
            status.classList.remove('success', 'error');
        }, 3000);
    });

    chrome.runtime.sendMessage({ action: "forceSave" });
});


