import { test, expect } from '@playwright/test';

test.describe('Thinking Animation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    
    // Wait for the page to load
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should show thinking animation for minimum 500ms then disappear', async ({ page }) => {
    const testInput = 'Connect Shopify to BigQuery';
    
    // Record timing
    const startTime = Date.now();
    
    // Enter test input
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify thinking animation appears immediately (look for bouncing dots)
    await expect(page.locator('.thinking-bounce').first()).toBeVisible({ timeout: 1000 });
    console.log('✅ Thinking animation appeared');

    // Verify animation is still visible after 400ms (should still be showing)
    await page.waitForTimeout(400);
    await expect(page.locator('.thinking-bounce').first()).toBeVisible();
    console.log('✅ Animation still visible at 400ms');

    // Wait for response to appear (animation should disappear)
    await expect(page.getByText('Perfect! I\'ve identified your systems')).toBeVisible({ timeout: 10000 });
    
    // Verify animation has disappeared after response
    await expect(page.locator('.thinking-bounce').first()).not.toBeVisible();
    console.log('✅ Animation disappeared after response');

    // Check that minimum 500ms elapsed
    const totalTime = Date.now() - startTime;
    console.log(`Total thinking time: ${totalTime}ms`);
    expect(totalTime).toBeGreaterThanOrEqual(500);
    console.log('✅ Minimum 500ms thinking time respected');

    // Verify no permanent animations on sent messages
    const aiMessages = page.locator('[data-testid="message-bubble"]').filter({ has: page.getByText('NexBot') });
    const messageCount = await aiMessages.count();
    
    for (let i = 0; i < messageCount; i++) {
      const message = aiMessages.nth(i);
      const hasThinkingText = await message.getByText('✨ Thinking...').count();
      expect(hasThinkingText).toBe(0);
    }
    console.log('✅ No permanent thinking animations on sent messages');
  });

  test('should show animation for fast responses (pattern fallback)', async ({ page }) => {
    const testInput = 'Analyze Stripe payments in Google Sheets';
    
    const startTime = Date.now();
    
    // This should trigger pattern fallback (fast response)
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify thinking animation appears
    await expect(page.locator('.thinking-bounce').first()).toBeVisible({ timeout: 1000 });
    console.log('✅ Thinking animation appeared for pattern fallback');

    // Wait for response
    await expect(page.getByText('Perfect! I\'ve identified your systems')).toBeVisible({ timeout: 10000 });
    
    // Verify animation disappeared
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible();
    console.log('✅ Animation disappeared after pattern fallback response');

    // Check minimum time was respected even for fast response
    const totalTime = Date.now() - startTime;
    console.log(`Pattern fallback total time: ${totalTime}ms`);
    expect(totalTime).toBeGreaterThanOrEqual(500);
    console.log('✅ Minimum 500ms respected even for fast pattern fallback');
  });

  test('should handle multiple messages correctly', async ({ page }) => {
    // Send first message
    await page.getByPlaceholder('Describe your data flow…').fill('Shopify');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for first response
    await expect(page.getByText('Is Shopify your source')).toBeVisible({ timeout: 10000 });
    
    // Verify no thinking animation on first response
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible();
    console.log('✅ First message: No thinking animation after response');

    // Send second message
    await page.getByPlaceholder('Describe your data flow…').fill('source');
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify thinking animation appears for second message
    await expect(page.locator('.thinking-bounce').first()).toBeVisible({ timeout: 1000 });
    console.log('✅ Second message: Thinking animation appeared');

    // Wait for second response
    await page.waitForTimeout(3000);
    
    // Verify thinking animation disappeared
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible();
    console.log('✅ Second message: Animation disappeared after response');

    // Verify no permanent animations anywhere
    const thinkingElements = await page.getByText('✨ Thinking...').count();
    expect(thinkingElements).toBe(0);
    console.log('✅ No permanent thinking animations anywhere');
  });

  test('should show enhanced thinking animation elements', async ({ page }) => {
    await page.getByPlaceholder('Describe your data flow…').fill('Connect PostgreSQL to Snowflake');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for thinking animation
    await expect(page.locator('.thinking-bounce').first()).toBeVisible({ timeout: 1000 });

    // Check for animation elements (bouncing dots)
    const thinkingContainer = page.locator('.thinking-bounce');
    await expect(thinkingContainer.first()).toBeVisible();

    // Verify enhanced animation classes are present
    const animationElements = page.locator('.thinking-animation, .thinking-glow, .thinking-bounce');
    const animationCount = await animationElements.count();
    expect(animationCount).toBeGreaterThan(0);
    console.log(`✅ Found ${animationCount} animation elements`);

    // Wait for response and verify animation disappears
    await page.waitForTimeout(2000);
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible();
    console.log('✅ Enhanced animation disappeared correctly');
  });

  test('debug animation timing', async ({ page }) => {
    // Capture console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    const testInput = 'Test message';
    
    console.log('=== ANIMATION TIMING DEBUG ===');
    const startTime = Date.now();
    console.log(`Start time: ${startTime}`);
    
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Check if thinking animation appears
    try {
      await expect(page.locator('.thinking-bounce').first()).toBeVisible({ timeout: 2000 });
      const animationStartTime = Date.now();
      console.log(`Animation appeared at: ${animationStartTime - startTime}ms`);
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check if animation disappeared
      const animationVisible = await page.locator('.thinking-bounce').first().isVisible();
      const endTime = Date.now();
      console.log(`Animation visible at end: ${animationVisible}`);
      console.log(`Total time: ${endTime - startTime}ms`);
      
    } catch (error) {
      console.log('❌ Thinking animation did not appear');
      console.log('Error:', error);
    }

    // Log all console messages
    console.log('=== CONSOLE LOGS ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}: ${log}`);
    });

    // Take screenshot for debugging
    await page.screenshot({ path: 'thinking-animation-debug.png', fullPage: true });
  });
});
