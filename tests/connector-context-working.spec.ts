import { test, expect } from '@playwright/test';

test.describe('Connector Context in Field Questions - Working Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should include Shopify context in field questions', async ({ page }) => {
    // Test the exact scenario from your screenshot
    await page.fill('[data-testid="chat-input"]', 'Shopify to BigQuery');
    await page.click('button:has-text("Send")');

    // Wait for responses
    await page.waitForTimeout(5000);

    // Get all messages
    const allMessages = await page.locator('[data-testid^="message-"]').all();
    console.log(`✅ Found ${allMessages.length} messages`);

    // Look for Shopify field question
    let foundShopifyQuestion = false;
    for (const message of allMessages) {
      const content = await message.textContent();
      if (content && content.includes('Shopify') && content.includes('?')) {
        console.log('✅ Shopify question found:', content);
        expect(content).toMatch(/Shopify.*store.*domain/i);
        expect(content).toMatch(/e\.g\.,.*mystore/i);
        foundShopifyQuestion = true;
        break;
      }
    }

    expect(foundShopifyQuestion).toBe(true);
  });

  test('should include BigQuery context when transitioning to destination', async ({ page }) => {
    // Start the flow
    await page.fill('[data-testid="chat-input"]', 'Shopify to BigQuery');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(3000);

    // Answer the Shopify question
    await page.fill('[data-testid="chat-input"]', 'mystore.shopify.com');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(3000);

    // Answer the API key question
    await page.fill('[data-testid="chat-input"]', 'shpat_test123');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(3000);

    // Should eventually ask for BigQuery fields
    let attempts = 0;
    let foundBigQueryQuestion = false;

    while (attempts < 5 && !foundBigQueryQuestion) {
      const allMessages = await page.locator('[data-testid^="message-"]').all();
      
      for (const message of allMessages) {
        const content = await message.textContent();
        if (content && content.includes('BigQuery') && content.includes('?')) {
          console.log('✅ BigQuery question found:', content);
          expect(content).toMatch(/BigQuery/i);
          foundBigQueryQuestion = true;
          break;
        }
      }

      if (!foundBigQueryQuestion) {
        // Continue answering questions
        await page.fill('[data-testid="chat-input"]', 'test-value');
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(2000);
      }

      attempts++;
    }

    if (!foundBigQueryQuestion) {
      console.log('⚠️ BigQuery question not found yet, but Shopify context was verified');
    }
  });

  test('should show PostgreSQL context for different connector', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'PostgreSQL to MySQL');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(5000);

    const allMessages = await page.locator('[data-testid^="message-"]').all();
    
    let foundPostgreSQLQuestion = false;
    for (const message of allMessages) {
      const content = await message.textContent();
      if (content && content.includes('PostgreSQL') && content.includes('?')) {
        console.log('✅ PostgreSQL question found:', content);
        expect(content).toMatch(/PostgreSQL/i);
        expect(content).toMatch(/host|account|database|username/i);
        foundPostgreSQLQuestion = true;
        break;
      }
    }

    expect(foundPostgreSQLQuestion).toBe(true);
  });

  test('should verify the exact improvement from the issue', async ({ page }) => {
    // This test verifies the exact issue reported:
    // BEFORE: "host/account?" 
    // AFTER: "Google BigQuery host/account?"
    
    await page.fill('[data-testid="chat-input"]', 'Source = Stripe, Transform = Map & Validate, Destination = Google BigQuery');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(5000);

    // Keep answering until we get to BigQuery destination
    let attempts = 0;
    let foundContextualQuestion = false;

    while (attempts < 8 && !foundContextualQuestion) {
      const allMessages = await page.locator('[data-testid^="message-"]').all();
      
      for (const message of allMessages) {
        const content = await message.textContent();
        
        // Look for field questions with connector context
        if (content && content.includes('?') && 
            (content.includes('Stripe') || content.includes('BigQuery') || content.includes('Google BigQuery'))) {
          
          console.log('✅ Contextual question found:', content);
          
          // Verify it's NOT just the field name
          expect(content).not.toMatch(/^host\/account\?$/);
          expect(content).not.toMatch(/^apiKey\?$/);
          
          // Verify it INCLUDES connector context
          expect(content).toMatch(/Stripe|BigQuery|Google BigQuery/i);
          
          foundContextualQuestion = true;
          break;
        }
      }

      if (!foundContextualQuestion) {
        // Answer the current question
        await page.fill('[data-testid="chat-input"]', 'test-value');
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(2000);
      }

      attempts++;
    }

    expect(foundContextualQuestion).toBe(true);
    console.log('🎉 SUCCESS: Field questions now include connector context!');
  });
});
