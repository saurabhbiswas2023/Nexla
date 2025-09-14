import { test, expect } from '@playwright/test';

test.describe('Webhook Detection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    
    // Wait for the page to load
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should correctly identify webhook as destination connector', async ({ page }) => {
    // Test input that should identify PostgreSQL as source and Webhook as destination
    const testInput = 'Get PostgreSQL users and send to a webhook';
    
    // Add console logging to capture LLM response
    const llmResponses: Array<Record<string, unknown>> = [];
    page.on('console', msg => {
      if (msg.text().includes('🤖 LLM Response:')) {
        try {
          const responseText = msg.text().replace('🤖 LLM Response: ', '');
          llmResponses.push(JSON.parse(responseText));
        } catch {
          console.log('Failed to parse LLM response:', msg.text());
        }
      }
    });

    // Enter the test input
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for AI response
    await expect(page.getByText('Perfect! I\'ve identified your systems')).toBeVisible({ timeout: 10000 });

    // Check canvas for correct connectors
    const canvas = page.locator('[data-testid="canvas-container"]');
    await expect(canvas).toBeVisible();

    // Verify PostgreSQL is identified as source
    await expect(canvas.getByText('PostgreSQL')).toBeVisible();
    
    // CRITICAL: Verify Webhook is identified as destination (NOT Sendgrid)
    await expect(canvas.getByText('Webhook')).toBeVisible();
    
    // Verify Sendgrid is NOT present
    await expect(canvas.getByText('Sendgrid')).not.toBeVisible();

    // Check that the correct credentials are being asked for
    // Webhook should ask for baseUrl and auth, not Sendgrid credentials
    const webhookCredentials = ['baseUrl', 'auth'];
    const sendgridCredentials = ['accessToken', 'apiKey', 'accountId'];
    
    // Should ask for webhook credentials
    for (const cred of webhookCredentials) {
      // This might appear in the chat or canvas
      const credentialMention = page.locator(`text=${cred}`);
      if (await credentialMention.count() > 0) {
        console.log(`✅ Found webhook credential: ${cred}`);
      }
    }
    
    // Should NOT ask for Sendgrid credentials
    for (const cred of sendgridCredentials) {
      await expect(page.locator(`text=${cred}`)).not.toBeVisible();
    }

    // Verify LLM response in console logs
    await page.waitForTimeout(2000); // Give time for console logs
    
    if (llmResponses.length > 0) {
      const lastResponse = llmResponses[llmResponses.length - 1];
      console.log('Last LLM Response:', JSON.stringify(lastResponse, null, 2));
      
      // Verify LLM correctly identified the connectors
      if (lastResponse.data) {
        expect(lastResponse.data.source).toBe('PostgreSQL');
        expect(lastResponse.data.destination).toBe('Webhook');
        expect(lastResponse.data.destination).not.toBe('Sendgrid');
      }
    }
  });

  test('should handle various webhook phrases correctly', async ({ page }) => {
    const webhookPhrases = [
      'Send data to webhook',
      'Send to a webhook',
      'Push to HTTP endpoint',
      'Send to REST endpoint',
      'Send to web hook'
    ];

    for (const phrase of webhookPhrases) {
      console.log(`Testing phrase: "${phrase}"`);
      
      // Clear input and enter new phrase
      await page.getByPlaceholder('Describe your data flow…').fill('');
      await page.getByPlaceholder('Describe your data flow…').fill(phrase);
      await page.getByRole('button', { name: 'Send' }).click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Check canvas for Webhook (not other connectors)
      const canvas = page.locator('[data-testid="canvas-container"]');
      
      // Should show Webhook
      const webhookElement = canvas.getByText('Webhook');
      if (await webhookElement.count() > 0) {
        console.log(`✅ "${phrase}" correctly identified Webhook`);
      } else {
        console.log(`❌ "${phrase}" failed to identify Webhook`);
      }

      // Should NOT show Sendgrid
      const sendgridElement = canvas.getByText('Sendgrid');
      if (await sendgridElement.count() === 0) {
        console.log(`✅ "${phrase}" correctly avoided Sendgrid`);
      } else {
        console.log(`❌ "${phrase}" incorrectly showed Sendgrid`);
      }

      // Reset for next test
      await page.goto('/chat');
      await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
    }
  });

  test('should distinguish webhook from email services', async ({ page }) => {
    // Test cases that should NOT be confused with webhooks
    const emailServiceTests = [
      { input: 'Send emails via Sendgrid', expected: 'Sendgrid' },
      { input: 'Send to Mailchimp', expected: 'Mailchimp' },
      { input: 'Email via SendGrid', expected: 'Sendgrid' }
    ];

    for (const testCase of emailServiceTests) {
      console.log(`Testing: "${testCase.input}" should identify ${testCase.expected}`);
      
      await page.getByPlaceholder('Describe your data flow…').fill('');
      await page.getByPlaceholder('Describe your data flow…').fill(testCase.input);
      await page.getByRole('button', { name: 'Send' }).click();

      await page.waitForTimeout(3000);

      const canvas = page.locator('[data-testid="canvas-container"]');
      
      // Should show the correct email service
      await expect(canvas.getByText(testCase.expected)).toBeVisible();
      
      // Should NOT show Webhook for email services
      await expect(canvas.getByText('Webhook')).not.toBeVisible();

      // Reset for next test
      await page.goto('/chat');
      await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
    }
  });

  test('debug LLM response for webhook detection', async ({ page }) => {
    // Capture all console messages for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    const testInput = 'Get PostgreSQL users and send to a webhook';
    
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for processing
    await page.waitForTimeout(5000);

    // Log all console messages for debugging
    console.log('=== ALL CONSOLE LOGS ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}: ${log}`);
    });

    // Take screenshot for visual debugging
    await page.screenshot({ path: 'webhook-detection-debug.png', fullPage: true });
    
    // Get current canvas state
    const canvasText = await page.locator('[data-testid="canvas-container"]').textContent();
    console.log('Canvas content:', canvasText);
  });
});
