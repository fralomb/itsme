const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('📱 Capturing mobile screenshots (simplified)...\n');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 375, height: 812 }
    });

    const page = await context.newPage();

    // Mobile - Light Mode
    console.log('📸 1/4: Mobile Light Mode...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: '../screenshots/mobile-light-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved\n');

    // Mobile - Dark Mode
    console.log('📸 2/4: Mobile Dark Mode...');
    await page.click('button');
    await page.waitForTimeout(800);

    await page.screenshot({
      path: '../screenshots/mobile-dark-skip-button.png',
      fullPage: true
    });
    console.log('   ✅ Saved\n');

    // Mobile - After Skip
    console.log('📸 3/4: Mobile After Skip...');
    const skipBtn = await page.$('.skip-button');
    if (skipBtn) await skipBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: '../screenshots/mobile-dark-after-skip.png',
      fullPage: true
    });
    console.log('   ✅ Saved\n');

    // Mobile - Full page
    console.log('📸 4/4: Mobile Full Page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.click('button');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '../screenshots/mobile-dark-full-page.png',
      fullPage: true
    });
    console.log('   ✅ Saved\n');

    console.log('✨ Mobile screenshots completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
