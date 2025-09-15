# End-to-End Testing Guide

**User Workflow Testing with Playwright**

## Overview

End-to-End (E2E) testing validates complete user workflows by simulating real user interactions in a browser environment. We use Playwright for its cross-browser support, reliability, and powerful testing capabilities.

## Playwright Setup

### Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Core User Workflows

### Complete Data Flow Creation
```typescript
// user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('user can create data flow from landing to canvas', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/Nexla/);
    
    // Enter data flow description
    await page.fill('[data-testid="search-input"]', 'Connect Shopify to Snowflake');
    await page.click('[data-testid="search-submit"]');
    
    // Should navigate to chat page
    await expect(page).toHaveURL('/chat');
    
    // Should see user message
    await expect(page.locator('[data-testid^="message-user"]'))
      .toContainText('Connect Shopify to Snowflake');
    
    // Should see AI response
    await expect(page.locator('[data-testid^="message-ai"]')).toBeVisible();
    
    // Should see canvas with nodes
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();
    
    // Verify nodes are created
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(3); // Source, Transform, Destination
    
    // Verify node types
    await expect(page.locator('[data-node-type="source"]')).toBeVisible();
    await expect(page.locator('[data-node-type="transform"]')).toBeVisible();
    await expect(page.locator('[data-node-type="destination"]')).toBeVisible();
  });

  test('user can use example prompts', async ({ page }) => {
    await page.goto('/');
    
    // Click on example prompt
    await page.click('[data-testid="example-salesforce-bigquery"]');
    
    // Should auto-fill input
    const input = page.locator('[data-testid="search-input"]');
    await expect(input).toHaveValue('Connect Salesforce contacts to BigQuery');
    
    // Submit and verify navigation
    await page.click('[data-testid="search-submit"]');
    await expect(page).toHaveURL('/chat');
  });
});
```

### Field Collection Workflow
```typescript
// field-collection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Field Collection Workflow', () => {
  test('user can complete field collection for Salesforce', async ({ page }) => {
    await page.goto('/chat');
    
    // Start field collection
    await page.fill('[data-testid="chat-input"]', 'Set up Salesforce connection');
    await page.click('[data-testid="send-button"]');
    
    // Should see field collection question
    await expect(page.locator('[data-testid^="message-ai"]'))
      .toContainText('baseUrl');
    
    // Provide base URL
    await page.fill('[data-testid="chat-input"]', 'https://mycompany.salesforce.com');
    await page.click('[data-testid="send-button"]');
    
    // Should see next field question
    await expect(page.locator('[data-testid^="message-ai"]').last())
      .toContainText('clientId');
    
    // Provide client ID
    await page.fill('[data-testid="chat-input"]', 'client123');
    await page.click('[data-testid="send-button"]');
    
    // Continue field collection
    await expect(page.locator('[data-testid^="message-ai"]').last())
      .toContainText('clientSecret');
    
    // Verify canvas updates
    const sourceNode = page.locator('[data-node-type="source"]');
    await expect(sourceNode).toHaveAttribute('data-status', 'partial');
  });

  test('validates field input formats', async ({ page }) => {
    await page.goto('/chat');
    
    // Start field collection
    await page.fill('[data-testid="chat-input"]', 'Configure email connector');
    await page.click('[data-testid="send-button"]');
    
    // Provide invalid email
    await page.fill('[data-testid="chat-input"]', 'invalid-email');
    await page.click('[data-testid="send-button"]');
    
    // Should see validation error
    await expect(page.locator('[data-testid^="message-ai"]').last())
      .toContainText('valid email format');
    
    // Provide valid email
    await page.fill('[data-testid="chat-input"]', 'user@example.com');
    await page.click('[data-testid="send-button"]');
    
    // Should proceed to next field
    await expect(page.locator('[data-testid^="message-ai"]').last())
      .not.toContainText('valid email format');
  });
});
```

### Canvas Interactions
```typescript
// canvas-interactions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Canvas Interactions', () => {
  test('user can interact with canvas nodes', async ({ page }) => {
    await page.goto('/chat');
    
    // Create a flow
    await page.fill('[data-testid="chat-input"]', 'Connect database to API');
    await page.click('[data-testid="send-button"]');
    
    // Wait for canvas to load
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();
    
    // Click on source node
    const sourceNode = page.locator('[data-node-type="source"]').first();
    await sourceNode.click();
    
    // Should see node selection
    await expect(sourceNode).toHaveClass(/selected/);
    
    // Drag node to new position
    const nodeBox = await sourceNode.boundingBox();
    if (nodeBox) {
      await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(nodeBox.x + 100, nodeBox.y + 50);
      await page.mouse.up();
    }
    
    // Verify node moved
    const newNodeBox = await sourceNode.boundingBox();
    expect(newNodeBox?.x).toBeGreaterThan(nodeBox?.x || 0);
  });

  test('user can use canvas controls', async ({ page }) => {
    await page.goto('/chat');
    
    // Create a flow
    await page.fill('[data-testid="chat-input"]', 'Simple data flow');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();
    
    // Test auto-layout button
    await page.click('[aria-label="Auto-layout nodes"]');
    
    // Test add node button
    await page.click('[aria-label="Add source node"]');
    
    // Should see new node
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(4); // Original 3 + 1 new
  });

  test('canvas responds to chat updates', async ({ page }) => {
    await page.goto('/chat');
    
    // Initial flow
    await page.fill('[data-testid="chat-input"]', 'Connect A to B');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(3);
    
    // Add another connection
    await page.fill('[data-testid="chat-input"]', 'Also connect to C');
    await page.click('[data-testid="send-button"]');
    
    // Should see additional node
    await expect(page.locator('.react-flow__node')).toHaveCount(4);
  });
});
```

