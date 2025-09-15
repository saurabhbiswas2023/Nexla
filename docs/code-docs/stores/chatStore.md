# Chat Store

**Zustand Store** - Chat state management with AI integration

## Overview

The Chat Store manages all chat-related state including messages, user input, AI interactions, and field collection workflows. It integrates with the OpenRouter service and coordinates with the Canvas store for synchronized updates.

## State Interface

```typescript
interface ChatState {
  // Core Chat State
  messages: ChatMessage[];
  input: string;
  aiThinking: boolean;
  conversationHistory: ChatMessage[];
  
  // Field Collection State
  isCollectingFields: boolean;
  collectionStep: CollectionStep | null;
  collectionData: Record<string, string>;
  
  // UI State
  highlightId: string | null;
  isProcessingLLM: boolean;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  setInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  sendWithCanvasUpdate: () => Promise<void>;
  
  // Field Collection Actions
  startFieldCollection: (nodeType: string, nodeName: string) => void;
  processCollectionInput: (field: string, value: string) => Promise<void>;
  completeFieldCollection: () => void;
  
  // Utility Actions
  resetStore: () => void;
  clearMessages: () => void;
  setHighlight: (messageId: string | null) => void;
}
```

## Usage Examples

### Basic Message Handling
```typescript
import { useChatStore } from '@/store/chat';

const { messages, input, setInput, sendMessage } = useChatStore();

// Send a message
setInput("Connect Salesforce to BigQuery");
await sendMessage();
```

### Canvas Integration
```typescript
const { sendWithCanvasUpdate } = useChatStore();

// Send message and update canvas
await sendWithCanvasUpdate();
```

### Field Collection
```typescript
const { 
  startFieldCollection, 
  processCollectionInput, 
  isCollectingFields 
} = useChatStore();

// Start collecting fields for a Salesforce source
startFieldCollection('source', 'Salesforce');

// Process field input
if (isCollectingFields) {
  await processCollectionInput('baseUrl', 'https://mycompany.salesforce.com');
}
```

## Message Management

### Message Structure
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  status: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt: number;
}
```

### Message Actions
- **Add Message**: Append new message to conversation
- **Update Status**: Change message status (sending → sent)
- **Highlight Message**: Temporarily highlight specific message
- **Clear Messages**: Reset conversation history

## AI Integration

### OpenAI Integration
```typescript
const sendMessage = async () => {
  const { input, addMessage } = get();
  
  // Add user message
  addMessage({ type: 'user', content: input, status: 'sent' });
  
  // Show AI thinking
  set({ aiThinking: true, input: '' });
  
  try {
    // Get AI response
    const response = await openAIService.sendMessage(input);
    addMessage({ type: 'ai', content: response, status: 'sent' });
  } catch (error) {
    addMessage({ 
      type: 'ai', 
      content: 'Sorry, I encountered an error.', 
      status: 'error' 
    });
  } finally {
    set({ aiThinking: false });
  }
};
```

### Context Management
- Maintains conversation history
- Provides context for AI responses
- Manages conversation flow
- Handles interruptions and errors

## Field Collection Workflow

### Collection State Machine
```typescript
type CollectionState = 'idle' | 'collecting' | 'validating' | 'complete';

interface CollectionStep {
  stepType: 'node-name' | 'node-fields';
  nodeType: 'source' | 'transform' | 'destination';
  question: string;
  currentStepIndex: number;
  totalSteps: number;
}
```

### Collection Process
1. **Initiate**: Start field collection for specific node type
2. **Question**: Generate contextual questions for required fields
3. **Input**: Process user responses and validate
4. **Progress**: Track completion and move to next field
5. **Complete**: Finish collection and update canvas

## Canvas Synchronization

### Bidirectional Updates
- **Chat → Canvas**: Messages trigger canvas updates
- **Canvas → Chat**: Node changes generate chat responses
- **Field Collection**: Updates both chat and canvas state
- **Status Sync**: Node status reflects in chat messages

### Integration Points
```typescript
const sendWithCanvasUpdate = async () => {
  await sendMessage();
  
  // Update canvas based on conversation
  const canvasStore = useCanvasStore.getState();
  await canvasStore.updateFromConversation(get().messages);
};
```

## Persistence

### Local Storage
- Conversation history persisted
- Field collection state saved
- User preferences maintained
- Recovery on page reload

### State Hydration
```typescript
const persistConfig = {
  name: 'chat-store',
  partialize: (state) => ({
    messages: state.messages,
    conversationHistory: state.conversationHistory,
    collectionData: state.collectionData
  })
};
```

## Performance Optimization

### Memoization
- Message rendering optimization
- Input debouncing
- AI response caching
- State selector optimization

### Memory Management
- Message history limits
- Conversation pruning
- Cache cleanup
- Memory leak prevention

## Error Handling

### Error Types
- **Network Errors**: API communication failures
- **Validation Errors**: Invalid field inputs
- **AI Errors**: LLM processing failures
- **State Errors**: Store synchronization issues

### Recovery Strategies
- Automatic retry mechanisms
- Graceful error messages
- State recovery procedures
- User notification system

## Implementation

Located at: `src/store/chat.ts`

Uses Zustand with persistence, devtools integration, and comprehensive error handling for reliable chat state management.
