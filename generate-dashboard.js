const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./reports/enriched-report.json', 'utf-8'));

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Accessibility Dashboard</title>
  <style>
    body { font-family: Arial; margin: 20px; background:#f5f7fa; }
    h1 { color:#333; }
    .grid { display:flex; gap:20px; flex-wrap:wrap; }
    .card {
      background:white;
      padding:20px;
      border-radius:10px;
      box-shadow:0 2px 6px rgba(0,0,0,0.1);
      flex:1;
      min-width:200px;
    }
    table {
      width:100%;
      border-collapse:collapse;
      margin-top:20px;
      background:white;
    }
    th, td {
      padding:10px;
      border:1px solid #ddd;
      text-align:left;
    }
    th { background:#eee; }
  </style>
</head>

<body>

<h1>Accessibility Dashboard</h1>

<div class="grid">
  <div class="card"><b>Total Pages</b><br>${data.summary.totalPagesScanned}</div>
  <div class="card"><b>Total Violations</b><br>${data.summary.totalViolations}</div>
  <div class="card"><b>Passed Pages</b><br>${data.summary.pagesWithNoViolations}</div>
  <div class="card"><b>Compliance Score</b><br><h2>${data.insights.complianceScore}%</h2></div>
</div>

<h2>Severity Breakdown</h2>
<ul>
  <li>Critical: ${data.summary.severityBreakdown.critical}</li>
  <li>Serious: ${data.summary.severityBreakdown.serious}</li>
  <li>Moderate: ${data.summary.severityBreakdown.moderate}</li>
  <li>Minor: ${data.summary.severityBreakdown.minor}</li>
</ul>

<h2>Top Issues (Root Causes)</h2>
<table>
<tr><th>Issue</th><th>Occurrences</th><th>Pages Affected</th></tr>
${data.insights.topIssues.map(i => `
<tr>
<td>${i.id}</td>
<td>${i.occurrences}</td>
<td>${i.pageCount}</td>
</tr>
`).join('')}
</table>

<h2>Page-wise Data</h2>
<table>
<tr>
<th>Page</th><th>Violations</th><th>Critical</th><th>Serious</th><th>Moderate</th><th>Minor</th>
</tr>
${data.pages.map(p => `
<tr>
<td>${p.name}</td>
<td>${p.violationsCount || 0}</td>
<td>${p.severitySummary?.critical || 0}</td>
<td>${p.severitySummary?.serious || 0}</td>
<td>${p.severitySummary?.moderate || 0}</td>
<td>${p.severitySummary?.minor || 0}</td>
</tr>
`).join('')}
</table>

</body>
</html>
`;

fs.writeFileSync('./reports/dashboard.html', html);

console.log("✅ Enterprise HTML Dashboard Generated");