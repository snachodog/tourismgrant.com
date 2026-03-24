/* ============================================================
   Choteau Area Community Tourism Grant – project.js
   Shared script for individual project detail pages
   ============================================================ */

const DATA_URL = 'data/allocations.json';

const PALETTE = {
  earth:      '#6b4f2a',
  earthLight: '#a07850',
  sage:       '#7a8c6e',
  sky:        '#4a7fa5',
  stone:      '#f4f0eb',
  stoneDark:  '#e2dbd0',
};

function formatDollar(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

function getProjectId() {
  return document.documentElement.dataset.project;
}

function renderStats(project) {
  const totalSpent = project.yearlySpend
    .filter(y => y.confirmed)
    .reduce((sum, y) => sum + y.total, 0);
  const pct = project.totalAllocated > 0
    ? Math.round((totalSpent / project.totalAllocated) * 100)
    : 0;

  // Stat cards
  document.getElementById('stat-allocated').textContent = formatDollar(project.totalAllocated);
  document.getElementById('stat-spent').textContent     = formatDollar(totalSpent);
  document.getElementById('stat-remaining').textContent = formatDollar(project.totalAllocated - totalSpent);
  document.getElementById('stat-pct').textContent       = pct + '%';

  // Progress bar
  document.getElementById('progress-fill').style.width      = pct + '%';
  document.getElementById('progress-pct-label').textContent = pct + '% of allocated budget expended';
}

function renderChart(project) {
  const ctx = document.getElementById('chart-spending').getContext('2d');
  const labels = project.yearlySpend.map(y => y.year);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Spent',
          data: project.yearlySpend.map(y => y.confirmed ? y.total : 0),
          backgroundColor: PALETTE.earth,
          borderRadius: 4,
        },
        {
          label: 'Planned',
          data: project.yearlySpend.map(y => y.confirmed ? 0 : y.total),
          backgroundColor: PALETTE.stoneDark,
          borderRadius: 4,
        },
      ],
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
            callback: v => '$' + (v >= 1000000
              ? (v / 1000000).toFixed(1) + 'M'
              : v.toLocaleString()),
          },
          grid: { color: PALETTE.stoneDark },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderTable(project) {
  const tbody = document.getElementById('spending-tbody');
  let grandTotal = 0;

  project.yearlySpend.forEach(yr => {
    // Year header row
    const yearRow = document.createElement('tr');
    yearRow.className = 'year-row' + (yr.confirmed ? '' : ' year-row-planned');
    yearRow.innerHTML = `
      <td colspan="2">${yr.year}${yr.confirmed ? '' : ' <span class="planned-tag">Planned</span>'}</td>
      <td class="amount-cell">${formatDollar(yr.total)}</td>`;
    tbody.appendChild(yearRow);

    // Line items
    yr.lineItems.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding-left:1.5rem; color: var(--color-text-muted);" colspan="2">${item.description}</td>
        <td class="amount-cell">${formatDollar(item.amount)}</td>`;
      tbody.appendChild(row);
    });

    grandTotal += yr.total;
  });

  // Total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';
  totalRow.innerHTML = `
    <td colspan="2">Total Spent to Date</td>
    <td class="amount-cell">${formatDollar(grandTotal)}</td>`;
  tbody.appendChild(totalRow);
}

function renderMilestones(project) {
  const list = document.getElementById('milestones-list');
  project.milestones.forEach(m => {
    const li = document.createElement('li');
    li.className = 'milestone-item';
    const dotClass = m.status === 'complete' ? 'complete'
                   : m.status === 'in-progress' ? 'in-progress'
                   : 'pending';
    li.innerHTML = `
      <span class="milestone-dot ${dotClass}" aria-hidden="true"></span>
      <span>
        <span class="milestone-text">${m.label}</span><br>
        <span class="milestone-year">${m.fiscalYear}</span>
      </span>`;
    list.appendChild(li);
  });
}

function renderGoals(project) {
  const list = document.getElementById('goals-list');
  project.goals.forEach(g => {
    const li = document.createElement('li');
    li.textContent = g;
    list.appendChild(li);
  });
}

async function init() {
  const projectId = getProjectId();
  let data;

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Failed to load allocations.json');
    data = await res.json();
  } catch (err) {
    console.error('Data load error:', err);
    return;
  }

  const project = data.projectDetails.find(p => p.id === projectId);
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }

  renderStats(project);
  renderChart(project);
  renderTable(project);
  renderMilestones(project);
  renderGoals(project);
}

document.addEventListener('DOMContentLoaded', init);
