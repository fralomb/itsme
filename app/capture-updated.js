const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('📸 Capturing updated screenshots...\n');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    });

    // Desktop screenshot
    console.log('1️⃣  Desktop Dark Mode - Skip button in bottom-right');
    const desktopContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await desktopPage.waitForTimeout(2500);

    // Switch to dark mode
    await desktopPage.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.click();
    });
    await desktopPage.waitForTimeout(800);

    await desktopPage.screenshot({
      path: '../screenshot-desktop-dark-bottom-right.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-desktop-dark-bottom-right.png');
    await desktopContext.close();

    // Mobile screenshot
    console.log('2️⃣  Mobile Dark Mode - Skip button with footer spacing');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(2500);

    // Switch to dark mode
    await mobilePage.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.click();
    });
    await mobilePage.waitForTimeout(800);

    await mobilePage.screenshot({
      path: '../screenshot-mobile-dark-bottom-right.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-dark-bottom-right.png');
    await mobileContext.close();

    console.log('\n✨ Updated screenshots captured!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
