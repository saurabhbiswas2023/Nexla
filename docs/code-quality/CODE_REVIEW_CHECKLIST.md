# 📋 **CODE REVIEW CHECKLIST**

_Based on CODE_QUALITY_REVIEW.md Analysis_

## **🎯 HOW TO USE THIS CHECKLIST**

This checklist is derived from our comprehensive code quality review and should be used by developers and reviewers to ensure consistent code quality across the entire codebase.

**Note**: These rules are also configured in `.cursor/rules.md` for automated Cursor IDE integration.

### **For Developers (Before Creating PR):**

1. Run through the **Self-Review Checklist**
2. Execute all **Automated Checks**
3. Verify **Quality Gates** are met

### **For Reviewers (During Code Review):**

1. Use **Code Review Checklist** for manual review
2. Verify **Automated Checks** have passed
3. Ensure **Quality Standards** are maintained

---

## **🤖 AUTOMATED CHECKS (Run Before Review)**

### **Required Commands:**

```bash
# 1. ESLint Analysis (MUST PASS)
npm run lint

# 2. TypeScript Check (MUST PASS)
npm run build

# 3. Unit Tests (MUST PASS)
npm run test:unit

# 4. E2E Tests (SHOULD PASS)
npm run test:e2e

# 5. Security Audit (SHOULD PASS)
npm audit --audit-level moderate

# 6. Code Formatting (AUTO-FIX)
npm run lint:fix
```

### **Quality Gates:**

- ✅ **ESLint**: 0 errors, 0 warnings
- ✅ **TypeScript**: 0 compilation errors
- ✅ **Tests**: All tests passing
- ✅ **Build**: Successful production build

---

## **🔍 MANUAL CODE REVIEW CHECKLIST**

### **🏗️ 1. ATOMIC DESIGN PRINCIPLES**

#### **Component Classification:**

- [ ] **Atoms** are simple, single-purpose components (Button, Input, Label)
- [ ] **Molecules** combine 2-3 atoms with single functionality (FormField, NodeHeader)
- [ ] **Organisms** are complex, business-logic containers (Canvas, FlowCanvasRF)
- [ ] **Components are in correct directories** (`atoms/`, `molecules/`, `organisms/`)

#### **Component Structure:**

```typescript
// ✅ CHECK: Proper atomic component structure
// atoms/Button.tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Props interface defined** with proper TypeScript types
- [ ] **Default values** provided for optional props
- [ ] **Proper prop spreading** for HTML attributes
- [ ] **No business logic** in atoms
- [ ] **Reusable across contexts**

---

### **📱 2. MOBILE-FIRST RESPONSIVE DESIGN**

#### **CSS Classes Review:**

```typescript
// ✅ GOOD: Mobile-first approach
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// ❌ BAD: Desktop-first approach
<div className="grid grid-cols-3 md:grid-cols-1">
```

- [ ] **All CSS uses mobile-first approach** (base styles for mobile, then `sm:`, `md:`, `lg:`)
- [ ] **Touch targets minimum 44px** (`min-h-[44px]`, `min-w-[44px]`)
- [ ] **Proper spacing** between interactive elements
- [ ] **Responsive breakpoints** used consistently
- [ ] **No horizontal scrolling** on mobile devices

#### **Responsive Patterns:**

- [ ] **Grid layouts** adapt properly across breakpoints
- [ ] **Typography scales** appropriately for mobile
- [ ] **Images and media** are responsive
- [ ] **Navigation patterns** work on touch devices

---

### **♿ 3. ACCESSIBILITY (WCAG 2.1 AA)**

#### **ARIA Attributes:**

```typescript
// ✅ CHECK: Comprehensive ARIA support
<select
  value={selectedSource}
  onChange={handleSourceChange}
  aria-label="Select source connector"           // ✅ Required
  aria-describedby="source-help"                // ✅ Help text
  id="source-selector"                          // ✅ Unique ID
  aria-required="true"                          // ✅ If required
  aria-invalid={hasError}                       // ✅ Validation state
