const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./reports/combined-accessibility-report.json', 'utf-8'));

// ==========================
// DEDUPLICATE ISSUES (ROOT CAUSE)
// ==========================
const issueMap = {};

data.pages.forEach(page => {
  if (!page.violations) return;

  page.violations.forEach(v => {
    if (!issueMap[v.id]) {
      issueMap[v.id] = {
        id: v.id,
        description: v.description,
        help: v.help,
        impact: v.impact,
        helpUrl: v.helpUrl,
        occurrences: 0,
        pages: new Set()
      };
    }

    issueMap[v.id].occurrences += v.nodes.length;
    issueMap[v.id].pages.add(page.name);
  });
});

// Convert Set → Array
const dedupedIssues = Object.values(issueMap).map(i => ({
  ...i,
  pages: Array.from(i.pages),
  pageCount: i.pages.size
}));

// ==========================
// WCAG COMPLIANCE SCORE
// ==========================
const totalPages = data.summary.totalPagesScanned;
const pagesWithoutIssues = data.summary.pagesWithNoViolations;

const complianceScore = ((pagesWithoutIssues / totalPages) * 100).toFixed(2);

// ==========================
// TOP ISSUES
// ==========================
const topIssues = dedupedIssues
  .sort((a, b) => b.occurrences - a.occurrences)
  .slice(0, 10);

// ==========================
// ENRICH FINAL DATA
// ==========================
const enriched = {
  ...data,
  insights: {
    complianceScore,
    topIssues,
    totalUniqueIssues: dedupedIssues.length
  },
  deduplicatedIssues: dedupedIssues
};

fs.writeFileSync('./reports/enriched-report.json', JSON.stringify(enriched, null, 2));

console.log("✅ Enterprise JSON Ready");