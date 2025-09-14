import { test, expect } from '@playwright/test';

test.describe('Regression Tests - All Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('webhook detection flow still works', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL users, Transformation = format/cleanse user data, Destination = Webhook (HTTP endpoint)');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response (with thinking animation)
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Wait for thinking to complete
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should identify components correctly
    await expect(aiMessage.getByText(/PostgreSQL.*source/i)).toBeVisible();
    await expect(aiMessage.getByText(/Webhook.*destination/i)).toBeVisible();
    await expect(aiMessage.getByText(/transform/i)).toBeVisible();
  });

  test('analyze pattern detection flow still works', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Analyze Stripe payments in Google Sheets');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Wait for thinking to complete
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should identify: Stripe (source), Data Analysis (transform), Google BigQuery (destination)
    await expect(aiMessage.getByText(/Stripe.*source/i)).toBeVisible();
    await expect(aiMessage.getByText(/Data Analysis.*transform/i)).toBeVisible();
    await expect(aiMessage.getByText(/Google BigQuery.*destination/i)).toBeVisible();
  });

  test('data analysis autocomplete still works', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Source = Stripe, Transform = Data Analysis, Destination = Google BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Wait for thinking to complete
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should show completion message for Data Analysis
    await expect(aiMessage.getByText(/Data Analysis.*complete/i)).toBeVisible();
    await expect(aiMessage.getByText(/ready to use/i)).toBeVisible();
  });

  test('field collection flow still works', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL users, Transform = format data, Destination = Email service');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for initial response
    let aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    let thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    await expect(aiMessage.getByText(/PostgreSQL/)).toBeVisible();

    // Provide source name
    await page.fill('[data-testid="chat-input"]', 'UserDatabase');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Should ask for PostgreSQL configuration
    aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    await expect(aiMessage.getByText(/host.*port.*database/i)).toBeVisible();

    // Provide configuration
    await page.fill('[data-testid="chat-input"]', 'localhost:5432:mydb:user:pass');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Should continue to next step
    aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should ask for transform name or show next step
    await expect(aiMessage.locator('div').filter({ hasText: /transform|email/i })).toBeVisible();
  });

  test('canvas integration still works', async ({ page }) => {
    // Navigate to canvas page
    await page.goto('/canvas');
    await page.waitForLoadState('networkidle');

    // Check that canvas loads
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();

    // Go back to chat and create a flow
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Data Analysis, Destination = Webhook');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should show flow creation
    await expect(aiMessage.getByText(/PostgreSQL.*source/i)).toBeVisible();

    // Navigate to canvas to verify flow was created
    await page.goto('/canvas');
    await page.waitForLoadState('networkidle');

    // Should see nodes on canvas
    await expect(page.locator('[data-testid="source-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="transform-node"]')).toBeVisible();
    await expect(page.locator('[data-testid="destination-node"]')).toBeVisible();
  });

  test('error handling still works', async ({ page }) => {
    // Mock API error
    await page.route('**/openrouter/api/v1/chat/completions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      });
    });

    await page.fill('[data-testid="chat-input"]', 'Test error');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should show error message
    await expect(aiMessage.getByText(/error|sorry|problem/i)).toBeVisible();
  });

  test('chat scrolling still works', async ({ page }) => {
    // Send multiple messages to create scrollable content
    const messages = [
      'Message 1: Source = PostgreSQL',
      'Message 2: Transform = Data Analysis', 
      'Message 3: Destination = Webhook',
      'Message 4: This is a longer message to test scrolling behavior and ensure that the chat area scrolls properly to the bottom when new messages arrive',
      'Message 5: Final test message'
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

      // Check that chat scrolled to bottom
      const messageArea = page.locator('[data-testid="message-area"]');
      const scrollTop = await messageArea.evaluate(el => el.scrollTop);
      const scrollHeight = await messageArea.evaluate(el => el.scrollHeight);
      const clientHeight = await messageArea.evaluate(el => el.clientHeight);
      
      // Should be scrolled to bottom (within 5px tolerance)
      expect(scrollTop + clientHeight).toBeGreaterThanOrEqual(scrollHeight - 5);
    }
  });

  test('theme switching still works', async ({ page }) => {
    // Check initial theme
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Toggle theme
    await themeToggle.click();

    // Send a message to test thinking animation in different theme
    await page.fill('[data-testid="chat-input"]', 'Test theme with thinking animation');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    await expect(thinkingDots).toHaveCount(2);
    
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    await expect(aiMessage.getByText(/Test theme/)).toBeVisible();
  });

  test('navigation between pages still works', async ({ page }) => {
    // Start on chat page
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();

    // Navigate to canvas
    await page.click('[data-testid="canvas-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();

    // Navigate back to chat
    await page.click('[data-testid="chat-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();

    // Send message to ensure chat still works
    await page.fill('[data-testid="chat-input"]', 'Navigation test');
    await page.press('[data-testid="chat-input"]', 'Enter');

    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    await expect(aiMessage.getByText(/Navigation test/)).toBeVisible();
  });
});
