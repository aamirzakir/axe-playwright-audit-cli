const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.google.com/');

  console.log('🔐 Login manually');
  console.log('➡️ Navigate to ANY authenticated page');
  console.log('➡️ Press ENTER in terminal when done');

  process.stdin.resume();
  await new Promise(resolve => process.stdin.once('data', resolve));

  await context.storageState({ path: 'storageState.json' });
  console.log('✅ Session saved');

  await browser.close();
})();
