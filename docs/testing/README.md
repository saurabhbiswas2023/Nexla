# 🧪 **TESTING DOCUMENTATION**

**Comprehensive Testing Strategy and Implementation**  
**Version 1.0.0** | **Enterprise-Grade Quality Assurance**

---

## **📋 OVERVIEW**

The Nexla Data Flow Architect implements a comprehensive testing strategy following the testing pyramid approach, ensuring high-quality, reliable, and maintainable code through automated testing at multiple levels.

---

## **🏗️ TESTING ARCHITECTURE**

### **Testing Pyramid**
```
        ┌─────────────┐
        │     E2E     │  ← 10% - User workflows, integration scenarios
        │  (Playwright)│     Complete user journeys, cross-browser testing
        └─────────────┘
      ┌─────────────────┐
      │   Integration   │  ← 20% - Component integration, API testing
      │   (Vitest)      │     Store interactions, service integration
      └─────────────────┘
    ┌─────────────────────┐
    │      Unit Tests     │  ← 70% - Component logic, utility functions
    │      (Vitest)       │     Fast, isolated, comprehensive coverage
    └─────────────────────┘
```

### **Testing Philosophy**
- **Fast Feedback**: Unit tests provide immediate feedback during development
- **Confidence**: Integration tests ensure components work together
- **User Focus**: E2E tests validate complete user workflows
- **Accessibility**: Automated WCAG 2.1 AA compliance testing
- **Performance**: Bundle size and loading time validation

---

## **🔧 TESTING TOOLS & SETUP**

