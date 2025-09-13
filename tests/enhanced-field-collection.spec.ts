import { test, expect } from '@playwright/test';

test.describe('Enhanced Field Collection System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should collect mandatory fields first, then optional fields with skip option', async ({ page }) => {
    // Navigate to chat page via predefined button
    await page.click('text=Connect Shopify to BigQuery');
    
    // Wait for chat page to load
    await expect(page.locator('text=Perfect! I\'ve identified your systems')).toBeVisible();
    
    // Should ask for Shopify store domain first (mandatory field 1/2)
    await expect(page.locator('text=What\'s your Shopify store domain')).toBeVisible();
    await expect(page.locator('text=(1/2 required fields)')).toBeVisible();
    
    // Enter store domain
    const input = page.locator('textarea[placeholder="Type your message..."]');
    await input.fill('acme.myshopify.com');
    await page.click('button[aria-label="Send message"]');
    
    // Should ask for API key next (mandatory field 2/2)
    await expect(page.locator('text=What\'s your Shopify API key')).toBeVisible();
    await expect(page.locator('text=(2/2 required fields)')).toBeVisible();
    
    // Enter API key
    await input.fill('sk-abc123def456');
    await page.click('button[aria-label="Send message"]');
    
    // Should now ask for optional fields with skip option
    await expect(page.locator('text=Optional - you can type \'skip\' to continue')).toBeVisible();
    
    // Test skipping an optional field
    await input.fill('skip');
    await page.click('button[aria-label="Send message"]');
    
    // Should confirm the skip
    await expect(page.locator('text=Okay, I\'ll skip')).toBeVisible();
    
    // Should move to next optional field or complete the node
    // Let's test providing a value for the next optional field
    if (await page.locator('text=Optional - you can type \'skip\' to continue').isVisible()) {
      await input.fill('2023-04');
      await page.click('button[aria-label="Send message"]');
    }
    
    // Should eventually move to transform node with completion message
    await expect(page.locator('text=Great! Your source system is fully configured')).toBeVisible();
    await expect(page.locator('text=What type of data transformation do you need')).toBeVisible();
  });

  test('should complete entire flow with node-by-node collection', async ({ page }) => {
    // Navigate to chat page
    await page.click('text=Connect Shopify to BigQuery');
    
    // Complete Source Node (Shopify)
    await expect(page.locator('text=What\'s your Shopify store domain')).toBeVisible();
    
    const input = page.locator('textarea[placeholder="Type your message..."]');
    
    // Mandatory field 1
    await input.fill('test.myshopify.com');
    await page.click('button[aria-label="Send message"]');
    
    // Mandatory field 2
    await expect(page.locator('text=What\'s your Shopify API key')).toBeVisible();
    await input.fill('sk-test123');
    await page.click('button[aria-label="Send message"]');
    
    // Skip all optional fields for source
    while (await page.locator('text=Optional - you can type \'skip\' to continue').isVisible()) {
      await input.fill('skip');
      await page.click('button[aria-label="Send message"]');
      
      // Wait for response
      await page.waitForTimeout(500);
    }
    
    // Should move to Transform Node
    await expect(page.locator('text=Great! Your source system is fully configured')).toBeVisible();
    await expect(page.locator('text=What type of data transformation')).toBeVisible();
    
    // Select transform
    await input.fill('Map & Validate');
    await page.click('button[aria-label="Send message"]');
    
    // Should move to Destination Node (BigQuery)
    await expect(page.locator('text=Great! Your transformation is fully configured')).toBeVisible();
    await expect(page.locator('text=What\'s your Google BigQuery')).toBeVisible();
    
    // Complete BigQuery mandatory fields
    await input.fill('test-user@gmail.com');
    await page.click('button[aria-label="Send message"]');
    
    // Next mandatory field
    await expect(page.locator('text=What\'s your Google BigQuery')).toBeVisible();
    await input.fill('test-password-123');
    await page.click('button[aria-label="Send message"]');
    
    // Skip optional fields for destination
    while (await page.locator('text=Optional - you can type \'skip\' to continue').isVisible()) {
      await input.fill('skip');
      await page.click('button[aria-label="Send message"]');
      await page.waitForTimeout(500);
    }
    
    // Should complete the entire flow
    await expect(page.locator('text=Perfect! Your data flow is now fully configured')).toBeVisible();
  });

  test('should handle different skip commands', async ({ page }) => {
    // Navigate to chat page
    await page.click('text=Connect Shopify to BigQuery');
    
    const input = page.locator('textarea[placeholder="Type your message..."]');
    
    // Complete mandatory fields to get to optional fields
    await input.fill('test.myshopify.com');
    await page.click('button[aria-label="Send message"]');
    
    await input.fill('sk-test123');
    await page.click('button[aria-label="Send message"]');
    
    // Test different skip commands
    const skipCommands = ['skip', 'no', 'none', 'pass', 'next', 'continue'];
    
    for (const skipCommand of skipCommands) {
      if (await page.locator('text=Optional - you can type \'skip\' to continue').isVisible()) {
        await input.fill(skipCommand);
        await page.click('button[aria-label="Send message"]');
        
        // Should confirm the skip
        await expect(page.locator('text=Okay, I\'ll skip')).toBeVisible();
        
        await page.waitForTimeout(300);
      } else {
        break; // No more optional fields
      }
    }
  });

  test('should show progress indicators for mandatory fields', async ({ page }) => {
    // Navigate to chat page
    await page.click('text=Connect Shopify to BigQuery');
    
    // Should show progress for mandatory fields
    await expect(page.locator('text=(1/2 required fields)')).toBeVisible();
    
    const input = page.locator('textarea[placeholder="Type your message..."]');
    await input.fill('test.myshopify.com');
    await page.click('button[aria-label="Send message"]');
    
    // Should show progress for second mandatory field
    await expect(page.locator('text=(2/2 required fields)')).toBeVisible();
    
    await input.fill('sk-test123');
    await page.click('button[aria-label="Send message"]');
    
    // Should no longer show mandatory field progress, now on optional fields
    await expect(page.locator('text=Optional - you can type \'skip\' to continue')).toBeVisible();
  });

  test('should validate canvas updates during field collection', async ({ page }) => {
    // Navigate to chat page
    await page.click('text=Connect Shopify to BigQuery');
    
    const input = page.locator('textarea[placeholder="Type your message..."]');
    
    // Fill in source fields and verify canvas updates
    await input.fill('test.myshopify.com');
    await page.click('button[aria-label="Send message"]');
    
    // Check if canvas shows the updated field (storeDomain should be visible)
    await expect(page.locator('text=test.myshopify.com')).toBeVisible();
    
    await input.fill('sk-test123');
    await page.click('button[aria-label="Send message"]');
    
    // Check if canvas shows the API key field (should be masked)
    await expect(page.locator('text=***')).toBeVisible();
    
    // Skip optional fields to move to transform
    while (await page.locator('text=Optional - you can type \'skip\' to continue').isVisible()) {
      await input.fill('skip');
      await page.click('button[aria-label="Send message"]');
      await page.waitForTimeout(300);
    }
    
    // Select transform and verify canvas update
    await input.fill('Map & Validate');
    await page.click('button[aria-label="Send message"]');
    
    // Canvas should show Map & Validate transform
    await expect(page.locator('text=Map & Validate')).toBeVisible();
  });
});
