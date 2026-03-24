/* ============================================================
   Choteau Area Community Tourism Grant – main.js
   ============================================================ */

const DATA_URL = 'data/allocations.json';

// Chart.js color palette (Montana earth tones)
const PALETTE = {
  earth:      '#6b4f2a',
  earthLight: '#a07850',
  sage:       '#7a8c6e',
  sageLight:  '#c2cebc',
  sky:        '#4a7fa5',
  skyLight:   '#d0e4f0',
  accent:     '#b35a1f',
  stone:      '#f4f0eb',
  stoneDark:  '#e2dbd0',
};

const PIE_COLORS = [PALETTE.earth, PALETTE.sky, PALETTE.sage];

// Utility: format dollar amounts
function formatDollar(n) {
  if (!n) return '$0';
  return '$' + Number(n).toLocaleString('en-US');
}

// Build Annual Allocation bar chart
function buildAnnualChart(data) {
  const ctx = document.getElementById('chart-annual').getContext('2d');
  const labels = data.annualAllocations.map(d => String(d.year));
  const values = data.annualAllocations.map(d => d.amount);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Annual Grant Funding',
        data: values,
        backgroundColor: PALETTE.earth,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatDollar(ctx.parsed.y),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => '$' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
          },
          grid: { color: '#e2dbd0' },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

// Build Project Allocation donut chart
function buildProjectChart(data) {
  const ctx = document.getElementById('chart-projects').getContext('2d');
  const labels = data.projectAllocations.map(d => d.name);
  const values = data.projectAllocations.map(d => d.amount);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Project Allocation',
        data: values,
        backgroundColor: PIE_COLORS,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, padding: 12, boxWidth: 14 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + formatDollar(ctx.parsed),
          },
        },
      },
    },
  });
}

// Build Community Fund bar chart
function buildCommunityChart(data) {
  const ctx = document.getElementById('chart-community').getContext('2d');
  const labels = data.communityFundAnnual.map(d => String(d.year));
  const values = data.communityFundAnnual.map(d => d.amount);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Community Tourism Fund',
        data: values,
        backgroundColor: PALETTE.sage,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatDollar(ctx.parsed.y),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => '$' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
          },
          grid: { color: '#e2dbd0' },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

// Main init
async function init() {
  let data;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Failed to load allocations.json');
    data = await res.json();
  } catch (err) {
    console.error('Data load error:', err);
    return;
  }

  buildAnnualChart(data);
  buildProjectChart(data);
  buildCommunityChart(data);
}

document.addEventListener('DOMContentLoaded', init);
