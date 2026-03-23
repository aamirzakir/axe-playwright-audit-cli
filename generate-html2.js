const fs = require('fs');
const path = require('path');

// Load JSON
const data = JSON.parse(
  fs.readFileSync('./combined-accessibility-report.json', 'utf-8')
);

// Helper for safe access
const get = (v, d = 0) => v ?? d;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Accessibility Report</title>

  <style>
    body {
      font-family: 'Segoe UI', Arial;
      margin: 0;
      background: #f4f6f9;
      color: #333;
    }

    header {
      background: #1f2937;
      color: white;
      padding: 20px;
      text-align: center;
    }

    .container {
      padding: 20px;
    }

    .grid {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      flex: 1;
      min-width: 200px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .card h2 {
      margin: 0;
      font-size: 26px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background: white;
      border-radius: 10px;
      overflow: hidden;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    th {
      background: #f0f0f0;
    }

    tr:hover {
      background: #fafafa;
    }

    .critical { color: #dc2626; font-weight: bold; }
    .serious { color: #ea580c; }
    .moderate { color: #ca8a04; }
    .minor { color: #16a34a; }

  </style>
</head>

<body>

<header>
  <h1>Accessibility Dashboard</h1>
  <p>Enterprise Accessibility Report</p>
</header>

<div class="container">

  <!-- SUMMARY -->
  <div class="grid">
    <div class="card">
      <p>Total Pages</p>
      <h2>${data.summary.totalPagesScanned}</h2>
    </div>

    <div class="card">
      <p>Total Violations</p>
      <h2>${data.summary.totalViolations}</h2>
    </div>

    <div class="card">
      <p>Passed Pages</p>
      <h2>${data.summary.pagesWithNoViolations}</h2>
    </div>

    <div class="card">
      <p>Compliance Score</p>
      <h2>${data.insights.complianceScore}%</h2>
    </div>
  </div>

  <!-- SEVERITY -->
  <h2>Severity Breakdown</h2>
  <div class="grid">
    <div class="card critical">Critical: ${get(data.summary.severityBreakdown.critical)}</div>
    <div class="card serious">Serious: ${get(data.summary.severityBreakdown.serious)}</div>
    <div class="card moderate">Moderate: ${get(data.summary.severityBreakdown.moderate)}</div>
    <div class="card minor">Minor: ${get(data.summary.severityBreakdown.minor)}</div>
  </div>

  <!-- TOP ISSUES -->
  <h2>Top Issues (Root Causes)</h2>
  <table>
    <tr>
      <th>Issue</th>
      <th>Occurrences</th>
      <th>Pages Affected</th>
      <th>Impact</th>
    </tr>

    ${data.insights.topIssues.map(issue => `
      <tr>
        <td>${issue.id}</td>
        <td>${issue.occurrences}</td>
        <td>${issue.pageCount}</td>
        <td>${issue.impact}</td>
      </tr>
    `).join('')}
  </table>

  <!-- PAGE DATA -->
  <h2>Page-wise Breakdown</h2>
  <table>
    <tr>
      <th>Page</th>
      <th>URL</th>
      <th>Total</th>
      <th>Critical</th>
      <th>Serious</th>
      <th>Moderate</th>
      <th>Minor</th>
    </tr>

    ${data.pages.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.url}</td>
        <td>${get(p.violationsCount)}</td>
        <td class="critical">${get(p.severitySummary?.critical)}</td>
        <td class="serious">${get(p.severitySummary?.serious)}</td>
        <td class="moderate">${get(p.severitySummary?.moderate)}</td>
        <td class="minor">${get(p.severitySummary?.minor)}</td>
      </tr>
    `).join('')}
  </table>

</div>

</body>
</html>
`;

// Write file
fs.writeFileSync('./dashboard.html', html);

console.log("✅ HTML Dashboard Generated → dashboard.html");