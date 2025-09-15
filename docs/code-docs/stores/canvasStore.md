# Canvas Store

**Zustand Store** - Canvas state management with React Flow integration

## Overview

The Canvas Store manages the visual data flow canvas state, including nodes, edges, layout, and user interactions. It integrates with React Flow and coordinates with the Chat store for synchronized updates.

## State Interface

```typescript
interface CanvasState {
  // Core Canvas State
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  
  // Layout State
  viewport: { x: number; y: number; zoom: number };
  
  // Node Management Actions
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  
  // Edge Management Actions
  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;
  onConnect: (connection: Connection) => void;
  
  // Layout Actions
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  autoLayout: () => void;
  fitView: () => void;
  
  // Integration Actions
  updateFromConversation: (messages: ChatMessage[]) => void;
  batchUpdateCanvas: (updates: CanvasUpdate[]) => void;
  
  // Computed Properties
  selectedNode: FlowNode | null;
  completionPercentage: number;
  nodesByType: Record<NodeType, FlowNode[]>;
}
```

## Usage Examples

### Node Management
```typescript
import { useCanvasStore } from '@/store/canvasStore';

const { 
  nodes, 
  addNode, 
  updateNode, 
  deleteNode, 
  selectedNode 
} = useCanvasStore();

// Add a new source node
addNode('source', { x: 100, y: 100 });

// Update node configuration
updateNode('node-1', {
  data: { 
    ...existingData, 
    baseUrl: 'https://api.example.com' 
  }
});

// Delete a node
deleteNode('node-1');
```

### Edge Management
```typescript
const { edges, addEdge, deleteEdge, onConnect } = useCanvasStore();

// Connect two nodes
addEdge('source-1', 'transform-1');

// Handle React Flow connection
const handleConnect = (connection) => {
  onConnect(connection);
};
```

### Layout Management
```typescript
const { autoLayout, fitView, setViewport } = useCanvasStore();

// Auto-arrange nodes
autoLayout();

// Fit all nodes in view
fitView();

// Set specific viewport
setViewport({ x: 0, y: 0, zoom: 1 });
```

## Node Structure

### FlowNode Interface
```typescript
interface FlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  position: { x: number; y: number };
  data: {
    label: string;
    connector?: string;
    status: NodeStatus;
    configuration: Record<string, any>;
    spec?: ConnectorSpec;
    values?: Record<string, string>;
  };
}
```

### Node Types
- **Source Nodes**: Data input connections (blue theme)
- **Transform Nodes**: Data processing operations (purple theme)
- **Destination Nodes**: Data output connections (green theme)

### Node Status System
```typescript
type NodeStatus = 'pending' | 'partial' | 'complete' | 'error';
```

Status computation based on configuration completeness:
- `pending`: No configuration provided
- `partial`: Some required fields configured
- `complete`: All required fields configured
- `error`: Configuration validation failed

## Edge Structure

### FlowEdge Interface
```typescript
interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: React.CSSProperties;
  data?: {
    label?: string;
    status?: 'active' | 'inactive' | 'error';
  };
}
```

## Layout Algorithms

### Auto Layout
```typescript
const autoLayout = () => {
  const layoutedNodes = nodes.map((node, index) => {
    const nodesByType = groupNodesByType(nodes);
    const position = calculateNodePosition(node, index, nodesByType);
    return { ...node, position };
  });
  
  set({ nodes: layoutedNodes });
};
```

### Layout Strategies
- **Hierarchical**: Left-to-right flow layout
- **Grid**: Organized grid arrangement
- **Circular**: Circular node arrangement
- **Force-Directed**: Physics-based positioning

## Chat Integration

### Conversation Analysis
```typescript
const updateFromConversation = async (messages: ChatMessage[]) => {
  const analysis = await analyzeConversation(messages);
  
  // Create nodes based on conversation
  const newNodes = analysis.detectedNodes.map(createNodeFromAnalysis);
  
  // Create connections
  const newEdges = analysis.detectedConnections.map(createEdgeFromAnalysis);
  
  // Batch update canvas
  batchUpdateCanvas({
    nodes: newNodes,
    edges: newEdges,
    layout: 'auto'
  });
};
```

### Bidirectional Sync
- **Chat → Canvas**: Messages create/update nodes
- **Canvas → Chat**: Node changes trigger chat responses
- **Field Collection**: Real-time canvas updates during collection
- **Status Updates**: Node status changes reflected in chat

## Performance Optimization

### React Flow Integration
```typescript
const onNodesChange = useCallback((changes: NodeChange[]) => {
  set((state) => ({
    nodes: applyNodeChanges(changes, state.nodes)
  }));
}, []);

const onEdgesChange = useCallback((changes: EdgeChange[]) => {
  set((state) => ({
    edges: applyEdgeChanges(changes, state.edges)
  }));
}, []);
```

### Optimization Strategies
- **Memoized Selectors**: Computed properties cached
- **Batch Updates**: Multiple changes in single update
- **Virtualization**: Large canvas performance
- **Debounced Actions**: Prevent excessive updates

## Persistence

### State Persistence
```typescript
const persistConfig = {
  name: 'canvas-store',
  partialize: (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    viewport: state.viewport
  })
};
```

### Recovery Features
- **Auto-save**: Continuous state saving
- **Version History**: Canvas state versions
- **Export/Import**: Canvas configuration export
- **Backup Recovery**: Automatic backup restoration

## Validation System

### Node Validation
```typescript
const validateNode = (node: FlowNode): ValidationResult => {
  const requiredFields = getRequiredFields(node.type, node.data.connector);
  const providedFields = Object.keys(node.data.configuration);
  
  return {
    isValid: requiredFields.every(field => providedFields.includes(field)),
    missingFields: requiredFields.filter(field => !providedFields.includes(field)),
    errors: validateFieldValues(node.data.configuration)
  };
};
```

### Flow Validation
- **Connection Validation**: Valid source-to-destination paths
- **Cycle Detection**: Prevent circular dependencies
- **Type Compatibility**: Ensure compatible node connections
- **Configuration Completeness**: All nodes properly configured

## Error Handling

### Error Types
- **Node Creation Errors**: Invalid node configurations
- **Connection Errors**: Invalid edge connections
- **Layout Errors**: Positioning calculation failures
- **Sync Errors**: Chat-canvas synchronization issues

### Recovery Mechanisms
- **Automatic Correction**: Fix common configuration issues
- **User Notification**: Clear error messages and guidance
- **State Recovery**: Rollback to last valid state
- **Graceful Degradation**: Continue operation with partial failures

## Implementation

Located at: `src/store/canvasStore.ts`

Uses Zustand with React Flow integration, comprehensive validation, and performance optimization for reliable canvas state management.