>
```

- [ ] **All interactive elements** have `aria-label` or proper labeling
- [ ] **Form fields** have `aria-describedby` for help text
- [ ] **Error states** use `aria-invalid` and `role="alert"`
- [ ] **Dynamic content** uses `aria-live` regions
- [ ] **Complex widgets** have proper `role` attributes

#### **Keyboard Navigation:**

```typescript
// ✅ CHECK: Full keyboard support
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
```

- [ ] **All interactive elements** support keyboard activation
- [ ] **Tab order** is logical and intuitive
- [ ] **Focus indicators** are visible and clear
- [ ] **Keyboard shortcuts** documented and accessible
- [ ] **Focus management** for modals and dynamic content

#### **Screen Reader Support:**

- [ ] **Live regions** for status updates (`aria-live="polite"`)
- [ ] **Screen reader only text** using `sr-only` class
- [ ] **Meaningful link text** (no "click here")
- [ ] **Form validation** announced to screen readers
- [ ] **Loading states** communicated to assistive technology

---

### **🔒 4. SECURITY & VULNERABILITY PREVENTION**

#### **Input Validation:**

```typescript
// ✅ CHECK: Proper input validation
const validateInput = (key: string, value: string): ValidationResult => {
  // Sanitize first
  const sanitized = sanitizeInput(value);

  // Type-specific validation
  if (key.includes('email')) {
    return validateEmail(sanitized);
  }
  if (key.includes('url')) {
    return validateUrl(sanitized);
  }

  return { isValid: true, sanitized };
};

const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};
```

- [ ] **All user inputs** are validated before processing
- [ ] **Input sanitization** prevents XSS attacks
- [ ] **Type-specific validation** (email, URL, etc.)
- [ ] **Error handling** for invalid inputs
- [ ] **No direct DOM manipulation** with user input

#### **JSON and Data Handling:**

```typescript
// ✅ CHECK: Safe JSON parsing
try {
  const parsed = JSON.parse(userInput);
  const validation = validateFlowConfiguration(parsed);

  if (validation.isValid) {
    loadFlowConfiguration(validation.sanitized);
  } else {
    setErrors(validation.errors);
  }
} catch (error) {
  setError('Invalid JSON format');
}
```

- [ ] **JSON parsing** includes validation and error handling
- [ ] **Schema validation** for complex data structures
- [ ] **No eval()** or similar unsafe functions
- [ ] **API responses** are validated before use

#### **Credential Protection:**

```typescript
// ✅ CHECK: Credential masking
const maskSensitiveValue = (key: string, value: string): string => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key'];
  if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
    return '***'.repeat(Math.min(value.length, 8));
  }
  return value;
};
```

- [ ] **Sensitive data** is masked in UI display
- [ ] **No hardcoded credentials** in source code
- [ ] **Environment variables** used for secrets
- [ ] **Logging** doesn't expose sensitive information

---

### **📏 5. CODE QUALITY & TYPESCRIPT**

#### **ESLint Compliance:**

- [ ] **Zero ESLint errors** and warnings
- [ ] **No unused variables** or imports
- [ ] **Consistent code formatting**
- [ ] **Proper naming conventions**

#### **TypeScript Best Practices:**

```typescript
// ✅ CHECK: Proper TypeScript usage
interface ComponentProps {
  title: string;
  optional?: boolean;
  onAction: (id: string) => void;
}

// ❌ AVOID: any types
const data: any = getData(); // Should be properly typed

// ✅ PREFER: Specific types
interface UserData {
  id: string;
  name: string;
  email: string;
}
const data: UserData = getData();
```

- [ ] **No `any` types** unless absolutely necessary
- [ ] **Proper interfaces** defined for all props and data
- [ ] **Generic types** used appropriately
- [ ] **Type guards** for runtime type checking
- [ ] **Strict TypeScript** configuration followed

#### **React Hooks:**

```typescript
// ✅ CHECK: Proper hook usage
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]); // Correct dependencies

const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick]
); // Correct dependencies

useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]); // All dependencies included
```

- [ ] **Hook dependencies** are correct and complete
- [ ] **useCallback** for event handlers passed to children
- [ ] **useMemo** for expensive calculations
- [ ] **useEffect** cleanup functions where needed

---

### **⚡ 6. PERFORMANCE OPTIMIZATION**

#### **Memoization:**

```typescript
// ✅ CHECK: Proper memoization
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return <div>{/* Component JSX */}</div>;
});
```

- [ ] **React.memo** used for components that re-render frequently
- [ ] **useMemo** for expensive calculations
- [ ] **useCallback** for event handlers
- [ ] **No object/array creation** in render without memoization

#### **Bundle Optimization:**

- [ ] **Lazy loading** for routes and large components
- [ ] **Code splitting** implemented where appropriate
- [ ] **Tree shaking** not blocked by imports
- [ ] **Image optimization** (WebP, proper sizing)

---

### **🧪 7. TESTING COVERAGE**

#### **Unit Tests:**

```typescript
// ✅ CHECK: Comprehensive testing
describe('Button Component', () => {
  it('renders with correct variant', () => {
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
});
```

- [ ] **Unit tests** for all new components
- [ ] **Accessibility tests** using axe-core
- [ ] **User interaction tests** (click, keyboard, etc.)
- [ ] **Error state testing**
- [ ] **Edge case coverage**

#### **Integration Tests:**

- [ ] **User flow testing** for critical paths
- [ ] **API integration** testing
- [ ] **State management** testing
- [ ] **Cross-component** interaction testing

---

## **🎯 QUALITY GATES**

### **🔥 CRITICAL (Must Pass - Block PR):**

- [ ] **ESLint**: 0 errors, 0 warnings
- [ ] **TypeScript**: 0 compilation errors
- [ ] **Build**: Successful production build
- [ ] **Security**: No XSS vulnerabilities, input validation present
- [ ] **Accessibility**: Basic ARIA labels, keyboard navigation

### **⚠️ HIGH PRIORITY (Request Changes):**

- [ ] **Atomic Design**: Components in correct categories
- [ ] **Mobile-First**: Proper responsive CSS, 44px touch targets
- [ ] **Performance**: Memoization for expensive operations
- [ ] **Testing**: Unit tests for new components

### **📈 MEDIUM PRIORITY (Suggest Improvements):**

- [ ] **Documentation**: Component props documented
- [ ] **Error Handling**: Proper error boundaries
- [ ] **Code Organization**: Logical file structure
- [ ] **Consistency**: Follows established patterns

---

## **📊 REVIEW SCORING**

### **Calculate Quality Score:**

```
Critical Issues: -2 points each
High Priority: -1 point each
Medium Priority: -0.5 points each

Base Score: 10 points
Final Score = Base Score - Total Deductions

Minimum Passing Score: 7/10
Target Score: 9/10
```

### **Quality Levels:**

- **9-10**: Exceptional Quality ⭐⭐⭐⭐⭐
- **8-8.9**: High Quality ⭐⭐⭐⭐⚪
- **7-7.9**: Good Quality ⭐⭐⭐⚪⚪
- **6-6.9**: Needs Improvement ⭐⭐⚪⚪⚪
- **<6**: Requires Major Changes ⭐⚪⚪⚪⚪

---

## **🚀 REVIEW PROCESS**

### **1. Pre-Review (Developer):**

1. Run all automated checks
2. Complete self-review checklist
3. Ensure quality gates are met
4. Document any exceptions or trade-offs

### **2. Code Review (Reviewer):**

1. Verify automated checks passed
2. Manual review using this checklist
3. Test critical user flows
4. Provide constructive feedback

### **3. Post-Review (Both):**

1. Address all feedback
2. Re-run automated checks
3. Verify fixes don't introduce new issues
4. Final approval and merge

---

## **💡 TIPS FOR EFFECTIVE REVIEWS**

### **For Reviewers:**

- **Be constructive**: Explain why changes are needed
- **Provide examples**: Show correct implementation
- **Prioritize issues**: Focus on critical and high-priority items first
- **Consider context**: Understand the business requirements

### **For Developers:**

- **Self-review first**: Catch obvious issues before PR
- **Write descriptive PRs**: Explain what and why
- **Test thoroughly**: Don't rely only on automated tests
- **Be responsive**: Address feedback promptly

---

**Remember: Code review is about maintaining quality, sharing knowledge, and continuous improvement. Every review makes our codebase better! 🎯**
