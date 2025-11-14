const { chromium } = require('playwright');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-software-rasterizer'
      ]
    });

    // =====================================
    // DESKTOP SCREENSHOTS
    // =====================================
    console.log('\n📸 Capturing DESKTOP screenshots...\n');

    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const desktopPage = await desktopContext.newPage();

    // Desktop Light Mode with Skip Button
    console.log('1️⃣  Desktop Light Mode - Animation with Skip Button');
    await desktopPage.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(2000); // Wait for animation to start

    // Make sure we're in light mode
    await desktopPage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('button[id="theme-toggle"], .theme-toggle');
        if (toggle) toggle.click();
      }
    });
    await desktopPage.waitForTimeout(500);

    await desktopPage.screenshot({
      path: '../screenshot-desktop-light-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-desktop-light-with-skip.png');

    // Desktop Dark Mode with Skip Button
    console.log('2️⃣  Desktop Dark Mode - Animation with Skip Button');
    await desktopPage.evaluate(() => {
      const toggle = document.querySelector('button[id="theme-toggle"], .theme-toggle');
      if (toggle) toggle.click();
    });
    await desktopPage.waitForTimeout(800);

    await desktopPage.screenshot({
      path: '../screenshot-desktop-dark-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-desktop-dark-with-skip.png');

    // Desktop Dark Mode - Click Skip Button
    console.log('3️⃣  Desktop Dark Mode - After clicking Skip');
    const skipButton = await desktopPage.$('.skip-button');
    if (skipButton) {
      await skipButton.click();
      await desktopPage.waitForTimeout(1000);
    }

    await desktopPage.screenshot({
      path: '../screenshot-desktop-dark-completed.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-desktop-dark-completed.png');

    await desktopContext.close();

    // =====================================
    // MOBILE SCREENSHOTS
    // =====================================
    console.log('\n📱 Capturing MOBILE screenshots...\n');

    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone X dimensions
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const mobilePage = await mobileContext.newPage();

    // Mobile Light Mode with Skip Button
    console.log('4️⃣  Mobile Light Mode - Animation with Skip Button');
    await mobilePage.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(2000);

    // Make sure we're in light mode
    await mobilePage.evaluate(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.classList.contains('dark')) {
        const toggle = document.querySelector('button[id="theme-toggle"], .theme-toggle');
        if (toggle) toggle.click();
      }
    });
    await mobilePage.waitForTimeout(500);

    await mobilePage.screenshot({
      path: '../screenshot-mobile-light-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-light-with-skip.png');

    // Mobile Dark Mode with Skip Button
    console.log('5️⃣  Mobile Dark Mode - Animation with Skip Button');
    await mobilePage.evaluate(() => {
      const toggle = document.querySelector('button[id="theme-toggle"], .theme-toggle');
      if (toggle) toggle.click();
    });
    await mobilePage.waitForTimeout(800);

    await mobilePage.screenshot({
      path: '../screenshot-mobile-dark-with-skip.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-dark-with-skip.png');

    // Mobile Dark Mode - After Skip
    console.log('6️⃣  Mobile Dark Mode - After clicking Skip');
    const mobileSkipButton = await mobilePage.$('.skip-button');
    if (mobileSkipButton) {
      await mobileSkipButton.click();
      await mobilePage.waitForTimeout(1000);
    }

    await mobilePage.screenshot({
      path: '../screenshot-mobile-dark-completed.png',
      fullPage: false
    });
    console.log('   ✅ Saved: screenshot-mobile-dark-completed.png');

    await mobileContext.close();

    // =====================================
    // CLOSE UP OF SKIP BUTTON
    // =====================================
    console.log('\n🔍 Capturing CLOSE-UP of Skip Button...\n');

    const closeupContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const closeupPage = await closeupContext.newPage();
    await closeupPage.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 30000 });
    await closeupPage.waitForTimeout(1500);

    // Zoom in on the skip button
    const buttonElement = await closeupPage.$('.skip-button');
    if (buttonElement) {
      const boundingBox = await buttonElement.boundingBox();
      if (boundingBox) {
        console.log('7️⃣  Close-up of Skip Button (Light Mode)');
        await closeupPage.screenshot({
          path: '../screenshot-skip-button-closeup-light.png',
          clip: {
            x: Math.max(0, boundingBox.x - 20),
            y: Math.max(0, boundingBox.y - 20),
            width: boundingBox.width + 40,
            height: boundingBox.height + 40
          }
        });
        console.log('   ✅ Saved: screenshot-skip-button-closeup-light.png');

        // Dark mode closeup
        await closeupPage.evaluate(() => {
          const toggle = document.querySelector('button[id="theme-toggle"], .theme-toggle');
          if (toggle) toggle.click();
        });
        await closeupPage.waitForTimeout(500);

        console.log('8️⃣  Close-up of Skip Button (Dark Mode)');
        await closeupPage.screenshot({
          path: '../screenshot-skip-button-closeup-dark.png',
          clip: {
            x: Math.max(0, boundingBox.x - 20),
            y: Math.max(0, boundingBox.y - 20),
            width: boundingBox.width + 40,
            height: boundingBox.height + 40
          }
        });
        console.log('   ✅ Saved: screenshot-skip-button-closeup-dark.png');
      }
    }

    await closeupContext.close();

    console.log('\n✨ All screenshots captured successfully!');
    console.log('📂 Screenshots saved to: /home/user/itsme/\n');

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
