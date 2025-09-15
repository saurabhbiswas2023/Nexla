# 🔧 **LOW-LEVEL DESIGN DOCUMENTATION**

**Detailed Component and System Design Specifications**  
**Version 1.0.0** | **Enterprise-Grade Architecture**

---

## **📋 OVERVIEW**

This document provides comprehensive low-level design specifications for the Nexla Data Flow Architect application, detailing component interfaces, data structures, algorithms, and implementation patterns.

---

## **🏗️ COMPONENT ARCHITECTURE**

### **Atomic Design Implementation**

#### **Design Principles**
- **Single Responsibility**: Each component has one clear purpose
- **Composability**: Components can be combined to create complex interfaces
- **Reusability**: Components work across different contexts
- **Accessibility**: WCAG 2.1 AA compliance built-in
- **Performance**: Optimized rendering with React.memo and hooks

```
Component Hierarchy:
├── Atoms (Basic UI Elements)
│   ├── Button, Input, Label
│   └── StatusPill, ThemeToggle
├── Molecules (Composed Components)
│   ├── MessageBubble, ChatHeader
│   └── SearchCard, FormField
└── Organisms (Complex Components)
    ├── Canvas, MessageArea
    └── HeroSection, ConnectorBox
```

---

## **⚛️ ATOMS SPECIFICATION**

### **Button Component**
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

// Implementation Details
const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  ...props
}) => {
  // Variant styles mapping
  const variantClasses = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-500',
    error: 'bg-red-600 text-white hover:bg-red-500',
    floating: 'bg-violet-600 text-white shadow-lg hover:shadow-xl'
  };

  // Size classes mapping
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-md font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-300
        disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[44px] min-w-[44px] flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
});
```

### **Input Component**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'search' | 'chat';
  icon?: React.ReactNode;
}

const Input = React.memo<InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  icon,
  className = '',
  ...props
}) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();

  const variantClasses = {
    default: 'border-gray-300 focus:border-violet-500 focus:ring-violet-500',
    search: 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-lg',
    chat: 'border-gray-300 focus:border-violet-500 focus:ring-violet-500 resize-none'
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            block w-full rounded-md shadow-sm
            ${variantClasses[variant]}
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
```

---

## **🧬 MOLECULES SPECIFICATION**

