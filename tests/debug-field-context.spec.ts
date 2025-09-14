import { test, expect } from '@playwright/test';

test.describe('Debug Field Context', () => {
  test('should debug AI message structure and field questions', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    console.log('✅ Page loaded, starting test...');

    // Send a simple message first
    await page.fill('[data-testid="chat-input"]', 'Source = Shopify, Destination = BigQuery');
    await page.click('button:has-text("Send")');

    console.log('✅ Message sent, waiting for response...');

    // Wait for any AI message to appear
    try {
      await page.waitForSelector('[data-testid^="message-ai-"]', { timeout: 15000 });
      console.log('✅ AI message found');

      // Get all AI messages
      const aiMessages = await page.locator('[data-testid^="message-ai-"]').all();
      console.log(`✅ Found ${aiMessages.length} AI messages`);

      for (let i = 0; i < aiMessages.length; i++) {
        const content = await aiMessages[i].textContent();
        console.log(`✅ AI Message ${i + 1}:`, content?.substring(0, 100) + '...');
      }

      // Get the last AI message
      const lastMessage = await page.locator('[data-testid^="message-ai-"]:last-child').textContent();
      console.log('✅ Last AI message:', lastMessage);

      // Check if it contains field questions
      if (lastMessage?.includes('?')) {
        console.log('✅ Found question in AI message');
        
        // Check for connector context
        if (lastMessage.includes('Shopify') || lastMessage.includes('BigQuery')) {
          console.log('🎉 SUCCESS: Connector context found in question!');
          expect(lastMessage).toMatch(/Shopify|BigQuery/i);
        } else {
          console.log('❌ No connector context found in question');
          console.log('Full question:', lastMessage);
        }
      } else {
        console.log('⚠️ No question found in last message');
      }

    } catch (error) {
      console.log('❌ Error waiting for AI message:', error);
      
      // Debug: Check what messages exist
      const allMessages = await page.locator('[data-testid^="message-"]').all();
      console.log(`Found ${allMessages.length} total messages`);
      
      for (let i = 0; i < allMessages.length; i++) {
        const testId = await allMessages[i].getAttribute('data-testid');
        const content = await allMessages[i].textContent();
        console.log(`Message ${i + 1} (${testId}):`, content?.substring(0, 50) + '...');
      }
      
      throw error;
    }
  });
});
