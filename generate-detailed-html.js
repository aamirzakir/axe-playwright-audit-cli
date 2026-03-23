const fs = require('fs');

// Load your JSON
const data = JSON.parse(
  fs.readFileSync('./combined-accessibility-report.json', 'utf-8')
);

// 🎯 FIX MAPPING (can be expanded anytime)
const FIX_MAP = {
  "color-contrast": "Ensure text/background contrast ratio is at least 4.5:1 for normal text and 3:1 for large text.",
  "image-alt": "Add meaningful alt text to all images using <img alt='description'>.",
  "label": "Associate form inputs with labels using <label for='id'> or aria-label.",
  "aria-required-attr": "Ensure required ARIA attributes are present for elements using ARIA roles.",
  "button-name": "Ensure buttons have accessible names using text, aria-label, or aria-labelledby.",
  "link-name": "Ensure links have descriptive text.",
  "document-title": "Add a meaningful <title> to the page.",
  "html-has-lang": "Add lang attribute to <html> tag (e.g., <html lang='en'>)."
};

// fallback fix
const getFix = (id) => FIX_MAP[id] || "Refer WCAG guidelines and ensure proper semantic and accessible implementation.";

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Accessibility Full Report</title>

<style>
body { font-family: Arial; background:#f4f6f9; margin:0; }
header { background:#111827; color:white; padding:20px; text-align:center; }
.container { padding:20px; }

.card { background:white; padding:15px; margin-bottom:20px; border-radius:10px; }

.page { margin-bottom:30px; }
.violation { border-left:5px solid #dc2626; margin:10px 0; padding:10px; background:#fff; }
.node { background:#f9fafb; padding:10px; margin-top:5px; font-family: monospace; }

.summary { display:flex; gap:20px; flex-wrap:wrap; }
.summary div { background:white; padding:15px; border-radius:10px; }

button { padding:5px 10px; cursor:pointer; }

.hidden { display:none; }

.critical { color:red; }
.serious { color:orange; }
.moderate { color:goldenrod; }
.minor { color:green; }

</style>

<script>
function toggle(id){
  const el = document.getElementById(id);
  el.classList.toggle('hidden');
}
</script>

</head>

<body>

<header>
<h1>Accessibility Detailed Report</h1>
<p>Full WCAG Analysis with Fix Recommendations</p>
</header>

<div class="container">

<div class="summary">
  <div>Total Pages: ${data.summary.totalPagesScanned}</div>
  <div>Total Violations: ${data.summary.totalViolations}</div>
  <div>Passed Pages: ${data.summary.pagesWithNoViolations}</div>
</div>

<h2>Pages</h2>

${data.pages.map((page, pageIndex) => {

  if (page.error) {
    return `<div class="card">
      <h3>${page.name}</h3>
      <p style="color:red;">Error: ${page.error}</p>
    </div>`;
  }

  return `
  <div class="card page">
    <h3>${page.name}</h3>
    <p><b>URL:</b> ${page.url}</p>
    <p><b>Violations:</b> ${page.violationsCount}</p>

    <button onclick="toggle('v_${pageIndex}')">Toggle Violations</button>

    <div id="v_${pageIndex}" class="hidden">

    ${page.violations.map((v, vIndex) => `
      <div class="violation">
        <h4>${v.id} (${v.impact})</h4>
        <p>${v.description}</p>

        <p><b>Fix:</b> ${getFix(v.id)}</p>

        <button onclick="toggle('n_${pageIndex}_${vIndex}')">Show Nodes</button>

        <div id="n_${pageIndex}_${vIndex}" class="hidden">

          ${v.nodes.map(n => `
            <div class="node">
              <div><b>Target:</b> ${n.target}</div>
              <div><b>HTML:</b> ${n.html.replace(/</g,'&lt;')}</div>
              <div><b>Failure:</b> ${n.failureSummary || ''}</div>
            </div>
          `).join('')}

        </div>

      </div>
    `).join('')}

    </div>
  </div>
  `;
}).join('')}

</div>

</body>
</html>
`;

fs.writeFileSync('detailed-report.html', html);

console.log("✅ Detailed HTML Report Generated → detailed-report.html");