### **Core Testing Stack**
- **[Vitest](https://vitest.dev/)** - Fast unit and integration testing
- **[Playwright](https://playwright.dev/)** - Cross-browser E2E testing
- **[Testing Library](https://testing-library.com/)** - User-centric testing utilities
- **[axe-core](https://github.com/dequelabs/axe-core)** - Accessibility testing
- **[MSW](https://mswjs.io/)** - API mocking for tests

### **Configuration Files**
```
Nexla/
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
├── .github/workflows/        # CI/CD test automation
└── tests/
    ├── unit/                 # Unit test files
    ├── integration/          # Integration test files
    ├── e2e/                  # End-to-end test files
    ├── fixtures/             # Test data and fixtures
    └── helpers/              # Test utilities and helpers
```

---

## **🎯 UNIT TESTING**

### **Component Testing Strategy**
Every component follows a standardized testing approach:

#### **Atoms Testing**
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### **Molecules Testing**
```typescript
// MessageBubble.test.tsx
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    render(
      <MessageBubble 
        type="user" 
        content="Hello world" 
        status="sent" 
      />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('renders AI message correctly', () => {
    render(
      <MessageBubble 
        type="ai" 
        content="AI response" 
        status="sent" 
      />
    );
    expect(screen.getByText('AI response')).toBeInTheDocument();
    expect(screen.getByText('NexBot')).toBeInTheDocument();
  });

  it('shows thinking animation for AI', () => {
    render(
      <MessageBubble 
        type="ai" 
        content="" 
        status="thinking" 
      />
    );
    expect(screen.getByTestId('thinking-animation')).toBeInTheDocument();
  });
});
```

#### **Organisms Testing**
```typescript
// Canvas.test.tsx
import { render, screen } from '@testing-library/react';
import { Canvas } from './Canvas';
import { useCanvasStore } from '../../store/canvasStore';

// Mock the store
vi.mock('../../store/canvasStore');

describe('Canvas', () => {
  beforeEach(() => {
    useCanvasStore.mockReturnValue({
      nodes: [],
      edges: [],
      addNode: vi.fn(),
      updateNode: vi.fn(),
    });
  });

  it('renders empty canvas', () => {
    render(<Canvas />);
    expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
  });

  it('renders nodes when present', () => {
    useCanvasStore.mockReturnValue({
      nodes: [{ id: '1', type: 'source', data: { label: 'Test Node' } }],
      edges: [],
    });
    
    render(<Canvas />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });
});
```

### **Service Testing**
```typescript
// openRouterService.test.ts
import { openRouterService } from './openRouterService';

describe('OpenRouter Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('sends message successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      choices: [{ message: { content: 'AI response' } }]
    }));

    const response = await openRouterService.sendMessage('Hello');
    expect(response).toBe('AI response');
  });

  it('handles API errors gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));

    await expect(openRouterService.sendMessage('Hello'))
      .rejects.toThrow('API Error');
  });
});
```

---

## **🔗 INTEGRATION TESTING**

### **Store Integration Testing**
```typescript
// chatStore.integration.test.ts
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';

describe('Chat Store Integration', () => {
  beforeEach(() => {
    useChatStore.getState().resetStore();
    useCanvasStore.getState().resetStore();
  });

  it('updates canvas when chat message is sent', async () => {
    const chatStore = useChatStore.getState();
    const canvasStore = useCanvasStore.getState();

    await chatStore.sendWithCanvasUpdate();

    expect(canvasStore.nodes).toHaveLength(1);
    expect(chatStore.messages).toHaveLength(2); // User + AI response
  });

  it('handles field collection workflow', async () => {
    const chatStore = useChatStore.getState();
    
    // Start field collection
    chatStore.startFieldCollection('source', 'Salesforce');
    expect(chatStore.isCollectingFields).toBe(true);

    // Process field input
    await chatStore.processCollectionInput('username', 'test@example.com');
    expect(chatStore.collectionData.username).toBe('test@example.com');
  });
});
```

### **Component Integration Testing**
```typescript
// ChatPage.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPage } from './ChatPage';
import { BrowserRouter } from 'react-router-dom';

const renderChatPage = () => {
  return render(
    <BrowserRouter>
      <ChatPage />
    </BrowserRouter>
  );
};

describe('ChatPage Integration', () => {
  it('sends message and updates canvas', async () => {
    renderChatPage();
    
    const input = screen.getByPlaceholderText('Describe your data flow…');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Connect Salesforce to BigQuery' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Connect Salesforce to BigQuery')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
    });
  });
});
```

---

## **🌐 END-TO-END TESTING**

### **User Workflow Testing**
```typescript
// user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('user can create data flow from landing to canvas', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Enter data flow description
    await page.fill('[data-testid="search-input"]', 'Connect Shopify to Snowflake');
    await page.click('[data-testid="search-submit"]');
    
    // Should navigate to chat page
    await expect(page).toHaveURL('/chat');
    
    // Should see user message
    await expect(page.locator('[data-testid^="message-user"]')).toContainText('Connect Shopify to Snowflake');
    
    // Should see AI response
    await expect(page.locator('[data-testid^="message-ai"]')).toBeVisible();
    
    // Should see canvas with nodes
    await expect(page.locator('[data-testid="canvas-container"]')).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(3); // Source, Transform, Destination
  });

  test('user can interact with field collection', async ({ page }) => {
    await page.goto('/chat');
    
    // Trigger field collection
    await page.fill('[data-testid="chat-input"]', 'Set up Salesforce connection');
    await page.click('[data-testid="send-button"]');
    
    // Should see field collection question
    await expect(page.locator('[data-testid^="message-ai"]')).toContainText('baseUrl');
    
    // Provide field value
    await page.fill('[data-testid="chat-input"]', 'https://mycompany.salesforce.com');
    await page.click('[data-testid="send-button"]');
    
    // Should see next field question
    await expect(page.locator('[data-testid^="message-ai"]')).toContainText('clientId');
  });
});
```

### **Cross-Browser Testing**
```typescript
// cross-browser.spec.ts
import { test, devices } from '@playwright/test';

// Test on different browsers and devices
const browsers = ['chromium', 'firefox', 'webkit'];
const devices_list = [devices['iPhone 12'], devices['iPad'], devices['Desktop Chrome']];

browsers.forEach(browserName => {
  test.describe(`${browserName} Tests`, () => {
    test('landing page loads correctly', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Nexla');
    });
  });
});
```

### **Accessibility E2E Testing**
```typescript
// accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('landing page meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('chat page keyboard navigation works', async ({ page }) => {
    await page.goto('/chat');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'chat-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'send-button');
  });
});
```

---

## **📊 PERFORMANCE TESTING**

### **Bundle Size Testing**
```typescript
// bundle-size.test.ts
import { test, expect } from '@playwright/test';

test('bundle size is within limits', async ({ page }) => {
  const response = await page.goto('/');
  const resources = await page.evaluate(() => 
    performance.getEntriesByType('resource')
  );
  
  const jsBundle = resources.find(r => r.name.includes('index') && r.name.includes('.js'));
  expect(jsBundle.transferSize).toBeLessThan(500 * 1024); // 500KB limit
});
```

### **Loading Performance Testing**
```typescript
// performance.spec.ts
import { test, expect } from '@playwright/test';

test('page loads within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second budget
});
```

---

## **🔒 SECURITY TESTING**

### **Input Validation Testing**
```typescript
// security.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './ChatInput';

describe('Security Tests', () => {
  it('sanitizes XSS attempts', () => {
    const handleSubmit = vi.fn();
    render(<ChatInput onSubmit={handleSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { 
      target: { value: '<script>alert("xss")</script>' } 
    });
    fireEvent.submit(input.closest('form'));
    
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.not.stringContaining('<script>')
    );
  });
});
```

---

## **📈 TEST COVERAGE & REPORTING**

### **Coverage Requirements**
- **Overall Coverage**: >80%
- **Component Coverage**: >90%
- **Service Coverage**: >85%
- **Critical Path Coverage**: 100%

### **Coverage Configuration**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### **Test Reports**
```bash
# Generate coverage report
npm run test:coverage

# Generate HTML report
npm run test:coverage:html

# View coverage report
open coverage/index.html
```

---

## **🚀 CONTINUOUS INTEGRATION**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:a11y
```

---

## **🛠️ TESTING UTILITIES**

### **Custom Test Helpers**
```typescript
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### **Mock Data Factory**
```typescript
// test-fixtures.ts
export const createMockMessage = (overrides = {}) => ({
  id: 'msg-1',
  type: 'user' as const,
  content: 'Test message',
  status: 'sent' as const,
  createdAt: Date.now(),
  ...overrides
});

export const createMockNode = (overrides = {}) => ({
  id: 'node-1',
  type: 'source' as const,
  position: { x: 0, y: 0 },
  data: { label: 'Test Node' },
  ...overrides
});
```

---

## **📋 TESTING CHECKLIST**

### **Before Committing**
- [ ] All unit tests pass
- [ ] Coverage meets requirements (>80%)
- [ ] Integration tests pass
- [ ] Accessibility tests pass
- [ ] No console errors or warnings

### **Before Releasing**
- [ ] Full E2E test suite passes
- [ ] Cross-browser testing complete
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Manual testing on mobile devices

---

## **🎯 BEST PRACTICES**

### **Writing Good Tests**
1. **Test Behavior, Not Implementation**: Focus on what the component does, not how
2. **Use Descriptive Names**: Test names should explain the scenario and expected outcome
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
4. **Test Edge Cases**: Include error conditions and boundary values
5. **Keep Tests Independent**: Each test should be able to run in isolation

### **Test Maintenance**
1. **Update Tests with Code Changes**: Keep tests synchronized with implementation
2. **Refactor Test Code**: Apply same quality standards to test code
3. **Remove Obsolete Tests**: Clean up tests for removed features
4. **Monitor Test Performance**: Keep test suite execution time reasonable

---

## **📞 SUPPORT & RESOURCES**

### **Documentation Links**
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)

### **Getting Help**
- Review existing test examples
- Check testing utilities and helpers
- Consult team testing guidelines
- Contact QA team for complex scenarios

---

**Testing is not just about finding bugs—it's about building confidence in our code and ensuring a great user experience.**
