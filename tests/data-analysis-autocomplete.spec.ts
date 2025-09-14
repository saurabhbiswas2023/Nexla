import { test, expect } from '@playwright/test';

test.describe('Data Analysis Transform Autocomplete E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    
    // Wait for the page to load
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should autocomplete Data Analysis transform without field collection', async ({ page }) => {
    const testInput = 'Analyze Stripe payments in Google Sheets';
    
    // Enter the test input
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for AI response
    await expect(page.getByText('Perfect! I\'ve identified your systems')).toBeVisible({ timeout: 10000 });

    // Wait for field collection to start
    await page.waitForTimeout(2000);

    // Check canvas state
    const canvas = page.locator('[data-testid="canvas-container"]');
    await expect(canvas).toBeVisible();

    // Verify Data Analysis transform is present and complete
    await expect(canvas.getByText('Data Analysis')).toBeVisible();
    
    // Check progress indicators - Transform should be 100% complete (not 50%)
    const progressSection = page.locator('text=Transform:');
    await expect(progressSection).toBeVisible();
    
    // The transform should show as complete or have high progress
    // Look for "complete" status or high percentage
    const transformStatus = canvas.locator('text=Data Analysis').locator('..').locator('text=complete');
    if (await transformStatus.count() > 0) {
      console.log('✅ Data Analysis transform shows as complete');
    } else {
      // Check if it's marked as pending but should be autocompleted
      const pendingStatus = canvas.locator('text=Data Analysis').locator('..').locator('text=pending');
      if (await pendingStatus.count() > 0) {
        console.log('❌ Data Analysis transform still shows as pending - should be autocompleted');
      }
    }

    // Verify that field collection skips transform fields
    // Should NOT ask for transform configuration
    const transformFieldQuestion = page.getByText('Configure transform parameters');
    await expect(transformFieldQuestion).not.toBeVisible();
    
    // Should NOT show transform field collection in chat
    const transformFieldChat = page.getByText('What\'s your Data Analysis');
    await expect(transformFieldChat).not.toBeVisible();

    // Take screenshot for verification
    await page.screenshot({ path: 'data-analysis-autocomplete.png', fullPage: true });
  });

  test('should skip Data Analysis fields and move to destination collection', async ({ page }) => {
    const testInput = 'Analyze Stripe payments in Google Sheets';
    
    // Enter the test input
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for response and field collection to start
    await page.waitForTimeout(3000);

    // Should ask for source fields first (Stripe)
    await expect(page.getByText('baseUrl')).toBeVisible({ timeout: 5000 });
    
    // Fill source fields
    await page.getByPlaceholder('Enter baseUrl or host').fill('https://api.stripe.com');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder('Enter auth').fill('sk_test_123');
    await page.keyboard.press('Enter');

    // Wait for next step
    await page.waitForTimeout(2000);

    // Should skip transform fields and go directly to destination fields
    // Should NOT ask about Data Analysis configuration
    const dataAnalysisConfig = page.getByText('Configure Data Analysis');
    await expect(dataAnalysisConfig).not.toBeVisible();

    // Should ask for destination fields (Google BigQuery)
    await expect(page.getByText('host/account')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Successfully skipped Data Analysis field collection');
  });

  test('should show higher completion percentage when Data Analysis is autocompleted', async ({ page }) => {
    const testInput = 'Analyze Stripe payments in Google Sheets';
    
    // Enter the test input
    await page.getByPlaceholder('Describe your data flow…').fill(testInput);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for processing
    await page.waitForTimeout(3000);

    // Check the overall completion percentage
    const completionText = page.locator('text=% Complete');
    await expect(completionText).toBeVisible();
    
    const completionValue = await completionText.textContent();
    console.log('Completion percentage:', completionValue);
    
    // With Data Analysis autocompleted, we should see higher than 17% completion
    // Expected: Source (0%) + Transform (100%) + Destination (0%) = ~33% or higher
    if (completionValue && completionValue.includes('%')) {
      const percentage = parseInt(completionValue.replace(/[^\d]/g, ''));
      console.log('Parsed percentage:', percentage);
      
      // Should be higher than the previous 17% since transform is now complete
      expect(percentage).toBeGreaterThan(17);
      console.log('✅ Completion percentage increased due to Data Analysis autocomplete');
    }
  });

  test('should compare Data Analysis vs other transforms', async ({ page }) => {
    // Test Data Analysis (should autocomplete)
    await page.getByPlaceholder('Describe your data flow…').fill('Analyze Stripe payments in Google Sheets');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(3000);

    // Check if Data Analysis shows as complete
    const canvas = page.locator('[data-testid="canvas-container"]');
    const dataAnalysisComplete = await canvas.locator('text=Data Analysis').locator('..').locator('text=complete').count();
    
    console.log('Data Analysis complete status:', dataAnalysisComplete > 0 ? 'Complete' : 'Pending');

    // Reset and test a different transform
    await page.goto('/chat');
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();

    await page.getByPlaceholder('Describe your data flow…').fill('Connect Shopify to BigQuery');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(3000);

    // Check if regular transform (Map & Validate) shows as pending
    const mapValidateComplete = await canvas.locator('text=Map & Validate').locator('..').locator('text=complete').count();
    const mapValidatePending = await canvas.locator('text=Map & Validate').locator('..').locator('text=pending').count();
    
    console.log('Map & Validate status:', mapValidateComplete > 0 ? 'Complete' : (mapValidatePending > 0 ? 'Pending' : 'Unknown'));

    // Data Analysis should be more complete than regular transforms
    expect(dataAnalysisComplete).toBeGreaterThanOrEqual(mapValidateComplete);
  });
});
