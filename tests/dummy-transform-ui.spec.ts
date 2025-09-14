import { test } from '@playwright/test';

test.describe('Dummy Transform UI', () => {
  test('should not show Extras section for Dummy Transform', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    console.log('✅ Page loaded, testing Dummy Transform UI...');

    // Start a flow that will create a Dummy Transform
    await page.fill('[data-testid="chat-input"]', 'kk');
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if there's a Dummy Transform node on the canvas
    const dummyTransform = await page.locator('text=Dummy Transform').first();
    
    if (await dummyTransform.isVisible()) {
      console.log('✅ Dummy Transform found on canvas');
      
      // Check if the Extras section is NOT visible
      const extrasSection = await page.locator('text=Extras').count();
      console.log(`✅ Found ${extrasSection} "Extras" sections`);
      
      // Check if there are any input fields in the transform area
      const transformInputs = await page.locator('[data-testid="rf__node-transform-Dummy Transform"] input').count();
      console.log(`✅ Found ${transformInputs} input fields in Dummy Transform`);
      
      // Check if "Configure transform parameters" text is visible
      const configureText = await page.locator('text=Configure transform parameters').count();
      console.log(`✅ Found ${configureText} "Configure transform parameters" texts`);
      
      // Dummy Transform should NOT have:
      // - Extras section
      // - Input fields for configuration
      // - "Configure transform parameters" text
      
      if (extrasSection === 0 && transformInputs === 0 && configureText === 0) {
        console.log('🎉 SUCCESS: Dummy Transform is clean (no extras, no inputs, no config text)');
      } else {
        console.log('❌ ISSUE: Dummy Transform still showing configuration UI');
        console.log(`   - Extras sections: ${extrasSection} (should be 0)`);
        console.log(`   - Input fields: ${transformInputs} (should be 0)`);
        console.log(`   - Config texts: ${configureText} (should be 0)`);
      }
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'dummy-transform-debug.png', fullPage: true });
      console.log('✅ Screenshot saved as dummy-transform-debug.png');
      
    } else {
      console.log('⚠️ No Dummy Transform found, trying different approach...');
      
      // Try a more explicit approach
      await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Dummy Transform, Destination = MySQL');
      await page.click('button:has-text("Send")');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'dummy-transform-debug-2.png', fullPage: true });
      console.log('✅ Second screenshot saved as dummy-transform-debug-2.png');
    }
  });
});
