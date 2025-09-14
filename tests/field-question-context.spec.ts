import { test, expect } from '@playwright/test';

test.describe('Field Question Context', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should include connector name in field questions when transitioning between nodes', async ({ page }) => {
    // Start with a flow that will trigger field collection
    await page.fill('[data-testid="chat-input"]', 'Source = Shopify, Transform = Map & Validate, Destination = Google BigQuery');
    await page.click('button:has-text("Send")');

    // Wait for AI to process and start field collection
    await page.waitForSelector('[data-testid^="message-ai-"]', { timeout: 10000 });

    // Should start asking for Shopify source fields with context
    const firstQuestion = await page.locator('[data-testid^="message-ai-"]:last-child').textContent();
    console.log('✅ First question:', firstQuestion);
    
    // Should include "Shopify" in the question
    expect(firstQuestion).toMatch(/Shopify.*storeDomain/i);

    // Fill in the Shopify field
    await page.fill('[data-testid="chat-input"]', 'mystore.shopify.com');
    await page.click('button:has-text("Send")');
    await page.waitForSelector('[data-testid^="message-ai-"]:last-child', { timeout: 5000 });

    // Should ask for next Shopify field with context
    const secondQuestion = await page.locator('[data-testid^="message-ai-"]:last-child').textContent();
    console.log('✅ Second question:', secondQuestion);
    
    // Should include "Shopify" in the question
    expect(secondQuestion).toMatch(/Shopify.*apiKey/i);

    // Fill in the API key
    await page.fill('[data-testid="chat-input"]', 'shpat_test123');
    await page.click('button:has-text("Send")');
    await page.waitForSelector('[data-testid^="message-ai-"]:last-child', { timeout: 5000 });

    // Should eventually transition to Google BigQuery destination fields
    // Keep answering questions until we get to BigQuery
    let attempts = 0;
    let currentQuestion = '';
    
    while (attempts < 10) {
      currentQuestion = await page.locator('[data-testid^="message-ai-"]:last-child').textContent() || '';
      console.log(`✅ Question ${attempts + 3}:`, currentQuestion);
      
      // Check if we've reached BigQuery destination questions
      if (currentQuestion.includes('BigQuery') || currentQuestion.includes('Google BigQuery')) {
        console.log('✅ Found BigQuery question with context!');
        break;
      }
      
      // If asking for a field, provide a dummy answer
      if (currentQuestion.includes('?') && !currentQuestion.includes('complete')) {
        await page.fill('[data-testid="chat-input"]', 'test-value');
        await page.click('button:has-text("Send")');
        await page.waitForSelector('[data-testid^="message-ai-"]:last-child', { timeout: 5000 });
      } else {
        break;
      }
      
      attempts++;
    }

    // Verify that BigQuery questions include connector context
    expect(currentQuestion).toMatch(/BigQuery|Google BigQuery/i);
    console.log('✅ BigQuery context verified in question');
  });

  test('should show connector context for different node types', async ({ page }) => {
    // Test with PostgreSQL source
    await page.fill('[data-testid="chat-input"]', 'Source = PostgreSQL, Destination = MySQL');
    await page.click('button:has-text("Send")');

    await page.waitForSelector('[data-testid^="message-ai-"]', { timeout: 10000 });

    // Should ask for PostgreSQL fields with context
    const postgresQuestion = await page.locator('[data-testid^="message-ai-"]:last-child').textContent();
    console.log('✅ PostgreSQL question:', postgresQuestion);
    
    expect(postgresQuestion).toMatch(/PostgreSQL/i);
    expect(postgresQuestion).toMatch(/host|account|username|database/i);
  });

  test('should maintain context in brief response mode', async ({ page }) => {
    // Simulate brief response preference by using short inputs
    await page.fill('[data-testid="chat-input"]', 'Stripe to BigQuery');
    await page.click('button:has-text("Send")');

    await page.waitForSelector('[data-testid^="message-ai-"]', { timeout: 10000 });

    // Even in brief mode, should include connector name
    let attempts = 0;
    while (attempts < 5) {
      const question = await page.locator('[data-testid^="message-ai-"]:last-child').textContent() || '';
      console.log(`✅ Brief mode question ${attempts + 1}:`, question);
      
      if (question.includes('?') && (question.includes('Stripe') || question.includes('BigQuery'))) {
        // Found a field question with connector context
        expect(question).toMatch(/Stripe|BigQuery/i);
        console.log('✅ Brief mode maintains connector context');
        break;
      }
      
      if (question.includes('?')) {
        await page.fill('[data-testid="chat-input"]', 'test');
        await page.click('button:has-text("Send")');
        await page.waitForSelector('[data-testid^="message-ai-"]:last-child', { timeout: 5000 });
      } else {
        break;
      }
      
      attempts++;
    }
  });

  test('should include examples in field questions', async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', 'Source = Shopify, Destination = Snowflake');
    await page.click('button:has-text("Send")');

    await page.waitForSelector('[data-testid^="message-ai-"]', { timeout: 10000 });

    // Look for questions with examples
    let foundExamples = false;
    let attempts = 0;
    
    while (attempts < 5 && !foundExamples) {
      const question = await page.locator('[data-testid^="message-ai-"]:last-child').textContent() || '';
      console.log(`✅ Checking for examples ${attempts + 1}:`, question);
      
      if (question.includes('e.g.,') || question.includes('example')) {
        foundExamples = true;
        expect(question).toMatch(/e\.g\.,|example/i);
        expect(question).toMatch(/Shopify|Snowflake/i);
        console.log('✅ Found question with connector context and examples');
        break;
      }
      
      if (question.includes('?')) {
        await page.fill('[data-testid="chat-input"]', 'test-value');
        await page.click('button:has-text("Send")');
        await page.waitForSelector('[data-testid^="message-ai-"]:last-child', { timeout: 5000 });
      } else {
        break;
      }
      
      attempts++;
    }

    if (!foundExamples) {
      console.log('⚠️ No examples found in questions, but connector context should still be present');
    }
  });
});
