const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('📱 Capturing MOBILE screenshots...\n');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    });

    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    // Mobile Light Mode
    console.log('1️⃣  Mobile Light Mode with Skip Button');
    await page.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    await page.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) toggle.click();
      }
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '../screenshot-mobile-light-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-light-with-skip.png');

    // Mobile Dark Mode
    console.log('2️⃣  Mobile Dark Mode with Skip Button');
    await page.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.click();
    });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: '../screenshot-mobile-dark-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-dark-with-skip.png');

    // Click skip and wait
    console.log('3️⃣  Mobile Dark Mode After Skip');
    const skipButton = await page.$('.skip-button');
    if (skipButton) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({
      path: '../screenshot-mobile-dark-completed.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-dark-completed.png\n');

    console.log('✨ Mobile screenshots completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
