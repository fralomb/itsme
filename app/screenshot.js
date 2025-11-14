const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:4200');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Wait a bit for animation to start
  await page.waitForTimeout(1000);

  // Screenshot 1: Light mode with skip button during animation
  console.log('Taking screenshot 1: Light mode with skip button...');
  await page.screenshot({
    path: '/home/user/itsme/app/screenshot-light-with-skip.png',
    fullPage: true
  });

  // Click the dark mode toggle
  console.log('Switching to dark mode...');
  await page.click('button[aria-label*="dark" i], button[aria-label*="theme" i], .dark-mode-toggle, [class*="toggle"]');

  await page.waitForTimeout(500);

  // Screenshot 2: Dark mode with skip button during animation
  console.log('Taking screenshot 2: Dark mode with skip button...');
  await page.screenshot({
    path: '/home/user/itsme/app/screenshot-dark-with-skip.png',
    fullPage: true
  });

  // Click skip button if it exists
  const skipButton = await page.$('button.skip-button');
  if (skipButton) {
    console.log('Clicking skip button...');
    await skipButton.click();
    await page.waitForTimeout(500);

    // Screenshot 3: After animation is skipped (button should be hidden)
    console.log('Taking screenshot 3: After skip (dark mode)...');
    await page.screenshot({
      path: '/home/user/itsme/app/screenshot-dark-after-skip.png',
      fullPage: true
    });
  }

  // Reload page to test in light mode
  await page.goto('http://localhost:4200');
  await page.waitForLoadState('networkidle');

  // Wait for animation to complete naturally
  console.log('Waiting for animation to complete...');
  await page.waitForTimeout(15000);

  // Screenshot 4: Light mode after animation completes (no skip button)
  console.log('Taking screenshot 4: Light mode after animation completes...');
  await page.screenshot({
    path: '/home/user/itsme/app/screenshot-light-completed.png',
    fullPage: true
  });

  // Mobile viewport test
  console.log('Testing mobile viewport...');
  await context.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15'
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4200');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);

  // Screenshot 5: Mobile light mode with skip button
  console.log('Taking screenshot 5: Mobile light mode with skip button...');
  await mobilePage.screenshot({
    path: '/home/user/itsme/app/screenshot-mobile-light.png',
    fullPage: true
  });

  // Toggle dark mode on mobile
  await mobilePage.click('button[aria-label*="dark" i], button[aria-label*="theme" i], .dark-mode-toggle, [class*="toggle"]');
  await mobilePage.waitForTimeout(500);

  // Screenshot 6: Mobile dark mode
  console.log('Taking screenshot 6: Mobile dark mode with skip button...');
  await mobilePage.screenshot({
    path: '/home/user/itsme/app/screenshot-mobile-dark.png',
    fullPage: true
  });

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
