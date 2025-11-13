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

    console.log('Navigating to http://localhost:4200...');
    await page.goto('http://localhost:4200', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n--- Debug: Checking for skip button ---');

    // Check the entire HTML structure of the wrapper
    const wrapperHTML = await page.$eval('.wrapper', el => el.innerHTML);
    console.log('Wrapper HTML (first 500 chars):', wrapperHTML.substring(0, 500));

    // Check if button exists at all (even if hidden)
    const allButtons = await page.$$('button');
    console.log('Total buttons on page:', allButtons.length);

    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const className = await btn.getAttribute('class');
      const ariaLabel = await btn.getAttribute('aria-label');
      const isVisible = await btn.isVisible();
      console.log(`Button ${i + 1}: class="${className}", aria-label="${ariaLabel}", visible=${isVisible}`);
    }

    // Check if ngIf is false
    const mainComponent = await page.evaluate(() => {
      const appMain = document.querySelector('app-main');
      return {
        exists: !!appMain,
        innerHTML: appMain ? appMain.innerHTML.substring(0, 200) : null
      };
    });
    console.log('\napp-main component:', mainComponent);

    // Check Angular component state
    const componentState = await page.evaluate(() => {
      // Try to access Angular component instance
      const element = document.querySelector('app-main');
      if (element && element.__ngContext__) {
        try {
          // Get component instance from Angular debug info
          const context = element.__ngContext__;
          return {
            hasContext: true,
            contextType: typeof context
          };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { hasContext: false };
    });
    console.log('\nComponent state:', componentState);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
