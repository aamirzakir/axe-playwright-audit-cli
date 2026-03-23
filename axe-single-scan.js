const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');
const path = require('path');

const URLS_TO_SCAN = [ 
{
  name: 'google',
  url: 'https://google.com/'
},
{
  name: 'gmail',
  url: 'https://gmail.com/'
},
{
  name: 'youtube',
  url: 'https://youtube.com/'
},

 ];

(async () => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: 'storageState.json'
  });

  const page = await context.newPage();

  fs.mkdirSync('reports', { recursive: true });

  // ✅ MASTER REPORT OBJECT
  const combinedReport = {
    generatedAt: new Date().toISOString(),
    totalPagesPlanned: URLS_TO_SCAN.length,
    pages: [],
    summary: {}
  };

  for (const pageInfo of URLS_TO_SCAN) {
    console.log(`🔍 Scanning: ${pageInfo.name}`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(5000); // SPA stabilization

      const results = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22aa'
        ])
        .analyze();

      // ✅ Severity breakdown
      const severitySummary = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      };

      results.violations.forEach(v => {
        if (severitySummary[v.impact] !== undefined) {
          severitySummary[v.impact]++;
        }
      });

      // ✅ Push page-level data
      combinedReport.pages.push({
        name: pageInfo.name,
        url: pageInfo.url,

        violationsCount: results.violations.length,
        passesCount: results.passes.length,
        incompleteCount: results.incomplete.length,
        inapplicableCount: results.inapplicable.length,

        severitySummary,

        violations: results.violations, // keep full data for deep analysis

        timestamp: new Date().toISOString()
      });

      console.log(`✅ Completed: ${pageInfo.name}`);

    } catch (error) {
      console.error(`❌ Error scanning ${pageInfo.name}: ${error.message}`);

      combinedReport.pages.push({
        name: pageInfo.name,
        url: pageInfo.url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ✅ GLOBAL SUMMARY CALCULATION
  let totalViolations = 0;
  let totalPasses = 0;
  let totalIncomplete = 0;
  let totalInapplicable = 0;

  const globalSeverity = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };

  let passedPages = 0;
  let failedPages = 0;

  combinedReport.pages.forEach(p => {
    if (p.error) {
      failedPages++;
      return;
    }

    totalViolations += p.violationsCount;
    totalPasses += p.passesCount;
    totalIncomplete += p.incompleteCount;
    totalInapplicable += p.inapplicableCount;

    // Count passed pages (no violations)
    if (p.violationsCount === 0) {
      passedPages++;
    }

    // Aggregate severity
    globalSeverity.critical += p.severitySummary.critical;
    globalSeverity.serious += p.severitySummary.serious;
    globalSeverity.moderate += p.severitySummary.moderate;
    globalSeverity.minor += p.severitySummary.minor;
  });

  // ✅ Attach summary
  combinedReport.summary = {
    totalPagesScanned: combinedReport.pages.length,
    totalPagesPlanned: combinedReport.totalPagesPlanned,
    successfulScans: combinedReport.pages.length - failedPages,
    failedScans: failedPages,

    pagesWithNoViolations: passedPages,
    pagesWithIssues: combinedReport.pages.length - passedPages - failedPages,

    totalViolations,
    totalPasses,
    totalIncomplete,
    totalInapplicable,

    severityBreakdown: globalSeverity
  };

  // ✅ SAVE FINAL JSON
  const outputPath = path.join('reports', 'combined-accessibility-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(combinedReport, null, 2));

  console.log(`\n🎉 FINAL REPORT GENERATED: ${outputPath}`);

  await browser.close();
})();