const { chromium } = require('playwright');

/**
 * Mobile screenshot capture script for skip button feature
 */

(async () => {
  let browser;
  try {
    console.log('📱 MOBILE SCREENSHOTS');
    console.log('=' .repeat(50));

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone X dimensions
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const mobilePage = await mobileContext.newPage();

    // Mobile - Light Mode with Skip Button
    console.log('📸 1/4: Mobile Light Mode - Skip button visible during animation');
    await mobilePage.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(2500);

    // Ensure light mode
    await mobilePage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
        if (toggle) toggle.click();
      }
    });
    await mobilePage.waitForTimeout(500);

    await mobilePage.screenshot({
      path: '../screenshots/mobile-light-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/mobile-light-skip-button.png\n');

    // Mobile - Dark Mode with Skip Button
    console.log('📸 2/4: Mobile Dark Mode - Skip button visible during animation');
    await mobilePage.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
      if (toggle) toggle.click();
    });
    await mobilePage.waitForTimeout(800);

    await mobilePage.screenshot({
      path: '../screenshots/mobile-dark-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/mobile-dark-skip-button.png\n');

    // Mobile - After Skip (Dark Mode)
    console.log('📸 3/4: Mobile Dark Mode - After clicking skip button');
    const mobileSkipButton = await mobilePage.$('.skip-button');
    if (mobileSkipButton) {
      await mobileSkipButton.click();
      await mobilePage.waitForTimeout(1000);
    }

    await mobilePage.screenshot({
      path: '../screenshots/mobile-dark-after-skip.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/mobile-dark-after-skip.png\n');

    // Mobile - Full page view showing footer clearance
    console.log('📸 4/4: Mobile Dark Mode - Full page showing footer clearance');
    await mobilePage.reload({ waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);

    // Switch to dark mode again
    await mobilePage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (!appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
        if (toggle) toggle.click();
      }
    });
    await mobilePage.waitForTimeout(500);

    await mobilePage.screenshot({
      path: '../screenshots/mobile-dark-full-page.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/mobile-dark-full-page.png\n');

    await mobileContext.close();

    console.log('=' .repeat(50));
    console.log('✨ Mobile screenshot capture completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Error capturing mobile screenshots:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
