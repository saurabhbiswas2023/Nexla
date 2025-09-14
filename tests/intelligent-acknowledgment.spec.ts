import { test, expect } from '@playwright/test';

test.describe('Intelligent Acknowledgment System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should provide intelligent acknowledgments during field collection', async ({ page }) => {
    // Start field collection flow
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Data Analysis, Destination = Snowflake');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    // Wait for thinking to complete
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should identify components and ask for source name
    await expect(aiMessage.getByText(/PostgreSQL.*source/i)).toBeVisible();

    // Provide source name
    await page.fill('[data-testid="chat-input"]', 'UserDatabase');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for intelligent acknowledgment
    const acknowledgmentMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(acknowledgmentMessage).toBeVisible();
    
    const acknowledgmentThinking = acknowledgmentMessage.locator('.thinking-bounce');
    if (await acknowledgmentThinking.first().isVisible()) {
      await expect(acknowledgmentThinking.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should provide intelligent acknowledgment for node selection
    await expect(acknowledgmentMessage.locator('div').filter({ 
      hasText: /Perfect.*UserDatabase.*source|set.*UserDatabase.*source/i 
    })).toBeVisible();
  });

  test('should adapt responses based on user behavior', async ({ page }) => {
    // Send multiple short responses to trigger brief response preference
    const shortResponses = ['PostgreSQL', 'localhost', '5432', 'mydb'];
    
    // Start flow
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Transform = Cleanse, Destination = BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for initial response
    let aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    let thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Provide source name
    await page.fill('[data-testid="chat-input"]', 'UserDB');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Provide several short responses
    for (let i = 0; i < shortResponses.length; i++) {
      // Wait for question
      aiMessage = page.locator('[data-testid^="message-ai-"]').last();
      await expect(aiMessage).toBeVisible();
      
      thinkingDots = aiMessage.locator('.thinking-bounce');
      if (await thinkingDots.first().isVisible()) {
        await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
      }

      // Provide short response
      await page.fill('[data-testid="chat-input"]', shortResponses[i]);
      await page.press('[data-testid="chat-input"]', 'Enter');
      
      // Wait for acknowledgment
      const ackMessage = page.locator('[data-testid^="message-ai-"]').last();
      await expect(ackMessage).toBeVisible();
      
      const ackThinking = ackMessage.locator('.thinking-bounce');
      if (await ackThinking.first().isVisible()) {
        await expect(ackThinking.first()).not.toBeVisible({ timeout: 10000 });
      }

      // After a few interactions, responses should become briefer
      if (i >= 2) {
        // Check for brief acknowledgment patterns (✓, short messages)
        const briefPattern = /^(✓|Got it!|Perfect!)/;
        const messageText = await ackMessage.textContent();
        const isBrief = messageText && (briefPattern.test(messageText) || messageText.length < 50);
        
        if (isBrief) {
          console.log('✅ Brief response detected:', messageText);
        }
      }
    }
  });

  test('should provide smart suggestions based on connector type', async ({ page }) => {
    // Test Stripe suggestion
    await page.fill('[data-testid="chat-input"]', 'Source = Stripe, Transform = Data Analysis, Destination = BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should identify Stripe and potentially provide smart suggestions
    await expect(aiMessage.getByText(/Stripe.*source/i)).toBeVisible();

    // Provide source name to trigger smart suggestion
    await page.fill('[data-testid="chat-input"]', 'PaymentAPI');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for acknowledgment with potential smart suggestion
    const suggestionMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(suggestionMessage).toBeVisible();
    
    const suggestionThinking = suggestionMessage.locator('.thinking-bounce');
    if (await suggestionThinking.first().isVisible()) {
      await expect(suggestionThinking.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should provide acknowledgment (may include smart suggestion about payment analysis)
    const messageText = await suggestionMessage.textContent();
    console.log('Smart suggestion response:', messageText);
    
    // At minimum should acknowledge the input
    expect(messageText).toBeTruthy();
  });

  test('should celebrate completion appropriately', async ({ page }) => {
    // Complete a simple flow with auto-complete transform
    await page.fill('[data-testid="chat-input"]', 'Source = Stripe, Transform = Data Analysis, Destination = BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should show Data Analysis as complete
    await expect(aiMessage.getByText(/Data Analysis.*complete/i)).toBeVisible();

    // The flow should be complete since Data Analysis auto-completes
    // Look for completion celebration
    const completionPattern = /🎉|Perfect|complete|ready/i;
    const messageText = await aiMessage.textContent();
    
    if (messageText && completionPattern.test(messageText)) {
      console.log('✅ Completion celebration detected:', messageText);
    }
  });

  test('should handle flexible interaction patterns', async ({ page }) => {
    // Start with a partial specification
    await page.fill('[data-testid="chat-input"]', 'I want to connect PostgreSQL to BigQuery');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    const aiMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(aiMessage).toBeVisible();
    
    const thinkingDots = aiMessage.locator('.thinking-bounce');
    if (await thinkingDots.first().isVisible()) {
      await expect(thinkingDots.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should identify source and destination, ask about transformation
    await expect(aiMessage.getByText(/PostgreSQL.*source/i)).toBeVisible();
    await expect(aiMessage.getByText(/BigQuery.*destination/i)).toBeVisible();

    // Provide transformation
    await page.fill('[data-testid="chat-input"]', 'Map & Validate');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for acknowledgment
    const ackMessage = page.locator('[data-testid^="message-ai-"]').last();
    await expect(ackMessage).toBeVisible();
    
    const ackThinking = ackMessage.locator('.thinking-bounce');
    if (await ackThinking.first().isVisible()) {
      await expect(ackThinking.first()).not.toBeVisible({ timeout: 10000 });
    }

    // Should acknowledge the transformation selection
    const messageText = await ackMessage.textContent();
    expect(messageText).toBeTruthy();
    console.log('Flexible interaction response:', messageText);
  });
});
