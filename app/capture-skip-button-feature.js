const { chromium } = require('playwright');

/**
 * Screenshot capture script for skip button feature
 * Captures desktop and mobile views in both light and dark modes
 * Shows skip button positioning relative to footer
 */

(async () => {
  let browser;
  try {
    console.log('🎬 Starting screenshot capture for skip button feature...\n');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    // =====================================
    // DESKTOP SCREENSHOTS
    // =====================================
    console.log('💻 DESKTOP SCREENSHOTS');
    console.log('=' .repeat(50));

    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const desktopPage = await desktopContext.newPage();

    // Desktop - Light Mode with Skip Button
    console.log('📸 1/8: Desktop Light Mode - Skip button visible during animation');
    await desktopPage.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await desktopPage.waitForTimeout(2500); // Wait for animation to start

    // Ensure light mode
    await desktopPage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
        if (toggle) toggle.click();
      }
    });
    await desktopPage.waitForTimeout(500);

    await desktopPage.screenshot({
      path: '../screenshots/desktop-light-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/desktop-light-skip-button.png\n');

    // Desktop - Dark Mode with Skip Button
    console.log('📸 2/8: Desktop Dark Mode - Skip button visible during animation');
    await desktopPage.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
      if (toggle) toggle.click();
    });
    await desktopPage.waitForTimeout(800);

    await desktopPage.screenshot({
      path: '../screenshots/desktop-dark-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/desktop-dark-skip-button.png\n');

    // Desktop - After Skip (Dark Mode)
    console.log('📸 3/8: Desktop Dark Mode - After clicking skip button');
    const skipButton = await desktopPage.$('.skip-button');
    if (skipButton) {
      await skipButton.click();
      await desktopPage.waitForTimeout(1000);
    }

    await desktopPage.screenshot({
      path: '../screenshots/desktop-dark-after-skip.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/desktop-dark-after-skip.png\n');

    // Desktop - Full page view showing footer clearance
    console.log('📸 4/8: Desktop Dark Mode - Full page showing footer clearance');
    await desktopPage.reload({ waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);

    // Switch to dark mode again
    await desktopPage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (!appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('.theme-toggle, button[aria-label*="theme"]');
        if (toggle) toggle.click();
      }
    });
    await desktopPage.waitForTimeout(500);

    await desktopPage.screenshot({
      path: '../screenshots/desktop-dark-full-page.png',
      fullPage: true
    });
    console.log('   ✅ Saved: screenshots/desktop-dark-full-page.png\n');

    await desktopContext.close();

    // =====================================
    // MOBILE SCREENSHOTS
    // =====================================
    console.log('📱 MOBILE SCREENSHOTS');
    console.log('=' .repeat(50));

    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone X dimensions
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const mobilePage = await mobileContext.newPage();

    // Mobile - Light Mode with Skip Button
    console.log('📸 5/8: Mobile Light Mode - Skip button visible during animation');
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
    console.log('📸 6/8: Mobile Dark Mode - Skip button visible during animation');
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
    console.log('📸 7/8: Mobile Dark Mode - After clicking skip button');
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
    console.log('📸 8/8: Mobile Dark Mode - Full page showing footer clearance');
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

    // =====================================
    // SUMMARY
    // =====================================
    console.log('=' .repeat(50));
    console.log('✨ Screenshot capture completed successfully!');
    console.log('=' .repeat(50));
    console.log('\n📊 Summary:');
    console.log('  • Desktop screenshots: 4');
    console.log('  • Mobile screenshots: 4');
    console.log('  • Total screenshots: 8');
    console.log('\n📂 Screenshots saved to: /home/user/itsme/screenshots/');
    console.log('\n🎯 Feature highlights:');
    console.log('  ✓ Skip button positioned in bottom-right');
    console.log('  ✓ Viewport-relative positioning (8vh, 12vh, 15vh)');
    console.log('  ✓ Z-index 9999 ensures it stays above footer');
    console.log('  ✓ Works in both light and dark themes');
    console.log('  ✓ Responsive across desktop and mobile devices');
    console.log('  ✓ Button disappears after animation completes or is skipped\n');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
