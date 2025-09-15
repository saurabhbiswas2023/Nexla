# Unit Testing Guide

**Component and Service Testing with Vitest**

## Overview

Unit testing forms the foundation of our testing strategy, providing fast feedback and ensuring individual components and services work correctly in isolation. We use Vitest for its speed, TypeScript support, and Jest compatibility.

## Testing Framework Setup

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
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

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_OPENROUTER_API_KEY: 'test-api-key'
  }
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

## Component Testing Patterns

### Atom Component Testing
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
    expect(screen.getByRole('button')).toHaveClass('bg-violet-600');
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

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Molecule Component Testing
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
        createdAt={Date.now()}
      />
    );
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByTestId('message-user')).toHaveClass('ml-auto');
  });

  it('renders AI message correctly', () => {
    render(
      <MessageBubble 
        type="ai" 
        content="AI response" 
        status="sent" 
        createdAt={Date.now()}
      />
    );
    
    expect(screen.getByText('AI response')).toBeInTheDocument();
    expect(screen.getByText('NexBot')).toBeInTheDocument();
    expect(screen.getByTestId('message-ai')).not.toHaveClass('ml-auto');
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
    expect(screen.queryByText('AI response')).not.toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const timestamp = new Date('2023-01-01T12:30:00').getTime();
    render(
      <MessageBubble 
        type="user" 
        content="Test" 
        createdAt={timestamp}
      />
    );
    
    expect(screen.getByText('12:30')).toBeInTheDocument();
  });

  it('highlights message when requested', () => {
    render(
      <MessageBubble 
        type="user" 
        content="Test" 
        highlight={true}
      />
    );
    
    expect(screen.getByTestId('message-user')).toHaveClass('ring-2');
  });
});
```

### Organism Component Testing
```typescript
// Canvas.test.tsx
import { render, screen } from '@testing-library/react';
import { Canvas } from './Canvas';
import { useCanvasStore } from '../../store/canvasStore';

// Mock the store
vi.mock('../../store/canvasStore');
const mockUseCanvasStore = useCanvasStore as vi.MockedFunction<typeof useCanvasStore>;

describe('Canvas', () => {
  beforeEach(() => {
    mockUseCanvasStore.mockReturnValue({
      nodes: [],
      edges: [],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      addNode: vi.fn(),
      updateNode: vi.fn(),
      deleteNode: vi.fn(),
    });
  });

  it('renders empty canvas', () => {
    render(<Canvas />);
    expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
  });

  it('renders nodes when present', () => {
    mockUseCanvasStore.mockReturnValue({
      nodes: [
        { 
          id: '1', 
          type: 'source', 
          position: { x: 0, y: 0 },
          data: { label: 'Test Node' } 
        }
      ],
      edges: [],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
    });
    
    render(<Canvas />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('shows controls when enabled', () => {
    render(<Canvas showControls={true} />);
    expect(screen.getByLabelText('Auto-layout nodes')).toBeInTheDocument();
    expect(screen.getByLabelText('Add source node')).toBeInTheDocument();
  });

  it('shows JSON panel when enabled', () => {
    render(<Canvas showJsonPanel={true} />);
    expect(screen.getByText('Flow Configuration')).toBeInTheDocument();
  });
});
```

## Service Testing

### API Service Testing
```typescript
// openAIService.test.ts
import { openAIService } from './openAIService';

// Mock fetch
global.fetch = vi.fn();

describe('OpenAI Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends message successfully', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'AI response' } }]
    };
    
    (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const response = await openAIService.sendMessage('Hello');
    expect(response).toBe('AI response');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openai.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
        }),
      })
    );
  });

  it('handles API errors gracefully', async () => {
    (fetch as vi.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(openAIService.sendMessage('Hello'))
      .rejects.toThrow('Network error');
  });

  it('validates API responses', async () => {
    const invalidResponse = { error: 'Invalid request' };
    
    (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      json: async () => invalidResponse,
    } as Response);

    await expect(openAIService.sendMessage('Hello'))
      .rejects.toThrow('API request failed');
  });
});
```

### Utility Service Testing
```typescript
// fieldCollectionService.test.ts
import { fieldCollectionService } from './fieldCollectionService';

