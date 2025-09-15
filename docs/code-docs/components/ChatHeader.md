# ChatHeader Component

**Molecule Component** - Chat interface header with navigation and status

## Overview

The ChatHeader component provides the top navigation bar for the chat interface, including bot identification, status messaging, and navigation controls. It features a Home button for returning to the landing page and integrates with the theme system.

## Props Interface

```typescript
interface ChatHeaderProps {
  botName?: string;
  statusMessage?: string;
  className?: string;
  backgroundClassName?: string;
}
```

## Usage Examples

### Basic Usage
```tsx
import { ChatHeader } from '@/components/molecules/ChatHeader';

<ChatHeader 
  botName="NexBot"
  statusMessage="How can I help you today?"
/>
```

### Custom Styling
```tsx
<ChatHeader 
  botName="DataBot"
  statusMessage="Ready to build your data flow"
  backgroundClassName="bg-blue-600 dark:bg-slate-800"
  className="border-b-2"
/>
```

## Features

### Bot Identity
- **Avatar**: Bot icon with consistent styling
- **Name**: Configurable bot name display
- **Status**: Dynamic status message updates

### Navigation Controls
- **Home Button**: Returns to landing page with state reset
- **State Reset**: Clears all stores and localStorage
- **Theme Integration**: Consistent with app theme

### Responsive Design
- **Mobile**: Compact layout with essential elements
- **Desktop**: Full layout with all features
- **Touch Targets**: Minimum 44px for accessibility

## State Management

### Store Integration
```typescript
const handleHomeClick = () => {
  // Reset all stores
  useChatStore.getState().resetStore();
  useCanvasStore.getState().resetStore();
  useProgressStore.getState().resetStore();
  
  // Clear localStorage
  localStorage.removeItem('prefillPrompt');
  localStorage.removeItem('canvas-store');
  localStorage.removeItem('chat-store');
  localStorage.removeItem('progress-store');
  
  // Navigate home
  window.location.href = '/';
};
```

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ [Bot Icon] BotName • Status Message    [Home Button] │
└─────────────────────────────────────────────────────┘
```

### Styling
- **Background**: Blue gradient with dark mode support
- **Text**: White text with opacity variations
- **Icons**: Consistent icon sizing and spacing
- **Borders**: Subtle border for separation

## Accessibility

### WCAG Compliance
- **Screen Reader**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets 4.5:1 contrast ratio

### Interactive Elements
- **Home Button**: Clear purpose and feedback
- **Status Updates**: Live region for dynamic content
- **Navigation**: Logical tab order

## Implementation

Located at: `src/components/molecules/ChatHeader.tsx`

Uses React.forwardRef for ref forwarding and React.memo for performance optimization with comprehensive accessibility features.
