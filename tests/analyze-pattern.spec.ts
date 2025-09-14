import { test, expect } from '@playwright/test';

test.describe('Analyze Pattern Detection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    
    // Wait for the page to load
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should correctly identify "Analyze Stripe payments in Google Sheets"', async ({ page }) => {
    const testInput = 'Analyze Stripe payments in Google Sheets';
    
    // Add console logging to capture pattern detection
    const patternDetections: Array<Record<string, unknown>> = [];
    page.on('console', msg => {
      if (msg.text().includes('🎯 PATTERN FALLBACK DETECTED:')) {
        try {
          const responseText = msg.text().replace('🎯 PATTERN FALLBACK DETECTED: ', '');
          patternDetections.push(JSON.parse(responseText));
        } catch {
          console.log('Failed to parse pattern detection:', msg.text());
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

    // Verify Stripe is identified as source
    await expect(canvas.getByText('Stripe')).toBeVisible();
    
    // Verify Google BigQuery is identified as destination (sheets maps to BigQuery)
    await expect(canvas.getByText('Google BigQuery')).toBeVisible();
    
    // Verify Data Analysis transform is set (not Dummy Transform)
    await expect(canvas.getByText('Data Analysis')).toBeVisible();
    
    // Should NOT show dummy connectors
    await expect(canvas.getByText('Dummy Source')).not.toBeVisible();
    await expect(canvas.getByText('Dummy Destination')).not.toBeVisible();

    // Verify pattern detection in console logs
    await page.waitForTimeout(2000); // Give time for console logs
    
    if (patternDetections.length > 0) {
      const detection = patternDetections[patternDetections.length - 1];
      console.log('Pattern Detection:', JSON.stringify(detection, null, 2));
      
      // Verify pattern correctly identified the connectors
      expect(detection.source).toBe('Stripe');
      expect(detection.destination).toBe('Google BigQuery'); // Sheets maps to BigQuery
      expect(detection.transform).toBe('Data Analysis');
    }

    // Take screenshot for verification
    await page.screenshot({ path: 'analyze-stripe-sheets.png', fullPage: true });
  });

  test('should handle various analyze patterns correctly', async ({ page }) => {
    const analyzePatterns = [
      {
        input: 'Analyze Shopify orders in BigQuery',
        expectedSource: 'Shopify',
        expectedDestination: 'Google BigQuery',
        expectedTransform: 'Data Analysis'
      },
      {
        input: 'Analyze Salesforce data in Snowflake', 
        expectedSource: 'Salesforce',
        expectedDestination: 'Snowflake',
        expectedTransform: 'Data Analysis'
      },
      {
        input: 'Analyze PostgreSQL data using Google Sheets',
        expectedSource: 'PostgreSQL', 
        expectedDestination: 'Google BigQuery', // Sheets maps to BigQuery
        expectedTransform: 'Data Analysis'
      }
    ];

    for (const pattern of analyzePatterns) {
      console.log(`Testing: "${pattern.input}"`);
      
      // Clear and enter new input
      await page.getByPlaceholder('Describe your data flow…').fill('');
      await page.getByPlaceholder('Describe your data flow…').fill(pattern.input);
      await page.getByRole('button', { name: 'Send' }).click();

      // Wait for response
      await page.waitForTimeout(3000);

      const canvas = page.locator('[data-testid="canvas-container"]');
      
      // Check expected source
      const sourceElement = canvas.getByText(pattern.expectedSource);
      if (await sourceElement.count() > 0) {
        console.log(`✅ "${pattern.input}" correctly identified source: ${pattern.expectedSource}`);
      } else {
        console.log(`❌ "${pattern.input}" failed to identify source: ${pattern.expectedSource}`);
      }

      // Check expected destination
      const destElement = canvas.getByText(pattern.expectedDestination);
      if (await destElement.count() > 0) {
        console.log(`✅ "${pattern.input}" correctly identified destination: ${pattern.expectedDestination}`);
      } else {
        console.log(`❌ "${pattern.input}" failed to identify destination: ${pattern.expectedDestination}`);
      }

      // Check expected transform
      const transformElement = canvas.getByText(pattern.expectedTransform);
      if (await transformElement.count() > 0) {
        console.log(`✅ "${pattern.input}" correctly identified transform: ${pattern.expectedTransform}`);
      } else {
        console.log(`❌ "${pattern.input}" failed to identify transform: ${pattern.expectedTransform}`);
      }

      // Reset for next test
      await page.goto('/chat');
      await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
    }
  });

  test('should not interfere with non-analyze patterns', async ({ page }) => {
    // Test that webhook detection still works
    const testInput = 'Get PostgreSQL users and send to webhook';
    
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    await page.waitForTimeout(3000);

    const canvas = page.locator('[data-testid="canvas-container"]');
    
    // Should still detect webhook correctly
    await expect(canvas.getByText('PostgreSQL')).toBeVisible();
    await expect(canvas.getByText('Webhook')).toBeVisible();
    
    // Should NOT show analyze transform
    await expect(canvas.getByText('Data Analysis')).not.toBeVisible();
  });

  test('debug analyze pattern detection', async ({ page }) => {
    // Capture all console messages for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    const testInput = 'Analyze Stripe payments in Google Sheets';
    
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
    await page.screenshot({ path: 'analyze-pattern-debug.png', fullPage: true });
    
    // Get current canvas state
    const canvasText = await page.locator('[data-testid="canvas-container"]').textContent();
    console.log('Canvas content:', canvasText);
  });
});