## Cross-Browser Testing

### Browser Compatibility
```typescript
// cross-browser.spec.ts
import { test, devices } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`${browserName} Tests`, () => {
    test('landing page loads correctly', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Nexla');
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    });

    test('chat interface works', async ({ page }) => {
      await page.goto('/chat');
      await page.fill('[data-testid="chat-input"]', 'Test message');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid^="message-user"]')).toBeVisible();
    });
  });
});
```

### Mobile Testing
```typescript
// mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ ...devices['iPhone 12'] });

  test('mobile navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile layout
    await expect(page.locator('[data-testid="search-card"]')).toBeVisible();
    
    // Test touch interactions
    await page.tap('[data-testid="search-input"]');
    await page.fill('[data-testid="search-input"]', 'Mobile test');
    await page.tap('[data-testid="search-submit"]');
    
    await expect(page).toHaveURL('/chat');
  });

  test('mobile chat interface', async ({ page }) => {
    await page.goto('/chat');
    
    // Check mobile chat layout
    const chatSection = page.locator('[data-testid="chat-section"]');
    await expect(chatSection).toHaveCSS('min-height', /50vh/);
    
    // Test mobile input
    await page.tap('[data-testid="chat-input"]');
    await page.fill('[data-testid="chat-input"]', 'Mobile chat test');
    await page.tap('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid^="message-user"]')).toBeVisible();
  });

  test('mobile canvas interaction', async ({ page }) => {
    await page.goto('/chat');
    
    // Create flow
    await page.fill('[data-testid="chat-input"]', 'Create flow');
    await page.tap('[data-testid="send-button"]');
    
    // Check mobile canvas
    const canvas = page.locator('[data-testid="canvas-container"]');
    await expect(canvas).toHaveCSS('min-height', /100vh/);
    
    // Test touch interactions on nodes
    const node = page.locator('.react-flow__node').first();
    await page.tap(node);
    await expect(node).toHaveClass(/selected/);
  });
});
```

## Accessibility Testing

### WCAG Compliance
```typescript
// accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('landing page meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('chat page meets WCAG standards', async ({ page }) => {
    await page.goto('/chat');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-submit');
    
    // Test Enter key
    await page.fill('[data-testid="search-input"]', 'Keyboard test');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/chat');
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/chat');
    
    // Check ARIA labels
    await expect(page.locator('[data-testid="chat-input"]'))
      .toHaveAttribute('aria-label', 'Message input');
    
    await expect(page.locator('[data-testid="send-button"]'))
      .toHaveAttribute('aria-label', 'Send message');
    
    // Check live regions
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });
});
```

## Performance Testing

### Loading Performance
```typescript
// performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  test('bundle size is within limits', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check main bundle size
    const resources = await page.evaluate(() => 
      performance.getEntriesByType('resource')
        .filter(r => r.name.includes('index') && r.name.includes('.js'))
    );
    
    expect(resources.length).toBeGreaterThan(0);
    expect(resources[0].transferSize).toBeLessThan(500 * 1024); // 500KB limit
  });

  test('canvas renders efficiently', async ({ page }) => {
    await page.goto('/chat');
    
    const startTime = Date.now();
    
    // Create complex flow
    await page.fill('[data-testid="chat-input"]', 'Create complex data pipeline');
    await page.click('[data-testid="send-button"]');
    
    // Wait for canvas to render
    await expect(page.locator('.react-flow__node')).toHaveCount(3);
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(2000); // 2 second render budget
  });
});
```

## Test Data Management

### Test Fixtures
```typescript
// fixtures/testData.ts
export const testFlows = {
  simple: {
    input: 'Connect database to API',
    expectedNodes: 3,
    expectedNodeTypes: ['source', 'transform', 'destination']
  },
  complex: {
    input: 'Multi-step data pipeline with validation and transformation',
    expectedNodes: 5,
    expectedNodeTypes: ['source', 'transform', 'transform', 'destination', 'destination']
  }
};

export const fieldCollectionData = {
  salesforce: {
    baseUrl: 'https://test.salesforce.com',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    username: 'test@example.com',
    password: 'test-password'
  }
};
```

### Page Object Model
```typescript
// pages/ChatPage.ts
export class ChatPage {
  constructor(private page: Page) {}

  async sendMessage(message: string) {
    await this.page.fill('[data-testid="chat-input"]', message);
    await this.page.click('[data-testid="send-button"]');
  }

  async waitForAIResponse() {
    await this.page.waitForSelector('[data-testid^="message-ai"]');
  }

  async getLastMessage() {
    return this.page.locator('[data-testid^="message-"]').last();
  }

  async getCanvasNodeCount() {
    return this.page.locator('.react-flow__node').count();
  }
}
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Test Organization
- **User-Centric**: Focus on user workflows, not implementation
- **Reliable**: Use stable selectors and wait strategies
- **Maintainable**: Page Object Model for reusable components
- **Fast**: Parallel execution and efficient test design

### Debugging
```typescript
// Debug helpers
test('debug test', async ({ page }) => {
  await page.goto('/');
  
  // Pause for manual inspection
  await page.pause();
  
  // Take screenshot
  await page.screenshot({ path: 'debug.png' });
  
  // Console logs
  page.on('console', msg => console.log(msg.text()));
});
```

E2E testing ensures the complete user experience works correctly across different browsers and devices, providing confidence in the application's real-world functionality.
