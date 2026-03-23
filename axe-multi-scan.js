const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');
const path = require('path');

const URLS_TO_SCAN = [
  { name: 'google', url: 'https://www.google.com/' },
  { name: 'gmail', url: 'https://www.gmail.com/' },
  { name: 'youtube', url: 'https://www.youtube.com/' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: 'storageState.json'
  });

  const page = await context.newPage();

  fs.mkdirSync('reports', { recursive: true });

  for (const pageInfo of URLS_TO_SCAN) {
    console.log(`🔍 Scanning: ${pageInfo.name}`);

    await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

    // SPA safety wait
    await page.waitForTimeout(5000);

    const results = await new AxeBuilder({ page })
      .withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
        'wcag22aa'
      ])
      .analyze();

    const filePath = path.join('reports', `${pageInfo.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    console.log(`✅ Saved: ${filePath}`);
  }

  await browser.close();
})();
