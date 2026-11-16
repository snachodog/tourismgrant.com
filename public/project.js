/* ============================================================
   Choteau Area Community Tourism Grant – project.js
   Shared script for individual project detail pages
   ============================================================ */

const DATA_URL = '/data/allocations.json';
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTE = {
  earth:      '#b9812a',
  earthLight: '#cc9a44',
  sage:       '#7c8b6f',
  sky:        '#35597a',
  stone:      '#eeede4',
  stoneDark:  '#e1dfd0',
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
      ...(REDUCE_MOTION && { animation: false }),
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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fillDataTable(tbodyId, rows) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  rows.forEach(cells => {
    const tr = document.createElement('tr');
    cells.forEach((text, i) => {
      const cell = el(i === 0 ? 'th' : 'td', '', text);
      if (i === 0) cell.scope = 'row';
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  });
}

function renderChartData(project) {
  fillDataTable('data-spending-body', project.yearlySpend.map(y => [
    String(y.year),
    formatDollar(y.confirmed ? y.total : 0),
    formatDollar(y.confirmed ? 0 : y.total),
  ]));
}

function renderTable(project) {
  const tbody = document.getElementById('spending-tbody');
  let grandTotal = 0;

  project.yearlySpend.forEach(yr => {
    // Year header row
    const yearRow = el('tr', 'year-row' + (yr.confirmed ? '' : ' year-row-planned'));
    const yearCell = el('td', '', yr.year);
    yearCell.colSpan = 2;
    if (!yr.confirmed) {
      yearCell.appendChild(document.createTextNode(' '));
      yearCell.appendChild(el('span', 'planned-tag', 'Planned'));
    }
    yearRow.appendChild(yearCell);
    yearRow.appendChild(el('td', 'amount-cell', formatDollar(yr.total)));
    tbody.appendChild(yearRow);

    // Line items
    yr.lineItems.forEach(item => {
      const row = document.createElement('tr');
      const desc = el('td', 'spending-item', item.description);
      desc.colSpan = 2;
      row.appendChild(desc);
      row.appendChild(el('td', 'amount-cell', formatDollar(item.amount)));
      tbody.appendChild(row);
    });

    grandTotal += yr.total;
  });

  // Total row
  const totalRow = el('tr', 'total-row');
  const totalLabel = el('td', '', 'Total Spent to Date');
  totalLabel.colSpan = 2;
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(el('td', 'amount-cell', formatDollar(grandTotal)));
  tbody.appendChild(totalRow);
}

function renderMilestones(project) {
  const list = document.getElementById('milestones-list');
  project.milestones.forEach(m => {
    const dotClass = m.status === 'complete' ? 'complete'
                   : m.status === 'in-progress' ? 'in-progress'
                   : 'pending';
    const li = el('li', 'milestone-item');
    const dot = el('span', 'milestone-dot ' + dotClass);
    dot.setAttribute('aria-hidden', 'true');
    const body = document.createElement('span');
    body.appendChild(el('span', 'milestone-text', m.label));
    body.appendChild(document.createElement('br'));
    body.appendChild(el('span', 'milestone-year', m.fiscalYear));
    li.appendChild(dot);
    li.appendChild(body);
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
  renderChartData(project);
  renderTable(project);
  renderMilestones(project);
  renderGoals(project);
  renderChart(project);
}

document.addEventListener('DOMContentLoaded', init);
