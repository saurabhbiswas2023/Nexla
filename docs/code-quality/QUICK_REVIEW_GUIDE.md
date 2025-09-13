# ⚡ **QUICK CODE REVIEW GUIDE**

_Essential checks for every code review_

**💡 Tip**: These rules are configured in `.cursor/rules.md` for automated Cursor IDE integration.

## **🚀 BEFORE YOU SUBMIT**

### **Run These Commands:**

```bash
npm run lint          # Must pass (0 errors)
npm run build         # Must pass (0 errors)
npm run test:unit     # Should pass
npm run lint:fix      # Auto-fix formatting
```

---

## **🔍 5-MINUTE REVIEW CHECKLIST**

### **✅ CRITICAL CHECKS (Must Pass)**

- [ ] **ESLint**: Zero errors and warnings
- [ ] **TypeScript**: No compilation errors
- [ ] **Security**: Input validation present
- [ ] **Accessibility**: ARIA labels on interactive elements
- [ ] **Mobile**: Touch targets 44px minimum

### **⚠️ IMPORTANT CHECKS**

- [ ] **Atomic Design**: Component in correct folder (atoms/molecules/organisms)
- [ ] **Mobile-First**: CSS classes start with base, then `sm:`, `md:`, `lg:`
- [ ] **Performance**: `useMemo`/`useCallback` for expensive operations
- [ ] **Testing**: Unit tests for new components

---

## **🎯 QUICK PATTERNS**

### **✅ GOOD PATTERNS**

```typescript
// Mobile-First CSS
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// Proper ARIA
<button aria-label="Close dialog" onClick={onClose}>×</button>

// Input Validation
const sanitized = sanitizeInput(userInput);
if (validateInput(sanitized)) { /* use it */ }

// Memoization
const expensiveValue = useMemo(() => calculate(data), [data]);
```

### **❌ BAD PATTERNS**

```typescript
// Desktop-First CSS
<div className="grid grid-cols-3 md:grid-cols-1">

// No ARIA
<button onClick={onClose}>×</button>

// No Validation
onSubmit(userInput); // Direct use - unsafe!

// Missing Memoization
const expensiveValue = calculate(data); // Recalculated every render
```

---

## **📱 MOBILE-FIRST QUICK CHECK**

- Base styles = Mobile (320px+)
- `sm:` = Mobile Large (640px+)
- `md:` = Tablet (768px+)
- `lg:` = Desktop (1024px+)
- Touch targets: `min-h-[44px] min-w-[44px]`

---

## **♿ ACCESSIBILITY QUICK CHECK**

- Interactive elements: `aria-label` or proper `<label>`
- Form fields: `aria-describedby` for help text
- Errors: `aria-invalid` and `role="alert"`
- Keyboard: `onKeyDown` for Enter/Space
- Screen readers: `aria-live` for dynamic content

---

## **🔒 SECURITY QUICK CHECK**

- User input: Always validate and sanitize
- JSON parsing: Wrap in try/catch with validation
- Credentials: Mask in UI, no hardcoding
- XSS prevention: No `dangerouslySetInnerHTML` without sanitization

---

## **⚡ PERFORMANCE QUICK CHECK**

- Expensive calculations: `useMemo`
- Event handlers: `useCallback`
- Frequently re-rendering components: `React.memo`
- Array operations in render: Move to `useMemo`

---

## **🏗️ ATOMIC DESIGN QUICK CHECK**

- **Atoms**: `Button`, `Input`, `Label` (simple, no business logic)
- **Molecules**: `FormField`, `NodeHeader` (2-3 atoms combined)
- **Organisms**: `Canvas`, `FlowCanvasRF` (complex, business logic)

---

## **🎯 QUALITY SCORE**

- **10/10**: All checks pass ⭐⭐⭐⭐⭐
- **8-9/10**: Minor issues ⭐⭐⭐⭐⚪
- **6-7/10**: Needs work ⭐⭐⭐⚪⚪
- **<6/10**: Major changes needed ⭐⭐⚪⚪⚪

**Minimum to merge: 7/10**
**Target quality: 9/10**

---

## **🚨 INSTANT REJECT CONDITIONS**

- ESLint errors
- TypeScript compilation errors
- Missing input validation on user inputs
- No ARIA labels on interactive elements
- Desktop-first CSS patterns
- Hardcoded credentials

---

## **💡 QUICK FIXES**

### **ESLint Errors:**

```bash
npm run lint:fix  # Auto-fix most issues
```

### **Missing ARIA:**

```typescript
// Add to all interactive elements
aria-label="Descriptive action"
```

### **Desktop-First CSS:**

```typescript
// Change from:
className = 'grid-cols-3 md:grid-cols-1';
// To:
className = 'grid-cols-1 md:grid-cols-3';
```

### **Missing Validation:**

```typescript
// Add before using user input:
const sanitized = sanitizeInput(userInput);
if (validateInput(sanitized)) {
  // Safe to use
}
```

---

**Remember: Quality first, speed second! 🎯**