### **MessageBubble Component**
```typescript
interface MessageBubbleProps {
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
  highlight?: boolean;
}

const MessageBubble = React.memo<MessageBubbleProps>(({
  type,
  content,
  status = 'sent',
  createdAt,
  highlight = false
}) => {
  const isUser = type === 'user';
  const Avatar = isUser ? UserIcon : Bot;
  
  // Format timestamp
  const timestamp = createdAt 
    ? new Date(createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '';

  // Animation classes for thinking state
  const thinkingAnimation = status === 'thinking' ? 'thinking-bounce' : '';

  return (
    <div
      className={`
        ${isUser ? 'ml-auto max-w-[90%]' : 'max-w-[80%]'} w-full
        ${highlight ? 'ring-2 ring-violet-300 rounded-2xl transition-[box-shadow] duration-700' : ''}
      `}
      data-testid={`message-${type}`}
    >
      <div
        className={`
          rounded-2xl px-4 py-2 shadow-sm border
          ${isUser 
            ? 'bg-violet-600 text-white border-violet-600' 
            : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
          }
        `}
      >
        {/* Message Header */}
        <div className="flex items-center gap-2 text-sm">
          <Avatar 
            size={16} 
            className={isUser ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'} 
          />
          <div className={isUser ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}>
            {isUser ? 'You' : 'NexBot'}
          </div>
          
          {/* Thinking Animation */}
          {!isUser && status === 'thinking' && (
            <div className="inline-flex items-center gap-1 ml-2">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full bg-violet-400 ${thinkingAnimation}`}
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: '0 0 4px rgba(139,92,246,0.4)'
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Timestamp and Status */}
          {timestamp && (
            <div className={isUser ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}>
              · {timestamp}
            </div>
          )}
          
          {/* Status Icons */}
          <div className="ml-auto inline-flex items-center gap-1">
            {status === 'sent' && (
              <CheckCheck 
                size={14} 
                className={isUser ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'} 
              />
            )}
            {status === 'error' && (
              <AlertCircle size={14} className="text-red-500" />
            )}
          </div>
        </div>
        
        {/* Message Content */}
        {status !== 'thinking' && (
          <div className={`
            mt-0.5 whitespace-pre-wrap
            ${isUser ? '' : 'text-slate-900 dark:text-slate-100'}
          `}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
});
```

### **ChatInput Component**
```typescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

interface ChatInputRef {
  focus: () => void;
  blur: () => void;
}

const ChatInput = React.forwardRef<ChatInputRef, ChatInputProps>(({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe your data flow…",
  disabled = false,
  maxLength = 1000
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24; // 1.5rem
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), 4);
      setRows(newRows);
    }
  }, [value]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur()
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            className={`
              w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600
              px-4 py-3 text-base leading-6
              focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
              dark:bg-slate-800 dark:text-white
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            data-testid="chat-input"
            aria-label="Message input"
          />
          
          {/* Character count */}
          {maxLength && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {value.length}/{maxLength}
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!value.trim() || disabled}
          className="shrink-0"
          aria-label="Send message"
          data-testid="send-button"
        >
          <Send size={16} />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
});
```

---

## **🧠 ORGANISMS SPECIFICATION**

### **Canvas Component**
```typescript
interface CanvasProps {
  showControls?: boolean;
  showJsonPanel?: boolean;
  onNodeValuesChange?: (nodeId: string, field: string, value: string) => void;
  className?: string;
}

const Canvas = React.memo<CanvasProps>(({
  showControls = true,
  showJsonPanel = false,
  onNodeValuesChange,
  className = ''
}) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    deleteNode
  } = useCanvasStore();

  // React Flow configuration
  const nodeTypes = useMemo(() => ({
    source: SourceNode,
    transform: TransformNode,
    destination: DestinationNode
  }), []);

  const edgeTypes = useMemo(() => ({
    default: StatusBezierEdge
  }), []);

  // Handle node value changes
  const handleNodeChange = useCallback((nodeId: string, field: string, value: string) => {
    updateNode(nodeId, { 
      data: { 
        ...nodes.find(n => n.id === nodeId)?.data,
        [field]: value 
      }
    });
    onNodeValuesChange?.(nodeId, field, value);
  }, [nodes, updateNode, onNodeValuesChange]);

  // Auto-layout algorithm
  const applyAutoLayout = useCallback(() => {
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: index * 300,
        y: 100
      }
    }));
    
    // Update all nodes with new positions
    layoutedNodes.forEach(node => {
      updateNode(node.id, { position: node.position });
    });
  }, [nodes, updateNode]);

  return (
    <div className={`h-full w-full ${className}`} data-testid="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50 dark:bg-slate-900"
      >
        {showControls && (
          <Controls 
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
          />
        )}
        
        <MiniMap 
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
          nodeColor={(node) => {
            switch (node.type) {
              case 'source': return '#3b82f6';
              case 'transform': return '#8b5cf6';
              case 'destination': return '#10b981';
              default: return '#6b7280';
            }
          }}
        />
        
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          className="opacity-30"
        />
      </ReactFlow>
      
      {/* Canvas Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={applyAutoLayout}
            aria-label="Auto-layout nodes"
          >
            <Layout size={16} />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addNode('source')}
            aria-label="Add source node"
          >
            <Plus size={16} />
          </Button>
        </div>
      )}
      
      {/* JSON Panel */}
      {showJsonPanel && (
        <div className="absolute bottom-4 left-4 w-80 max-h-60 overflow-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Flow Configuration</h3>
          <pre className="text-xs text-gray-600 dark:text-gray-300">
            {JSON.stringify({ nodes, edges }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
});
```

---

## **📊 STATE MANAGEMENT DESIGN**

### **Zustand Store Architecture**
```typescript
// Chat Store Design
interface ChatState {
  // Core State
  messages: ChatMessage[];
  input: string;
  aiThinking: boolean;
  
  // Field Collection State
  isCollectingFields: boolean;
  collectionStep: CollectionStep | null;
  collectionData: Record<string, string>;
  
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
}

// Implementation with persistence
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        input: '',
        aiThinking: false,
        isCollectingFields: false,
        collectionStep: null,
        collectionData: {},
        
        // Actions implementation
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, {
            ...message,
            id: generateId(),
            createdAt: Date.now()
          }]
        })),
        
        setInput: (input) => set({ input }),
        
        sendMessage: async () => {
          const { input, addMessage } = get();
          if (!input.trim()) return;
          
          // Add user message
          addMessage({ type: 'user', content: input, status: 'sent' });
          
          // Clear input and show thinking
          set({ input: '', aiThinking: true });
          
          try {
            // Send to AI service
            const response = await openRouterService.sendMessage(input);
            addMessage({ type: 'ai', content: response, status: 'sent' });
          } catch (error) {
            addMessage({ 
              type: 'ai', 
              content: 'Sorry, I encountered an error. Please try again.', 
              status: 'error' 
            });
          } finally {
            set({ aiThinking: false });
          }
        },
        
        // Canvas integration
        sendWithCanvasUpdate: async () => {
          await get().sendMessage();
          
          // Update canvas based on conversation
          const canvasStore = useCanvasStore.getState();
          canvasStore.updateFromConversation(get().messages);
        },
        
        resetStore: () => set({
          messages: [],
          input: '',
          aiThinking: false,
          isCollectingFields: false,
          collectionStep: null,
          collectionData: {}
        })
      }),
      { name: 'chat-store' }
    )
  )
);
```

### **Canvas Store Design**
```typescript
interface CanvasState {
  // Core State
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  
  // Layout State
  viewport: { x: number; y: number; zoom: number };
  
  // Actions
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  
  // Edge Actions
  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;
  
  // Layout Actions
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  autoLayout: () => void;
  
  // Integration Actions
  updateFromConversation: (messages: ChatMessage[]) => void;
  
  // Computed Properties
  selectedNode: FlowNode | null;
  completionPercentage: number;
}

// Node status computation algorithm
const computeNodeStatus = (node: FlowNode): NodeStatus => {
  const { type, data } = node;
  
  // Required fields by node type
  const requiredFields = {
    source: ['baseUrl', 'credentials'],
    transform: ['transformType', 'configuration'],
    destination: ['endpoint', 'credentials']
  };
  
  const required = requiredFields[type] || [];
  const provided = Object.keys(data).filter(key => data[key]);
  
  if (provided.length === 0) return 'pending';
  if (provided.length < required.length) return 'partial';
  if (provided.length === required.length) return 'complete';
  
  return 'pending';
};
```

---

## **🔄 ALGORITHMS & PATTERNS**

### **Auto-Layout Algorithm**
```typescript
interface LayoutOptions {
  direction: 'horizontal' | 'vertical';
  spacing: { x: number; y: number };
  alignment: 'start' | 'center' | 'end';
}

class FlowLayoutEngine {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  
  constructor(nodes: FlowNode[], edges: FlowEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }
  
  // Hierarchical layout algorithm
  calculateLayout(options: LayoutOptions): FlowNode[] {
    const { direction, spacing, alignment } = options;
    
    // 1. Build dependency graph
    const graph = this.buildDependencyGraph();
    
    // 2. Topological sort to determine layers
    const layers = this.topologicalSort(graph);
    
    // 3. Position nodes in layers
    return this.positionNodesInLayers(layers, direction, spacing, alignment);
  }
  
  private buildDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    // Initialize all nodes
    this.nodes.forEach(node => {
      graph.set(node.id, []);
    });
    
    // Add dependencies from edges
    this.edges.forEach(edge => {
      const dependencies = graph.get(edge.target) || [];
      dependencies.push(edge.source);
      graph.set(edge.target, dependencies);
    });
    
    return graph;
  }
  
  private topologicalSort(graph: Map<string, string[]>): string[][] {
    const layers: string[][] = [];
    const visited = new Set<string>();
    const inDegree = new Map<string, number>();
    
    // Calculate in-degrees
    this.nodes.forEach(node => {
      inDegree.set(node.id, graph.get(node.id)?.length || 0);
    });
    
    // Process nodes layer by layer
    while (visited.size < this.nodes.length) {
      const currentLayer: string[] = [];
      
      // Find nodes with no dependencies
      for (const [nodeId, degree] of inDegree.entries()) {
        if (degree === 0 && !visited.has(nodeId)) {
          currentLayer.push(nodeId);
        }
      }
      
      // Mark as visited and update dependencies
      currentLayer.forEach(nodeId => {
        visited.add(nodeId);
        inDegree.delete(nodeId);
        
        // Reduce in-degree for dependent nodes
        this.edges
          .filter(edge => edge.source === nodeId)
          .forEach(edge => {
            const currentDegree = inDegree.get(edge.target) || 0;
            inDegree.set(edge.target, currentDegree - 1);
          });
      });
      
      layers.push(currentLayer);
    }
    
    return layers;
  }
  
  private positionNodesInLayers(
    layers: string[][],
    direction: 'horizontal' | 'vertical',
    spacing: { x: number; y: number },
    alignment: 'start' | 'center' | 'end'
  ): FlowNode[] {
    const positionedNodes: FlowNode[] = [];
    
    layers.forEach((layer, layerIndex) => {
      layer.forEach((nodeId, nodeIndex) => {
        const node = this.nodes.find(n => n.id === nodeId)!;
        
        let position: { x: number; y: number };
        
        if (direction === 'horizontal') {
          position = {
            x: layerIndex * spacing.x,
            y: this.calculateAlignedPosition(nodeIndex, layer.length, spacing.y, alignment)
          };
        } else {
          position = {
            x: this.calculateAlignedPosition(nodeIndex, layer.length, spacing.x, alignment),
            y: layerIndex * spacing.y
          };
        }
        
        positionedNodes.push({
          ...node,
          position
        });
      });
    });
    
    return positionedNodes;
  }
  
  private calculateAlignedPosition(
    index: number,
    total: number,
    spacing: number,
    alignment: 'start' | 'center' | 'end'
  ): number {
    switch (alignment) {
      case 'start':
        return index * spacing;
      case 'center':
        return (index - (total - 1) / 2) * spacing;
      case 'end':
        return (index - total + 1) * spacing;
      default:
        return index * spacing;
    }
  }
}
```

### **Field Collection State Machine**
```typescript
type CollectionState = 
  | 'idle'
  | 'collecting_node_name'
  | 'collecting_fields'
  | 'validating_field'
  | 'complete'
  | 'error';

interface CollectionContext {
  nodeType: NodeType;
  nodeName?: string;
  currentField?: string;
  fieldData: Record<string, string>;
  errors: string[];
}

class FieldCollectionStateMachine {
  private state: CollectionState = 'idle';
  private context: CollectionContext;
  
  constructor() {
    this.context = {
      nodeType: 'source',
      fieldData: {},
      errors: []
    };
  }
  
  // State transition logic
  transition(event: CollectionEvent): void {
    switch (this.state) {
      case 'idle':
        if (event.type === 'START_COLLECTION') {
          this.state = 'collecting_node_name';
          this.context.nodeType = event.nodeType;
        }
        break;
        
      case 'collecting_node_name':
        if (event.type === 'PROVIDE_NODE_NAME') {
          this.context.nodeName = event.name;
          this.state = 'collecting_fields';
          this.requestNextField();
        }
        break;
        
      case 'collecting_fields':
        if (event.type === 'PROVIDE_FIELD_VALUE') {
          this.state = 'validating_field';
          this.validateAndStoreField(event.field, event.value);
        }
        break;
        
      case 'validating_field':
        if (this.context.errors.length === 0) {
          if (this.isCollectionComplete()) {
            this.state = 'complete';
          } else {
            this.state = 'collecting_fields';
            this.requestNextField();
          }
        } else {
          this.state = 'error';
        }
        break;
    }
  }
  
  private validateAndStoreField(field: string, value: string): void {
    const validator = this.getFieldValidator(field);
    const isValid = validator(value);
    
    if (isValid) {
      this.context.fieldData[field] = value;
      this.context.errors = [];
    } else {
      this.context.errors = [`Invalid ${field}: ${value}`];
    }
  }
  
  private getFieldValidator(field: string): (value: string) => boolean {
    const validators: Record<string, (value: string) => boolean> = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      url: (value) => /^https?:\/\/.+/.test(value),
      required: (value) => value.trim().length > 0
    };
    
    return validators[field] || validators.required;
  }
}
```

---

## **🔒 SECURITY IMPLEMENTATION**

### **Input Sanitization**
```typescript
class SecurityService {
  // XSS prevention
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  // SQL injection prevention (for future backend integration)
  static sanitizeQuery(query: string): string {
    const dangerous = [
      'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER',
      'EXEC', 'EXECUTE', 'SCRIPT', 'UNION', 'SELECT'
    ];
    
    let sanitized = query;
    dangerous.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized.trim();
  }
  
  // Credential masking
  static maskCredential(value: string, visibleChars: number = 4): string {
    if (value.length <= visibleChars) {
      return '*'.repeat(value.length);
    }
    
    const masked = '*'.repeat(value.length - visibleChars);
    const visible = value.slice(-visibleChars);
    return masked + visible;
  }
}
```

---

## **⚡ PERFORMANCE OPTIMIZATION**

### **React Optimization Patterns**
```typescript
// Memoization strategy
const OptimizedComponent = React.memo<Props>(({ data, onAction }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);
  
  // Memoize event handlers
  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);
  
  // Memoize child components
  const ChildComponent = useMemo(() => (
    <ExpensiveChild data={processedData} onAction={handleAction} />
  ), [processedData, handleAction]);
  
  return (
    <div>
      {ChildComponent}
    </div>
  );
});

// Lazy loading implementation
const LazyCanvas = lazy(() => 
  import('./Canvas').then(module => ({ 
    default: module.Canvas 
  }))
);

const CanvasLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
  </div>
);

// Usage with Suspense
<Suspense fallback={<CanvasLoader />}>
  <LazyCanvas />
</Suspense>
```

---

## **📱 RESPONSIVE DESIGN IMPLEMENTATION**

### **Mobile-First CSS Architecture**
```css
/* Base styles (mobile-first) */
.component {
  @apply flex flex-col gap-4 p-4 text-sm;
}

/* Small screens and up (640px+) */
@screen sm {
  .component {
    @apply gap-6 p-6 text-base;
  }
}

/* Medium screens and up (768px+) */
@screen md {
  .component {
    @apply grid grid-cols-2 gap-8;
  }
}

/* Large screens and up (1024px+) */
@screen lg {
  .component {
    @apply max-w-6xl mx-auto p-10;
  }
}
```

### **Responsive Hook Implementation**
```typescript
const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('sm');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl'].includes(breakpoint)
  };
};
```

---

## **🎯 ACCESSIBILITY IMPLEMENTATION**

### **WCAG 2.1 AA Compliance**
```typescript
// Focus management
const useFocusManagement = () => {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  const trapFocus = (container: HTMLElement) => {
    const focusable = container.querySelectorAll(focusableElements);
    const firstFocusable = focusable[0] as HTMLElement;
    const lastFocusable = focusable[focusable.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };
  
  return { trapFocus };
};

// Screen reader announcements
const useAnnouncer = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };
  
  return { announce };
};
```

---

This low-level design documentation provides comprehensive implementation details for building maintainable, performant, and accessible components following enterprise-grade standards.
