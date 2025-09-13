import { test, expect } from '@playwright/test';

test.describe('Debug Field Collection', () => {
  test('should debug field collection system step by step', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:5173');
    
    // Take screenshot of landing page
    await page.screenshot({ path: 'test-results/01-landing-page.png' });
    
    // Check if predefined buttons exist
    const shopifyButton = page.locator('text=Connect Shopify to BigQuery');
    await expect(shopifyButton).toBeVisible();
    
    console.log('✅ Landing page loaded with predefined buttons');
    
    // Click the predefined button
    await shopifyButton.click();
    
    // Wait for navigation to chat page
    await page.waitForURL('**/chat');
    
    // Take screenshot of chat page
    await page.screenshot({ path: 'test-results/02-chat-page-initial.png' });
    
    // Check what messages are visible
    const messages = await page.locator('[data-testid="message"], .message, [class*="message"]').all();
    console.log(`Found ${messages.length} messages on chat page`);
    
    // Check for specific text patterns
    const welcomeText = page.locator('text=Welcome');
    const identifiedText = page.locator('text=identified your systems');
    const configureText = page.locator('text=configure');
    
    console.log('Checking for welcome message...');
    if (await welcomeText.isVisible()) {
      console.log('✅ Welcome message found');
    }
    
    console.log('Checking for identified systems message...');
    if (await identifiedText.isVisible()) {
      console.log('✅ Identified systems message found');
    }
    
    console.log('Checking for configure message...');
    if (await configureText.isVisible()) {
      console.log('✅ Configure message found');
    }
    
    // Check for input textarea
    const textareas = await page.locator('textarea').all();
    console.log(`Found ${textareas.length} textarea elements`);
    
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`Found ${inputs.length} text input elements`);
    
    // Check for any input element
    const anyInput = page.locator('textarea, input[type="text"]').first();
    
    if (await anyInput.isVisible()) {
      console.log('✅ Input element found');
      
      // Try to interact with it
      await anyInput.fill('test input');
      console.log('✅ Successfully filled input');
      
      // Look for send button
      const sendButtons = await page.locator('button').all();
      console.log(`Found ${sendButtons.length} button elements`);
      
      const sendButton = page.locator('button[aria-label="Send message"], button:has-text("Send"), [data-testid="send-button"]').first();
      
      if (await sendButton.isVisible()) {
        console.log('✅ Send button found');
        await sendButton.click();
        console.log('✅ Send button clicked');
        
        // Wait for response
        await page.waitForTimeout(2000);
        
        // Take screenshot after interaction
        await page.screenshot({ path: 'test-results/03-after-input.png' });
      } else {
        console.log('❌ Send button not found');
      }
    } else {
      console.log('❌ No input element found');
    }
    
    // Print page content for debugging
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);
    
    // Check for any error messages in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
  });
});
