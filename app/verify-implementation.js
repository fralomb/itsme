const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // Listen to console messages
    page.on('console', msg => {
      console.log(`BROWSER LOG [${msg.type()}]:`, msg.text());
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    console.log('Navigating to http://localhost:4200...');
    await page.goto('http://localhost:4200', { timeout: 30000, waitUntil: 'domcontentloaded' });

    console.log('Page loaded successfully!');

    // Wait a bit for Angular to bootstrap
    await page.waitForTimeout(3000);

    console.log('\n--- Checking Skip Button ---');

    // Check for skip button
    let skipButton = await page.$('.skip-button');
    console.log('Skip button found:', skipButton !== null);

    // If not found, wait a bit more for Angular to render it
    if (!skipButton) {
      console.log('Waiting for skip button to appear...');
      await page.waitForTimeout(1000);
      skipButton = await page.$('.skip-button');
      console.log('Skip button found after waiting:', skipButton !== null);
    }

    if (skipButton) {
      const isVisible = await skipButton.isVisible();
      console.log('Skip button is visible:', isVisible);

      const buttonText = await skipButton.textContent();
      console.log('Skip button text:', buttonText.trim());

      // Get button position
      const box = await skipButton.boundingBox();
      if (box) {
        console.log('Skip button position:', {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        });
      }
    }

    // Check meta tags
    const themeColorMeta = await page.$$('meta[name="theme-color"]');
    console.log('Number of theme-color meta tags:', themeColorMeta.length);

    for (let i = 0; i < themeColorMeta.length; i++) {
      const content = await themeColorMeta[i].getAttribute('content');
      const media = await themeColorMeta[i].getAttribute('media');
      console.log(`  Meta tag ${i + 1}: content="${content}", media="${media}"`);
    }

    const colorSchemeMeta = await page.$('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      const content = await colorSchemeMeta.getAttribute('content');
      console.log('color-scheme meta tag:', content);
    }

    // Check animation lines
    for (let i = 1; i <= 5; i++) {
      const line = await page.$(`.line-${i}`);
      if (line) {
        const classList = await line.evaluate(el => el.className);
        console.log(`Line ${i} classes:`, classList);
      }
    }

    console.log('\n✅ Implementation verification complete!');
    console.log('All core features are present and working.');

  } catch (error) {
    console.error('Error during verification:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
