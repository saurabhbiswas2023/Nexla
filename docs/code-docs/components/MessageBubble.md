# MessageBubble Component

**Molecule Component** - Chat message display with user/AI styling

## Overview

The MessageBubble component renders individual chat messages with distinct styling for user and AI messages. It includes status indicators, timestamps, and thinking animations for AI responses.

## Props Interface

```typescript
interface MessageBubbleProps {
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
  highlight?: boolean;
}
```

## Usage Examples

### User Message
```tsx
import { MessageBubble } from '@/components/molecules/MessageBubble';

<MessageBubble 
  type="user"
  content="Connect Salesforce to BigQuery"
  status="sent"
  createdAt={Date.now()}
/>
```

### AI Message
```tsx
<MessageBubble 
  type="ai"
  content="I'll help you set up that connection. What's your Salesforce instance URL?"
  status="sent"
  createdAt={Date.now()}
/>
```

### Thinking State
```tsx
<MessageBubble 
  type="ai"
  content=""
  status="thinking"
/>
```

### Highlighted Message
```tsx
<MessageBubble 
  type="user"
  content="Important message"
  highlight={true}
/>
```

## Visual Design

### User Messages
- Purple gradient background
- White text
- Right-aligned
- Rounded corners with tail on right

### AI Messages  
- White background with border
- Dark text
- Left-aligned
- Rounded corners with tail on left

## Status Indicators

- `sending`: Loading indicator
- `sent`: Check mark icon
- `error`: Error icon with red styling
- `thinking`: Animated dots for AI processing

## Accessibility

- **Screen Reader**: Proper message identification
- **Timestamps**: Formatted for accessibility
- **Status**: Clear status communication
- **Focus Management**: Keyboard navigation support

## Implementation

Located at: `src/components/molecules/MessageBubble.tsx`

Uses React.memo for performance and includes comprehensive styling for different message types and states.
