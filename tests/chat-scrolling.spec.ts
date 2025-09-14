import { test, expect } from '@playwright/test';

test.describe('Chat Scrolling E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should scroll to bottom after short AI response', async ({ page }) => {
    console.log('=== Testing Short Response Scrolling ===');
    
    // Send a message that generates a short response
    await page.getByPlaceholder('Describe your data flow…').fill('Hello');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for AI response
    await page.waitForTimeout(2000);

    // Check if the chat area is scrolled to bottom
    const chatArea = page.locator('[data-testid="message-area"]');
    await expect(chatArea).toBeVisible();

    // Get scroll position
    const scrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5
    }));

    console.log('Short response scroll info:', scrollInfo);
    expect(scrollInfo.isAtBottom).toBe(true);
    console.log('✅ Short response: Scrolled to bottom correctly');
  });

  test('should scroll to bottom after long AI response', async ({ page }) => {
    console.log('=== Testing Long Response Scrolling ===');
    
    // Send a message that generates a long response (field collection)
    await page.getByPlaceholder('Describe your data flow…').fill('Connect Shopify to BigQuery with data transformation');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for AI response and field collection to start
    await page.waitForTimeout(3000);

    // Check if the chat area is scrolled to bottom after long response
    const chatArea = page.locator('[data-testid="message-area"]');
    await expect(chatArea).toBeVisible();

    // Get scroll position after long response
    const scrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
      distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
    }));

    console.log('Long response scroll info:', scrollInfo);
    console.log(`Distance from bottom: ${scrollInfo.distanceFromBottom}px`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'long-response-scroll.png', fullPage: true });

    expect(scrollInfo.isAtBottom).toBe(true);
    console.log('✅ Long response: Scrolled to bottom correctly');
  });

  test('should scroll to bottom after multiple messages', async ({ page }) => {
    console.log('=== Testing Multiple Messages Scrolling ===');
    
    // Send multiple messages to create a long conversation
    const messages = [
      'Connect Shopify to BigQuery',
      'https://mystore.myshopify.com',
      'api-key-12345',
      'skip',
      'host.bigquery.com',
      'user123'
    ];

    for (let i = 0; i < messages.length; i++) {
      console.log(`Sending message ${i + 1}: ${messages[i]}`);
      
      await page.getByPlaceholder('Describe your data flow…').fill(messages[i]);
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check scroll position after each message
      const chatArea = page.locator('[data-testid="message-area"]');
      const scrollInfo = await chatArea.evaluate((el) => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
        distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
      }));

      console.log(`Message ${i + 1} scroll info:`, {
        isAtBottom: scrollInfo.isAtBottom,
        distanceFromBottom: scrollInfo.distanceFromBottom
      });

      if (!scrollInfo.isAtBottom) {
        console.log(`❌ Message ${i + 1}: Not scrolled to bottom (${scrollInfo.distanceFromBottom}px from bottom)`);
        
        // Take screenshot for debugging
        await page.screenshot({ path: `message-${i + 1}-scroll-issue.png`, fullPage: true });
      } else {
        console.log(`✅ Message ${i + 1}: Correctly scrolled to bottom`);
      }
    }

    // Final check - should be at bottom
    const chatArea = page.locator('[data-testid="message-area"]');
    const finalScrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
      distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
    }));

    console.log('Final scroll info:', finalScrollInfo);
    expect(finalScrollInfo.isAtBottom).toBe(true);
    console.log('✅ Multiple messages: Final position at bottom');
  });

  test('should scroll to bottom during thinking animation', async ({ page }) => {
    console.log('=== Testing Scrolling During Thinking Animation ===');
    
    // Send a message
    await page.getByPlaceholder('Describe your data flow…').fill('Analyze Stripe payments in Google Sheets');
    await page.getByRole('button', { name: 'Send' }).click();

    // Check scroll position while thinking animation is showing
    await expect(page.getByText('✨ Thinking...')).toBeVisible({ timeout: 2000 });
    
    const chatArea = page.locator('[data-testid="message-area"]');
    const thinkingScrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
      distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
    }));

    console.log('Thinking animation scroll info:', thinkingScrollInfo);
    expect(thinkingScrollInfo.isAtBottom).toBe(true);
    console.log('✅ Thinking animation: Scrolled to bottom');

    // Wait for response and check again
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    
    const responseScrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
      distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
    }));

    console.log('After response scroll info:', responseScrollInfo);
    expect(responseScrollInfo.isAtBottom).toBe(true);
    console.log('✅ After response: Scrolled to bottom');
  });

  test('should handle rapid message sending with proper scrolling', async ({ page }) => {
    console.log('=== Testing Rapid Message Scrolling ===');
    
    // Send messages rapidly
    const rapidMessages = ['Hello', 'How are you?', 'Test message', 'Another test'];
    
    for (const message of rapidMessages) {
      await page.getByPlaceholder('Describe your data flow…').fill(message);
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Minimal wait to simulate rapid sending
      await page.waitForTimeout(500);
    }

    // Wait for all responses to complete
    await page.waitForTimeout(5000);

    // Check final scroll position
    const chatArea = page.locator('[data-testid="message-area"]');
    const finalScrollInfo = await chatArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
      distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop
    }));

    console.log('Rapid messages final scroll info:', finalScrollInfo);
    expect(finalScrollInfo.isAtBottom).toBe(true);
    console.log('✅ Rapid messages: Final position at bottom');
  });

  test('debug scroll behavior with detailed logging', async ({ page }) => {
    console.log('=== Debug Scroll Behavior ===');
    
    // Monitor scroll events
    await page.evaluate(() => {
      const chatArea = document.querySelector('[data-testid="message-area"]');
      if (chatArea) {
        chatArea.addEventListener('scroll', () => {
          console.log('SCROLL EVENT:', {
            scrollTop: chatArea.scrollTop,
            scrollHeight: chatArea.scrollHeight,
            clientHeight: chatArea.clientHeight,
            timestamp: Date.now()
          });
        });
      }
    });

    // Send a message that creates a long response
    await page.getByPlaceholder('Describe your data flow…').fill('Connect Shopify to BigQuery with detailed configuration');
    await page.getByRole('button', { name: 'Send' }).click();

    // Monitor scroll position over time
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      
      const chatArea = page.locator('[data-testid="message-area"]');
      const scrollInfo = await chatArea.evaluate((el) => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5,
        distanceFromBottom: el.scrollHeight - el.clientHeight - el.scrollTop,
        timestamp: Date.now()
      }));

      console.log(`Time ${i * 500}ms:`, scrollInfo);
    }

    // Take final screenshot
    await page.screenshot({ path: 'scroll-debug-final.png', fullPage: true });
  });
});
