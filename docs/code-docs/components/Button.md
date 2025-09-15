# Button Component

**Atom Component** - Basic UI button with variants and accessibility support

## Overview

The Button component is a foundational atom that provides consistent styling, interaction patterns, and accessibility features across the application. It supports multiple variants, sizes, and states while maintaining WCAG 2.1 AA compliance.

## Props Interface

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  'aria-label'?: string;
}
```

## Usage Examples

### Basic Usage
```tsx
import { Button } from '@/components/atoms/Button';

<Button onClick={handleClick}>
  Click Me
</Button>
```

### Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Success Action</Button>
<Button variant="error">Danger Action</Button>
<Button variant="floating">Floating Action</Button>
```

### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### States
```tsx
<Button disabled>Disabled Button</Button>
<Button loading>Loading Button</Button>
```

## Styling

### Variant Classes
- `primary`: Violet background with white text
- `secondary`: Gray background with white text  
- `success`: Green background with white text
- `error`: Red background with white text
- `floating`: Elevated button with shadow

### Size Classes
- `sm`: Small padding and text
- `md`: Medium padding and text (default)
- `lg`: Large padding and text

## Accessibility

- **Keyboard Navigation**: Full keyboard support with Enter and Space
- **Focus Management**: Visible focus indicators
- **Screen Reader**: Proper ARIA labels and roles
- **Touch Targets**: Minimum 44px clickable area

## Implementation

Located at: `src/components/atoms/Button.tsx`

The component uses React.memo for performance optimization and includes comprehensive prop validation and accessibility features.
