# 🎯 **NEXLA DATA FLOW ARCHITECT - CODING RULES & CONTEXT**

## **📋 OVERVIEW**

This document provides comprehensive coding rules, context, and guidelines for the Nexla Data Flow Architect project. It serves as the definitive reference for all development work, ensuring consistency, quality, and adherence to established patterns.

---

## **🏗️ PROJECT ARCHITECTURE CONTEXT**

### **Core Technology Stack**

- **Frontend Framework**: React 18+ with hooks and functional components
- **Language**: TypeScript (strict typing, avoid `any` types)
- **Styling**: Tailwind CSS with utility-first approach
- **Routing**: React Router for client-side navigation
- **State Management**: Zustand with devtools and persist middleware
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Playwright (E2E), Vitest (Unit), jsdom

### **Application Type**

- **Single Page Application (SPA)** with client-side routing
- **Conversational data integration platform**
- **Interactive flow diagram visualization**
- **Real-time chat interface with AI responses**

---

## **🎨 DESIGN SYSTEM PRINCIPLES**

### **Atomic Design Methodology**

Follow Brad Frost's Atomic Design pattern strictly:

#### **Atoms** (`src/components/atoms/`)

```typescript
// ✅ CORRECT: Single responsibility, no business logic
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} min-h-[44px] min-w-[44px]`}
      {...props}
    />
  );
};
```

#### **Molecules** (`src/components/molecules/`)

```typescript
// ✅ CORRECT: Combine 2-3 atoms with specific purpose
interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export const MessageBubble = ({ message, sender, timestamp, isLoading }: MessageBubbleProps) => {
  return (
    <div className={`flex gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Avatar type={sender} />
      <div className="flex flex-col">
        <Typography variant="body">{message}</Typography>
        <Typography variant="caption">{formatTime(timestamp)}</Typography>
      </div>
      {isLoading && <Spinner size="sm" />}
    </div>
  );
};
```

#### **Organisms** (`src/components/organisms/`)

```typescript
// ✅ CORRECT: Complex components with business logic
export const ChatInterface = () => {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <InputArea
        value={input}
        onChange={setInput}
        onSend={sendMessage}
      />
    </div>
  );
};
```

---

## **📱 MOBILE-FIRST RESPONSIVE DESIGN RULES**

### **Breakpoint Strategy**

Use Tailwind's default 5-breakpoint system exclusively:

```css
/* ✅ CORRECT: Mobile-first approach */
.component {
  /* Base: Mobile (0-639px) */
  padding: 1rem;
  font-size: 14px;

  /* sm: Large Mobile (640px+) */
  @media (min-width: 640px) {
    padding: 1.5rem;
  }

  /* md: Tablet (768px+) */
  @media (min-width: 768px) {
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* lg: Desktop (1024px+) */
  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* xl: Large Desktop (1280px+) */
  @media (min-width: 1280px) {
    max-width: 1400px;
  }

  /* 2xl: Ultra-wide (1536px+) */
  @media (min-width: 1536px) {
    max-width: 1600px;
  }
}
```

### **Touch Target Requirements**

```typescript
// ✅ REQUIRED: Minimum 44px touch targets for mobile
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  Click me
</button>

// ✅ REQUIRED: Mobile-first CSS classes
<div className="
  /* Mobile first */
  flex flex-col gap-4 p-4

  /* Tablet enhancements */
  md:grid md:grid-cols-2 md:gap-8 md:p-8

  /* Desktop optimizations */
  lg:max-w-6xl lg:mx-auto lg:p-10
">
```

---

## **♿ ACCESSIBILITY REQUIREMENTS**

### **WCAG 2.1 AA Compliance**

All components must meet accessibility standards:

```typescript
// ✅ REQUIRED: Comprehensive ARIA support
<select
  value={selectedSource}
  onChange={handleSourceChange}
  aria-label="Select source connector"
  aria-describedby="source-help"
  id="source-selector"
  aria-required="true"
  aria-invalid={hasError}
>
  {options.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
<div id="source-help" className="sr-only">
  Choose the data source for your flow
</div>

// ✅ REQUIRED: Keyboard navigation support
<div
  onClick={() => setEditing(true)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEditing(true);
    }
  }}
  tabIndex={0}
  role="button"
  aria-label="Edit field value"
>

// ✅ REQUIRED: Screen reader live regions
<div aria-live="polite" aria-atomic="true">
  {status === 'thinking' && (
    <div>
      <Loader />
      <span className="sr-only">AI is processing your request</span>
    </div>
  )}
</div>
```

---

## **🔒 SECURITY REQUIREMENTS**

### **Input Validation & Sanitization**

```typescript
// ✅ REQUIRED: All user inputs must be validated and sanitized
import { validateFieldValue, sanitizeInput } from '../lib/security';

const handleInputChange = (value: string, fieldName: string) => {
  const sanitized = sanitizeInput(value);
  const validation = validateFieldValue(fieldName, sanitized);

  if (validation.isValid) {
    updateField(fieldName, sanitized);
  } else {
    setFieldError(fieldName, validation.error);
  }
};

// ✅ REQUIRED: JSON parsing with validation
const handleJsonInput = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    const sanitized = sanitizeFlowConfiguration(parsed);
    const validation = validateFlowConfiguration(sanitized);

    if (validation.isValid) {
      loadFlowConfiguration(sanitized);
    } else {
      setErrors(validation.errors);
    }
  } catch (error) {
    setError('Invalid JSON format');
  }
};
```

### **Credential Protection**

```typescript
// ✅ REQUIRED: Mask sensitive data in UI
import { maskCredentialValue } from '../lib/security';

const displayValue = (key: string, value: string): string => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey'];
  if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
    return maskCredentialValue(key, value);
  }
  return value;
};
```

---

## **⚡ PERFORMANCE REQUIREMENTS**

### **React Optimization Patterns**

```typescript
// ✅ REQUIRED: Memoization for expensive operations
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return <div>{/* Component JSX */}</div>;
});

// ✅ REQUIRED: Proper hook dependencies
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]); // All dependencies included

// ✅ REQUIRED: Debounced inputs for performance
const debouncedValue = useDebounce(inputValue, 300);
```

---

## **🎯 TYPESCRIPT REQUIREMENTS**

### **Strict Typing Standards**

```typescript
// ✅ REQUIRED: No 'any' types - use specific interfaces
interface FlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  title: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  position: { x: number; y: number };
  configuration: Record<string, string | number | boolean>;
}

// ✅ REQUIRED: Discriminated unions for type safety
type NodeStatus =
  | { status: 'pending'; progress?: never }
  | { status: 'partial'; progress: number }
  | { status: 'complete'; progress?: never }
  | { status: 'error'; error: string };

// ✅ REQUIRED: Generic types where appropriate
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// ✅ REQUIRED: Proper error handling with types
const handleApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
```

---

## **🗃️ STATE MANAGEMENT RULES**

### **Zustand Store Patterns**

```typescript
// ✅ REQUIRED: Zustand store structure
interface CanvasStore {
  // State
  nodes: FlowNode[];
  selectedNodeId: string | null;

  // Actions
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  selectNode: (id: string | null) => void;

  // Computed values
  selectedNode: FlowNode | null;
}

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        selectedNodeId: null,

        addNode: (node) =>
          set((state) => ({
            nodes: [...state.nodes, node],
          })),

        updateNode: (id, updates) =>
          set((state) => ({
            nodes: state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
          })),

        selectNode: (id) => set({ selectedNodeId: id }),

        get selectedNode() {
          const state = get();
          return state.nodes.find((node) => node.id === state.selectedNodeId) || null;
        },
      }),
      {
        name: 'canvas-store',
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          // Handle migration logic
          return persistedState as CanvasStore;
        },
      }
    ),
    { name: 'canvas-store' }
  )
);
```

---

## **🧪 TESTING REQUIREMENTS**

### **Component Testing Standards**

```typescript
// ✅ REQUIRED: Comprehensive component tests
describe('Button Component', () => {
  it('renders with correct variant classes', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper touch target size', () => {
    render(<Button>Touch me</Button>);
    const button = screen.getByRole('button');
    const styles = window.getComputedStyle(button);

    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
  });
});
```

---

## **📁 FILE STRUCTURE RULES**

### **Required Directory Structure**

```
src/
├── components/
│   ├── atoms/              ← Single-purpose components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   └── StatusPill/
│   ├── molecules/          ← 2-3 atom combinations
│   │   ├── FormField/
│   │   ├── MessageBubble/
│   │   └── edges/
│   │       └── StatusBezierEdge/
│   └── organisms/          ← Complex business logic components
│       ├── Canvas/
│       ├── ConnectorBox/
│       ├── FlowCanvasRF/
│       └── nodes/
│           ├── SourceNode/
│           ├── TransformNode/
│           └── DestinationNode/
├── hooks/                  ← Custom React hooks
├── lib/                    ← Utility functions
├── store/                  ← Zustand stores
├── types/                  ← TypeScript type definitions
└── routes/                 ← Page components
```

### **Component File Structure**

```typescript
// ✅ REQUIRED: Each component folder structure
ComponentName/
├── ComponentName.tsx       ← Main component
├── ComponentName.types.ts  ← TypeScript interfaces
├── ComponentName.test.tsx  ← Unit tests
├── ComponentName.stories.tsx ← Storybook stories (optional)
└── index.ts               ← Export barrel
```

---

## **🎨 STYLING RULES**

### **Tailwind CSS Guidelines**

```typescript
// ✅ REQUIRED: Mobile-first utility classes
<div className="
  /* Mobile base styles */
  flex flex-col gap-4 p-4 text-sm

  /* Small screens (640px+) */
  sm:gap-6 sm:p-6 sm:text-base

  /* Medium screens (768px+) */
  md:grid md:grid-cols-2 md:gap-8 md:p-8

  /* Large screens (1024px+) */
  lg:max-w-6xl lg:mx-auto lg:p-10

  /* Extra large screens (1280px+) */
  xl:p-12 xl:max-w-7xl

  /* 2X large screens (1536px+) */
  2xl:max-w-[1600px]
">

// ✅ REQUIRED: Consistent spacing using Tailwind scale
const spacingClasses = {
  xs: 'gap-1 p-1',      // 4px
  sm: 'gap-2 p-2',      // 8px
  md: 'gap-4 p-4',      // 16px
  lg: 'gap-6 p-6',      // 24px
  xl: 'gap-8 p-8',      // 32px
};

// ✅ REQUIRED: Color system using design tokens
const colorClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500',
  secondary: 'bg-purple-500 text-white hover:bg-purple-400',
  success: 'bg-green-500 text-white hover:bg-green-400',
  warning: 'bg-orange-500 text-white hover:bg-orange-400',
  error: 'bg-red-500 text-white hover:bg-red-400',
};
```

---

## **🔄 DATA FLOW PATTERNS**

### **Canvas Node Management**

```typescript
// ✅ REQUIRED: Node type definitions
interface FlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  title: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  position: { x: number; y: number };
  configuration: Record<string, unknown>;
}

// ✅ REQUIRED: Status color mapping
const getNodeColor = (type: FlowNode['type'], status: FlowNode['status']) => {
  const typeColors = {
    source: 'blue', // Blue for data sources
    transform: 'purple', // Purple for transformations
    destination: 'green', // Green for destinations
  };

  const statusColors = {
    pending: 'orange', // Orange for pending
    partial: 'blue', // Blue for partial
    complete: 'green', // Green for complete
    error: 'red', // Red for error
  };

  return status === 'pending' ? statusColors[status] : typeColors[type];
};
```

### **Chat Integration Patterns**

```typescript
// ✅ REQUIRED: Message handling
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// ✅ REQUIRED: Auto-scroll behavior
const useAutoScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return messagesEndRef;
};
```

---

## **🛡️ ERROR HANDLING RULES**

### **Error Boundary Implementation**

```typescript
// ✅ REQUIRED: Functional error boundary using react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div role="alert" className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
    <p className="text-red-600 mt-2">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

// Usage
<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
  <App />
</ErrorBoundary>
```

### **API Error Handling**

```typescript
// ✅ REQUIRED: Consistent error handling pattern
const useApiCall = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, error, loading, execute };
};
```

---

## **📊 QUALITY GATES**

### **Pre-Commit Requirements**

```bash
# ✅ REQUIRED: All checks must pass before commit
npm run lint          # ESLint: 0 errors, 0 warnings
npm run build         # TypeScript: 0 compilation errors
npm run test:unit     # Unit tests: All passing
npm run test:e2e      # E2E tests: Critical flows passing
npm audit             # Security: No high/critical vulnerabilities
```

### **Code Review Checklist**

- [ ] **Atomic Design**: Component in correct category (atoms/molecules/organisms)
- [ ] **Mobile-First**: Proper responsive CSS with Tailwind breakpoints
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Security**: Input validation, sanitization, credential masking
- [ ] **Performance**: Memoization, proper hook dependencies, no memory leaks
- [ ] **TypeScript**: No `any` types, proper interfaces, error handling
- [ ] **Testing**: Unit tests for new components, E2E for user flows
- [ ] **Documentation**: JSDoc comments for complex functions

---

## **🚀 DEPLOYMENT REQUIREMENTS**

### **Build Optimization**

```typescript
// ✅ REQUIRED: Lazy loading for routes
const LandingPage = lazy(() => import('./routes/LandingPage'));
const ChatPage = lazy(() => import('./routes/ChatPage'));
const CanvasTest = lazy(() => import('./routes/CanvasTest'));

// ✅ REQUIRED: Code splitting with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/canvasTest" element={<CanvasTest />} />
  </Routes>
</Suspense>
```

### **Performance Targets**

- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: > 90
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 3 seconds
- **Cumulative Layout Shift**: < 0.1

---

## **📚 DOCUMENTATION REQUIREMENTS**

### **Component Documentation**

````typescript
/**
 * Button component following atomic design principles
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @param variant - Visual style variant
 * @param size - Size of the button (affects padding and font size)
 * @param children - Button content
 * @param onClick - Click handler function
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
````

### **README Requirements**

Each major feature should include:

- **Purpose**: What the component/feature does
- **Usage**: How to use it with examples
- **Props/API**: All available options
- **Accessibility**: WCAG compliance notes
- **Testing**: How to test the component

---

## **🔧 DEVELOPMENT WORKFLOW**

### **Git Commit Standards**

```bash
# ✅ REQUIRED: Conventional commit format
feat: add drag and drop functionality to canvas nodes
fix: resolve accessibility issue with keyboard navigation
docs: update component documentation for Button
style: improve mobile responsiveness for chat interface
refactor: extract common validation logic to utility function
test: add E2E tests for flow creation workflow
```

### **Branch Naming Convention**

```bash
feature/canvas-drag-drop
fix/accessibility-keyboard-nav
docs/component-documentation
style/mobile-chat-interface
refactor/validation-utilities
test/e2e-flow-creation
```

---

## **⚠️ CRITICAL RULES - NEVER VIOLATE**

### **Absolute Requirements**

1. **NO `any` types** - Always use proper TypeScript interfaces
2. **NO accessibility violations** - All components must be WCAG 2.1 AA compliant
3. **NO unsanitized user input** - All inputs must be validated and sanitized
4. **NO hardcoded credentials** - Use environment variables and masking
5. **NO mobile-unfriendly components** - All components must work on mobile
6. **NO components without tests** - Unit tests required for all new components
7. **NO ESLint violations** - Code must pass all linting rules
8. **NO performance anti-patterns** - Proper memoization and optimization required

### **Code Quality Standards**

- **Minimum test coverage**: 80%
- **Maximum component complexity**: 15 cyclomatic complexity
- **Maximum file length**: 300 lines
- **Maximum function length**: 50 lines
- **Required documentation**: All public APIs must be documented

---

## **📖 REFERENCE DOCUMENTATION**

### **External References**

- **[React 18 Documentation](https://react.dev/)**: Official React documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: TypeScript best practices
- **[Tailwind CSS](https://tailwindcss.com/docs)**: Utility-first CSS framework
- **[WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)**: Accessibility standards
- **[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)**: Component methodology

---

## **🎯 SUCCESS CRITERIA**

### **Definition of Done**

A feature is considered complete when:

- [ ] **Functionality**: All requirements implemented and working
- [ ] **Quality**: Passes all automated quality checks
- [ ] **Accessibility**: WCAG 2.1 AA compliant
- [ ] **Performance**: Meets performance targets
- [ ] **Security**: Input validation and sanitization implemented
- [ ] **Testing**: Unit and E2E tests passing
- [ ] **Documentation**: Component and API documentation complete
- [ ] **Review**: Code review approved by team member

### **Quality Metrics**

- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 compilation errors
- **Test Coverage**: > 80%
- **Accessibility**: 100% axe-core compliance
- **Performance**: Lighthouse score > 90
- **Bundle Size**: < 500KB gzipped

---

**🎊 This document serves as the single source of truth for all development work on the Nexla Data Flow Architect project. All code must adhere to these standards to ensure consistency, quality, and maintainability.**
