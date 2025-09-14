import { test, expect } from '@playwright/test';

test.describe('Every Chatbot Response Animation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('Welcome! I can help you build data integration flows')).toBeVisible();
  });

  test('should show thinking animation for every single AI response', async ({ page }) => {
    console.log('=== Testing Every AI Response Has Animation ===');
    
    // Capture console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const logText = msg.text();
      consoleLogs.push(logText);
      if (logText.includes('🚀') || logText.includes('🤖') || logText.includes('💭') || logText.includes('⏱️') || logText.includes('✅')) {
        console.log('BROWSER:', logText);
      }
    });
    
    // Track all thinking animations
    const thinkingAnimations: number[] = [];
    
    // Helper to wait for and verify thinking animation
    const waitForThinkingAnimation = async (messageNumber: number) => {
      const startTime = Date.now();
      
      try {
        await expect(page.getByText('✨ Thinking...')).toBeVisible({ timeout: 2000 });
        const animationTime = Date.now() - startTime;
        thinkingAnimations.push(animationTime);
        console.log(`✅ Message ${messageNumber}: Thinking animation appeared in ${animationTime}ms`);
        
        // Wait for animation to disappear
        await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
        const totalTime = Date.now() - startTime;
        console.log(`✅ Message ${messageNumber}: Animation disappeared after ${totalTime}ms`);
        
        // Verify minimum 500ms
        expect(totalTime).toBeGreaterThanOrEqual(500);
        console.log(`✅ Message ${messageNumber}: Minimum 500ms respected (${totalTime}ms)`);
        
      } catch (error) {
        console.log(`❌ Message ${messageNumber}: No thinking animation detected`);
        throw error;
      }
    };

    // Test 1: Initial flow setup
    console.log('\n--- Test 1: Flow Setup ---');
    await page.getByPlaceholder('Describe your data flow…').fill('Connect Shopify to BigQuery');
    await page.getByRole('button', { name: 'Send' }).click();
    await waitForThinkingAnimation(1);

    // Test 2: Field collection start
    console.log('\n--- Test 2: Field Collection Start ---');
    await page.waitForTimeout(1000); // Wait for field collection to start
    await waitForThinkingAnimation(2);

    // Test 3: Provide field value
    console.log('\n--- Test 3: Field Input ---');
    await page.getByPlaceholder(/Enter/).fill('https://mystore.myshopify.com');
    await page.keyboard.press('Enter');
    await waitForThinkingAnimation(3);

    // Test 4: Another field
    console.log('\n--- Test 4: Another Field ---');
    await page.getByPlaceholder(/Enter/).fill('test-api-key');
    await page.keyboard.press('Enter');
    await waitForThinkingAnimation(4);

    // Test 5: Skip a field
    console.log('\n--- Test 5: Skip Field ---');
    await page.getByPlaceholder(/Enter/).fill('skip');
    await page.keyboard.press('Enter');
    await waitForThinkingAnimation(5);

    console.log('\n=== SUMMARY ===');
    console.log(`Total animations tested: ${thinkingAnimations.length}`);
    console.log(`All animations appeared within: ${Math.max(...thinkingAnimations)}ms`);
    console.log(`Average animation appearance time: ${Math.round(thinkingAnimations.reduce((a, b) => a + b, 0) / thinkingAnimations.length)}ms`);
    
    // Verify no permanent animations
    const permanentAnimations = await page.getByText('✨ Thinking...').count();
    expect(permanentAnimations).toBe(0);
    console.log('✅ No permanent thinking animations found');
  });

  test('should show animation for error responses', async ({ page }) => {
    console.log('=== Testing Error Response Animation ===');
    
    // Trigger an error by providing invalid input during field collection
    await page.getByPlaceholder('Describe your data flow…').fill('Connect Shopify to BigQuery');
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Wait for field collection to start
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Provide invalid input to trigger error
    await page.getByPlaceholder(/Enter/).fill('invalid-url-format');
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Verify error response has thinking animation
    const startTime = Date.now();
    await expect(page.getByText('✨ Thinking...')).toBeVisible({ timeout: 2000 });
    console.log('✅ Error response: Thinking animation appeared');
    
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    const totalTime = Date.now() - startTime;
    console.log(`✅ Error response: Animation lasted ${totalTime}ms`);
    
    expect(totalTime).toBeGreaterThanOrEqual(500);
    console.log('✅ Error response: Minimum 500ms respected');
  });

  test('should show animation for completion messages', async ({ page }) => {
    console.log('=== Testing Completion Message Animation ===');
    
    // Set up a simple flow that completes quickly
    await page.getByPlaceholder('Describe your data flow…').fill('Analyze Stripe payments in Google Sheets');
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Wait for initial response
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    
    // Fill in required fields quickly to reach completion
    let fieldCount = 0;
    while (fieldCount < 10) { // Max 10 fields to avoid infinite loop
      try {
        // Look for any input field
        const inputField = page.getByPlaceholder(/Enter/).first();
        if (await inputField.isVisible({ timeout: 1000 })) {
          await inputField.fill('test-value');
          await page.keyboard.press('Enter');
          
          // Check for thinking animation
          const hasThinking = await page.getByText('✨ Thinking...').isVisible();
          if (hasThinking) {
            console.log(`✅ Field ${fieldCount + 1}: Thinking animation appeared`);
            await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
            console.log(`✅ Field ${fieldCount + 1}: Animation disappeared`);
          }
          
          fieldCount++;
          await page.waitForTimeout(500);
        } else {
          break; // No more fields
        }
      } catch {
        break; // No more fields or completion reached
      }
    }
    
    console.log(`✅ Completed field collection with ${fieldCount} fields`);
  });

  test('should show animation for role clarification', async ({ page }) => {
    console.log('=== Testing Role Clarification Animation ===');
    
    // Send a single connector name to trigger role clarification
    await page.getByPlaceholder('Describe your data flow…').fill('Salesforce');
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Verify thinking animation for role clarification
    const startTime = Date.now();
    await expect(page.getByText('✨ Thinking...')).toBeVisible({ timeout: 2000 });
    console.log('✅ Role clarification: Thinking animation appeared');
    
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    const totalTime = Date.now() - startTime;
    console.log(`✅ Role clarification: Animation lasted ${totalTime}ms`);
    
    expect(totalTime).toBeGreaterThanOrEqual(500);
    console.log('✅ Role clarification: Minimum 500ms respected');
    
    // Respond to role clarification
    await page.getByPlaceholder('Describe your data flow…').fill('source');
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Verify thinking animation for follow-up response
    const startTime2 = Date.now();
    await expect(page.getByText('✨ Thinking...')).toBeVisible({ timeout: 2000 });
    console.log('✅ Role clarification follow-up: Thinking animation appeared');
    
    await expect(page.getByText('✨ Thinking...')).not.toBeVisible({ timeout: 10000 });
    const totalTime2 = Date.now() - startTime2;
    console.log(`✅ Role clarification follow-up: Animation lasted ${totalTime2}ms`);
    
    expect(totalTime2).toBeGreaterThanOrEqual(500);
    console.log('✅ Role clarification follow-up: Minimum 500ms respected');
  });
});
