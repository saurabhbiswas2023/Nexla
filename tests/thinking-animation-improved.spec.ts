import { test, expect } from '@playwright/test';

test.describe('Improved Thinking Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should hide content completely during thinking animation', async ({ page }) => {
    // Send a message that triggers AI response
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Data Analysis, Destination = Webhook');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI message to appear with thinking status
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();

    // Check that thinking animation is visible
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);
    await expect(thinkingDots.first()).toBeVisible();

    // CRITICAL: Content should be completely hidden during thinking
    const contentDiv = aiMessage.locator('div').filter({ hasText: /Source|Transform|Destination/ });
    await expect(contentDiv).toHaveCount(0); // Should not exist at all

    // Wait for thinking to complete and content to appear
    await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    
    // Now content should be visible
    await expect(aiMessage.locator('div').filter({ hasText: /Source|Transform|Destination/ })).toBeVisible();
  });

  test('should show exactly 2 dots with reduced size', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();

    // Check exactly 2 thinking dots
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);

    // Check reduced size (h-1.5 w-1.5 = 6px)
    const firstDot = thinkingDots.first();
    await expect(firstDot).toHaveClass(/h-1\.5/);
    await expect(firstDot).toHaveClass(/w-1\.5/);
  });

  test('should place animation in header after NexBot', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();

    // Check that NexBot text exists
    await expect(aiMessage.locator('text=NexBot')).toBeVisible();

    // Check that thinking animation is in the same line (header)
    const headerDiv = aiMessage.locator('div').filter({ hasText: 'NexBot' }).first();
    const thinkingDots = headerDiv.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);
  });

  test('should not flicker when transitioning from thinking to content', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Data Analysis, Destination = Webhook');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();

    // Record initial state - thinking dots visible, no content
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toBeVisible();
    
    // Content should not exist during thinking
    const contentArea = aiMessage.locator('div').filter({ hasText: /PostgreSQL|Data Analysis|Webhook/ });
    await expect(contentArea).toHaveCount(0);

    // Wait for transition
    await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });

    // After transition, content should appear without any previous content being visible
    await expect(aiMessage.locator('div').filter({ hasText: /PostgreSQL|Data Analysis|Webhook/ })).toBeVisible();
  });

  test('should work correctly in field collection flow', async ({ page }) => {
    // Start a flow that requires field collection
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL users, Transform = format data, Destination = Email service');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for initial AI response with thinking animation
    let aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Check thinking animation appears
    let thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);
    
    // Wait for content to appear
    await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    await expect(aiMessage.getByText(/PostgreSQL/)).toBeVisible();

    // Continue with field collection - provide source name
    await page.fill('[data-testid="chat-input"]', 'UserDatabase');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Check next AI response also has thinking animation
    aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);
    
    // Content should be hidden during thinking
    const fieldContent = aiMessage.locator('div').filter({ hasText: /host|port|database/ });
    await expect(fieldContent).toHaveCount(0);
    
    // Wait for field collection question to appear
    await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    await expect(aiMessage.locator('div').filter({ hasText: /host|port|database/ })).toBeVisible();
  });

  test('should maintain animation during rapid responses', async ({ page }) => {
    // Send multiple messages quickly
    const messages = [
      'Source = PostgreSQL',
      'Transform = Data Analysis', 
      'Destination = Webhook'
    ];

    for (const message of messages) {
      await page.fill('[data-testid="chat-input"]', message);
      await page.press('[data-testid="chat-input"]', 'Enter');
      
      // Each AI response should have thinking animation
      const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
      await expect(aiMessage).toBeVisible();
      
      const thinkingDots = aiMessage.locator('.thinking-bounce');
      await expect(thinkingDots).toHaveCount(2);
      
      // Wait for this response to complete before next message
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should work with error responses', async ({ page }) => {
    // Mock an API error by sending invalid input
    await page.route('**/openrouter/api/v1/chat/completions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      });
    });

    await page.fill('[data-testid="chat-input"]', 'Test error handling');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();

    // Should still show thinking animation even for errors
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);

    // Wait for error message to appear
    await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    await expect(aiMessage.locator('div').filter({ hasText: /error|sorry/i })).toBeVisible();
  });

  test('should not affect user messages', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'This is a user message');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Check user message appears immediately without thinking animation
    const userMessage = page.locator('[data-testid^="message-user-"]').last();
    await expect(userMessage).toBeVisible();
    await expect(userMessage.getByText('This is a user message')).toBeVisible();
    
    // User messages should never have thinking dots
    const thinkingDots = userMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(0);
  });
});
