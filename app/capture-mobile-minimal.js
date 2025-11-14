const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:4200', { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('Screenshot 1...');
    await page.screenshot({ path: '../screenshots/mobile-light-skip-button.png', fullPage: true });

    await page.click('.theme-toggle');
    await page.waitForTimeout(1000);

    console.log('Screenshot 2...');
    await page.screenshot({ path: '../screenshots/mobile-dark-skip-button.png', fullPage: true });

    const skip = await page.$('.skip-button');
    if (skip) await skip.click();
    await page.waitForTimeout(1000);

    console.log('Screenshot 3...');
    await page.screenshot({ path: '../screenshots/mobile-dark-after-skip.png', fullPage: true });

    await page.reload();
    await page.waitForTimeout(2000);
    await page.click('.theme-toggle');
    await page.waitForTimeout(500);

    console.log('Screenshot 4...');
    await page.screenshot({ path: '../screenshots/mobile-dark-full-page.png', fullPage: true });

    console.log('Done!');
  } finally {
    await browser.close();
  }
})();
