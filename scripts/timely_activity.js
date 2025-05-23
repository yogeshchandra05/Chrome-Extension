// This script is responsible for rendering the activity charts and handling the export functionality.
// It uses the Chart.js library to create pie charts for daily, weekly, and monthly activity.
document.addEventListener('DOMContentLoaded', () => {
  const periods = ['daily', 'weekly', 'monthly'];

  periods.forEach(period => {
    renderChart(period);
    setupExportButton(period);
  });
});

// Helpers

function getTimeRange(period) {
  const now = new Date();
  if (period === 'daily') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return [start, end];
  }

  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }

  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return [start, end];
  }

  return [null, null];
}

function filterDataByPeriod(data, period) {
  const [start, end] = getTimeRange(period);
  return data.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= start && itemDate <= end;
  });
}

function aggregateTime(data) {
  const domainMap = {};
  data.forEach(item => {
    if (!domainMap[item.domain]) domainMap[item.domain] = 0;
    domainMap[item.domain] += item.timeSpent;
  });
  return {
    labels: Object.keys(domainMap),
    minutes: Object.values(domainMap).map(seconds => (seconds / 60).toFixed(1))
  };
}

function renderChart(period) {
  chrome.storage.local.get(['trackingData'], (result) => {
    const data = result.trackingData || [];
    const filteredData = filterDataByPeriod(data, period);
    const content = document.getElementById(`${period}-activity-list-content`);
    const ctx = document.getElementById(`${period}Chart`)?.getContext('2d');
    content.innerHTML = '';

    if (!ctx) {
      console.error(`Canvas element for ${period} not found!`);
      content.textContent = `Error: Unable to load ${period} chart.`;
      return;
    }

    if (filteredData.length === 0) {
      content.textContent = `No activity ${period === 'daily' ? 'yet today' : `this ${period}`}.`;
      return;
    }

    const { labels, minutes } = aggregateTime(filteredData);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: `Minutes spent (${period})`,
          data: minutes,
          backgroundColor: [
            '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949',
            '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
          ]
        }]
      },
      options: {
        responsive: false
      }
    });
  });
}

function setupExportButton(period) {
  const button = document.getElementById(`export${capitalize(period)}Btn`);
  if (!button) return;

  button.addEventListener('click', () => {
    chrome.storage.local.get(['trackingData'], (result) => {
      const data = result.trackingData || [];
      const filteredData = filterDataByPeriod(data, period);

      if (filteredData.length === 0) {
        alert(`No tracking data available for this ${period}.`);
        return;
      }

      const headers = ['URL', 'Domain', 'Time Spent (minutes)', 'Timestamp'];
      const rows = filteredData.map(item => [
        `"${item.url}"`,
        `"${item.domain}"`,
        (item.timeSpent / 60).toFixed(1),
        `"${item.timestamp}"`
      ]);

      const csvContent = [headers.join(',')].concat(rows.map(r => r.join(','))).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${period}_tracking_report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
