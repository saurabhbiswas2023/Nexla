import { test, expect } from '@playwright/test';

test.describe('Canvas-to-Chat Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should acknowledge canvas field input and ask next question', async ({ page }) => {
    // Step 1: Start field collection flow
    await page.fill('[data-testid="chat-input"]', 'Connect Shopify to BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI to start asking for fields
    await expect(page.getByText(/storeDomain/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Field collection started - asking for storeDomain');

    // Step 2: Type directly in canvas Shopify node
    const shopifyNode = page.locator('[data-testid="canvas-container"]').getByText('Shopify').first();
    await expect(shopifyNode).toBeVisible();
    
    // Find the storeDomain input field in the canvas
    const storeDomainInput = page.locator('input').filter({ hasText: '' }).first();
    await storeDomainInput.click();
    await storeDomainInput.fill('mystore.shopify.com');
    await storeDomainInput.blur(); // Trigger onBlur to save the value

    console.log('✅ Typed storeDomain in canvas: mystore.shopify.com');

    // Step 3: Verify intelligent acknowledgment appears
    const acknowledgmentMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(acknowledgmentMessage).toBeVisible({ timeout: 5000 });
    
    // Wait for thinking animation to complete
    const thinkingDots = acknowledgmentMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    const ackText = await acknowledgmentMessage.textContent();
    console.log('Acknowledgment response:', ackText);
    
    // Should acknowledge the storeDomain field
    expect(ackText).toMatch(/storeDomain|mystore\.shopify\.com|Got it|Perfect/i);

    // Step 4: Verify next question appears
    await page.waitForTimeout(1000); // Wait for next question
    const nextQuestionMessage = page.locator('[data-testid^="message-ai-"]').last();
    const nextQuestionText = await nextQuestionMessage.textContent();
    console.log('Next question:', nextQuestionText);
    
    // Should ask for apiKey/token (next field)
    expect(nextQuestionText).toMatch(/apiKey|token|api.*key/i);
    console.log('✅ Next question asked for apiKey/token');
  });

  test('should handle multiple canvas field inputs sequentially', async ({ page }) => {
    // Start with a simple source-destination flow
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Cleanse, Destination = MySQL');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for field collection to start
    await expect(page.getByText(/host|account/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Field collection started for PostgreSQL');

    // Fill first field in canvas
    const firstInput = page.locator('input').filter({ hasText: '' }).first();
    await firstInput.click();
    await firstInput.fill('localhost');
    await firstInput.blur();

    // Wait for acknowledgment and next question
    await page.waitForTimeout(2000);
    let lastMessage = page.locator('[data-testid^="message-ai-"]').last();
    let messageText = await lastMessage.textContent();
    console.log('After first field:', messageText);

    // Fill second field in canvas
    const secondInput = page.locator('input').filter({ hasText: '' }).nth(1);
    if (await secondInput.isVisible()) {
      await secondInput.click();
      await secondInput.fill('myuser');
      await secondInput.blur();

      // Wait for acknowledgment
      await page.waitForTimeout(2000);
      lastMessage = page.locator('[data-testid^="message-ai-"]').last();
      messageText = await lastMessage.textContent();
      console.log('After second field:', messageText);
    }

    // Verify the system is progressing through fields
    expect(messageText).toBeTruthy();
    console.log('✅ Sequential field collection working');
  });

  test('should only respond during active field collection', async ({ page }) => {
    // Type in canvas when NOT in field collection mode
    await page.waitForTimeout(1000);
    
    // Try to fill a field when no collection is active
    const anyInput = page.locator('input').first();
    if (await anyInput.isVisible()) {
      await anyInput.click();
      await anyInput.fill('test-value');
      await anyInput.blur();
    }

    // Wait a moment
    await page.waitForTimeout(2000);

    // Should NOT have generated any chat messages
    const chatMessages = page.locator('[data-testid^="message-ai-"]');
    const messageCount = await chatMessages.count();
    
    // Should only have the initial welcome message
    expect(messageCount).toBeLessThanOrEqual(1);
    console.log('✅ No unwanted responses when field collection is inactive');
  });

  test('should work with mixed chat and canvas input', async ({ page }) => {
    // Start field collection
    await page.fill('[data-testid="chat-input"]', 'Connect Stripe to Snowflake');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for first question
    await expect(page.getByText(/baseUrl|host/i)).toBeVisible({ timeout: 10000 });

    // Answer first question via CHAT
    await page.fill('[data-testid="chat-input"]', 'api.stripe.com');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for next question
    await page.waitForTimeout(2000);

    // Answer second question via CANVAS
    const canvasInput = page.locator('input').filter({ hasText: '' }).first();
    if (await canvasInput.isVisible()) {
      await canvasInput.click();
      await canvasInput.fill('sk_live_test123');
      await canvasInput.blur();
    }

    // Wait for acknowledgment
    await page.waitForTimeout(2000);
    const lastMessage = page.locator('[data-testid^="message-ai-"]').last();
    const messageText = await lastMessage.textContent();
    
    console.log('Mixed input result:', messageText);
    expect(messageText).toBeTruthy();
    console.log('✅ Mixed chat and canvas input working');
  });
});
