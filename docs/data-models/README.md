# 📊 **DATA MODELS & TYPES**

## **🏗️ Core Application Types**

### **Chat System**
```typescript
// Chat message structure
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
}

// Chat state management
export interface ChatState {
  messages: ChatMessage[];
  input: string;
  conversationHistory: string[];
  aiThinking: boolean;
  highlightId: string | null;
}
```

### **Canvas & Flow System**
```typescript
// Flow node configuration
export interface FlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  title: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  position: { x: number; y: number };
  configuration: Record<string, string | number | boolean>;
}

// Canvas state management
export interface CanvasState {
  selectedSource: string;
  selectedDestination: string;
  selectedTransform: string;
  nodeValues: NodeValues;
  flowConfiguration: FlowConfiguration;
}
```

### **Connector System**
```typescript
// Connector credentials specification
export type ConnectorCredentials = {
  mandatory: string[];
  optional?: string[];
};

// Connector specification
export type ConnectorSpec = {
  name: string;
  category: string;
  roles: { source: boolean; destination: boolean };
  credentials: ConnectorCredentials;
};

// Connector instance with values
export type ConnectorInstance = {
  role: 'source' | 'destination';
  spec: ConnectorSpec;
  values?: Record<string, string>;
};
```

## **🔄 State Management**

### **Zustand Stores**
- **`useChatStore`**: Chat messages, AI responses, field collection
- **`useCanvasStore`**: Flow configuration, node values, canvas state
- **`useFlowStore`**: Flow templates and configurations

### **Persistence**
- **LocalStorage**: Canvas state, chat history
- **Session**: Temporary UI state, form inputs
- **Migration**: Automatic state migration for version updates

## **🔒 Security & Validation**

### **Input Validation**
```typescript
// Field validation patterns
const validateFieldValue = (key: string, value: string) => {
  if (key.includes('email')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (key.includes('url')) return /^https?:\/\/.+/.test(value);
  return value.trim().length > 0;
};

// Input sanitization
const sanitizeInput = (input: string) => 
  input.replace(/[<>]/g, '').replace(/javascript:/gi, '').trim();
```

### **Credential Masking**
```typescript
// Sensitive data protection
const maskCredentialValue = (key: string, value: string) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key'];
  return sensitiveKeys.some(k => key.toLowerCase().includes(k)) 
    ? '***'.repeat(Math.min(value.length, 8)) 
    : value;
};
```

## **📱 UI Component Props**

### **Atomic Design Types**
```typescript
// Button atom props
interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'chevron-up' | 'message-circle' | 'none';
  position?: 'static' | 'fixed-bottom-right';
  visible?: boolean;
}

// Form field molecule props
interface FormFieldProps {
  label: string;
  input: InputProps;
  error?: string;
  helpText?: string;
}
```

## **🎯 Key Principles**

1. **Type Safety**: No 'any' types, strict TypeScript
2. **Immutability**: State updates through Zustand actions
3. **Validation**: All user inputs validated and sanitized
4. **Security**: Sensitive data masked and protected
5. **Performance**: Memoized selectors and computed values

---

**📝 Note**: All types are defined in `src/types/` and imported throughout the application for consistency.
