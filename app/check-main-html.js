const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await page.goto('http://localhost:4200', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Get the full HTML of app-main
    const mainHTML = await page.$eval('app-main', el => el.innerHTML);
    console.log('=== FULL app-main HTML ===');
    console.log(mainHTML);

    // Check the wrapper div specifically
    const wrapperHTML = await page.$eval('app-main .wrapper', el => el.outerHTML);
    console.log('\n=== Wrapper div ===');
    console.log(wrapperHTML);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
