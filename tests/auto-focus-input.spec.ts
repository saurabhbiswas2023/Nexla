import { test, expect } from '@playwright/test';

test.describe('Auto-Focus Input After AI Responses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should auto-focus input after AI response completes', async ({ page }) => {
    // Send initial message
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Data Analysis, Destination = Webhook');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response to complete
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Wait for thinking animation to complete
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Check that input is automatically focused
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should auto-focus input after field collection responses', async ({ page }) => {
    // Start field collection flow
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL users, Transform = format data, Destination = Email service');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for initial AI response
    let aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    let thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused after first response
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();

    // Provide source name
    await page.fill('[data-testid="chat-input"]', 'UserDatabase');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for next AI response (field collection question)
    aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused again after field collection question
    await expect(chatInput).toBeFocused();
  });

  test('should auto-focus input after error responses', async ({ page }) => {
    // Mock API error
    await page.route('**/openrouter/api/v1/chat/completions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      });
    });

    await page.fill('[data-testid="chat-input"]', 'Test error handling');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for error response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused even after error
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should auto-focus input after pattern fallback responses', async ({ page }) => {
    // Use webhook pattern that triggers fallback
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL users, Transformation = format/cleanse user data, Destination = Webhook (HTTP endpoint)');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response (should use pattern fallback)
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused after fallback response
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should auto-focus input after analyze pattern responses', async ({ page }) => {
    // Use analyze pattern
    await page.fill('[data-testid="chat-input"]', 'Analyze Stripe payments in Google Sheets');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused after analyze response
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should not auto-focus on initial page load', async ({ page }) => {
    // On initial load, input should not be auto-focused (only after AI responses)
    const chatInput = page.locator('[data-testid="chat-input"]');
    
    // Wait a moment to ensure any auto-focus would have happened
    await page.waitForTimeout(200);
    
    // Input should not be focused initially
    await expect(chatInput).not.toBeFocused();
  });

  test('should maintain focus after multiple rapid responses', async ({ page }) => {
    const messages = [
      'Source = PostgreSQL',
      'Transform = Data Analysis', 
      'Destination = Webhook'
    ];

    for (let i = 0; i < messages.length; i++) {
      await page.fill('[data-testid="chat-input"]', messages[i]);
      await page.press('[data-testid="chat-input"]', 'Enter');
      
      // Wait for AI response
      const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
      await expect(aiMessage).toBeVisible();
      
      const thinkingDots = aiMessage.locator('.thinking-bounce');
      if (await thinkingDots.first().isVisible()) {
        await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
      }

      // Input should be focused after each response
      const chatInput = page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toBeFocused();
    }
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Send message using keyboard
    await page.fill('[data-testid="chat-input"]', 'Test keyboard navigation');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be focused
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();

    // Should be able to type immediately
    await page.keyboard.type('Follow-up message');
    await expect(chatInput).toHaveValue('Follow-up message');
  });

  test('should work with theme switching', async ({ page }) => {
    // Toggle theme
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();

    // Send message in different theme
    await page.fill('[data-testid="chat-input"]', 'Test theme with auto-focus');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should still be focused in different theme
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should work after navigation between pages', async ({ page }) => {
    // Start on chat page and send message
    await page.fill('[data-testid="chat-input"]', 'Test navigation');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Navigate to canvas and back
    await page.click('[data-testid="canvas-link"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="chat-link"]');
    await page.waitForLoadState('networkidle');

    // Send another message
    await page.fill('[data-testid="chat-input"]', 'After navigation');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for response
    const newAiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(newAiMessage).toBeVisible();
    
    const newThinkingDots = newAiMessage.locator('.thinking-bounce');
    if (await newThinkingDots.first().isVisible()) {
      await expect(newThinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should still be focused after navigation
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();
  });

  test('should not interfere with manual focus management', async ({ page }) => {
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Test manual focus');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Input should be auto-focused
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();

    // Manually focus elsewhere (e.g., theme toggle)
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Auto-focus should not interfere with manual focus
    await page.waitForTimeout(200);
    await expect(themeToggle).toBeFocused();
  });
});
