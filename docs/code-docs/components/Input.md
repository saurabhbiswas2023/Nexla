# Input Component

**Atom Component** - Form input with validation and accessibility support

## Overview

The Input component provides a consistent form input experience with built-in validation, error handling, and accessibility features. It supports multiple variants and includes helper text and error messaging.

## Props Interface

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'search' | 'chat';
  icon?: React.ReactNode;
}
```

## Usage Examples

### Basic Usage
```tsx
import { Input } from '@/components/atoms/Input';

<Input 
  label="Email Address"
  placeholder="Enter your email"
  type="email"
/>
```

### With Validation
```tsx
<Input 
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### With Helper Text
```tsx
<Input 
  label="Username"
  helperText="Must be unique and 3-20 characters"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

### With Icon
```tsx
<Input 
  label="Search"
  icon={<SearchIcon />}
  placeholder="Search flows..."
/>
```

## Variants

- `default`: Standard form input styling
- `search`: Larger text and search-specific styling
- `chat`: Optimized for chat input with resize capabilities

## Accessibility

- **Labels**: Proper label association with htmlFor
- **Error Handling**: ARIA error descriptions
- **Validation**: Real-time validation feedback
- **Screen Reader**: Comprehensive ARIA support

## Implementation

Located at: `src/components/atoms/Input.tsx`

Features automatic ID generation, error state management, and responsive design patterns.