describe('Field Collection Service', () => {
  beforeEach(() => {
    fieldCollectionService.reset();
  });

  it('starts collection for source node', () => {
    const step = fieldCollectionService.startCollection('source', 'Salesforce');
    
    expect(step.nodeType).toBe('source');
    expect(step.question).toContain('baseUrl');
    expect(step.currentStepIndex).toBe(0);
  });

  it('processes valid field input', async () => {
    fieldCollectionService.startCollection('source', 'Salesforce');
    
    const result = await fieldCollectionService.processInput(
      'baseUrl', 
      'https://mycompany.salesforce.com'
    );
    
    expect(result.isValid).toBe(true);
    expect(result.nextField).toBe('clientId');
  });

  it('validates field formats', () => {
    const emailValidation = fieldCollectionService.validateField(
      'email', 
      'invalid-email'
    );
    expect(emailValidation.isValid).toBe(false);
    expect(emailValidation.error).toContain('email format');

    const validEmailValidation = fieldCollectionService.validateField(
      'email', 
      'user@example.com'
    );
    expect(validEmailValidation.isValid).toBe(true);
  });

  it('detects collection completion', () => {
    fieldCollectionService.startCollection('source', 'Salesforce');
    
    // Process all required fields
    fieldCollectionService.processInput('baseUrl', 'https://test.com');
    fieldCollectionService.processInput('clientId', 'client123');
    fieldCollectionService.processInput('clientSecret', 'secret123');
    
    expect(fieldCollectionService.isCollectionComplete()).toBe(true);
  });
});
```

## Store Testing

### Zustand Store Testing
```typescript
// chatStore.test.ts
import { useChatStore } from './chat';
import { renderHook, act } from '@testing-library/react';

describe('Chat Store', () => {
  beforeEach(() => {
    // Reset store state
    useChatStore.getState().resetStore();
  });

  it('adds messages correctly', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        type: 'user',
        content: 'Hello',
        status: 'sent'
      });
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[0].type).toBe('user');
  });

  it('manages input state', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.setInput('Test message');
    });
    
    expect(result.current.input).toBe('Test message');
  });

  it('handles field collection workflow', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.startFieldCollection('source', 'Salesforce');
    });
    
    expect(result.current.isCollectingFields).toBe(true);
    expect(result.current.collectionStep).toBeDefined();
    expect(result.current.collectionStep?.nodeType).toBe('source');
  });

  it('resets store state', () => {
    const { result } = renderHook(() => useChatStore());
    
    // Add some state
    act(() => {
      result.current.addMessage({ type: 'user', content: 'Test', status: 'sent' });
      result.current.setInput('Test input');
    });
    
    // Reset
    act(() => {
      result.current.resetStore();
    });
    
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.input).toBe('');
    expect(result.current.isCollectingFields).toBe(false);
  });
});
```

## Test Utilities

### Custom Render Function
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

### Mock Data Factories
```typescript
// test-fixtures.ts
export const createMockMessage = (overrides = {}) => ({
  id: `msg-${Date.now()}`,
  type: 'user' as const,
  content: 'Test message',
  status: 'sent' as const,
  createdAt: Date.now(),
  ...overrides
});

export const createMockNode = (overrides = {}) => ({
  id: `node-${Date.now()}`,
  type: 'source' as const,
  position: { x: 0, y: 0 },
  data: { 
    label: 'Test Node',
    status: 'pending' as const,
    configuration: {}
  },
  ...overrides
});

export const createMockCanvasState = (overrides = {}) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides
});
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# View coverage report
open coverage/index.html
```

## Best Practices

### Test Structure
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the code under test
3. **Assert**: Verify the expected behavior

### Naming Conventions
- **Test Files**: `ComponentName.test.tsx`
- **Test Descriptions**: Clear, descriptive test names
- **Test Groups**: Logical describe blocks

### Mock Strategy
- **External Dependencies**: Mock all external services
- **Store Dependencies**: Mock Zustand stores
- **Component Dependencies**: Mock complex child components
- **API Calls**: Mock all network requests

### Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('meets accessibility requirements', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Unit testing ensures code reliability, catches regressions early, and provides documentation for component behavior through executable specifications.
