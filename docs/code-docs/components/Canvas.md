# Canvas Component

**Organism Component** - Main flow visualization canvas using React Flow

## Overview

The Canvas component is the primary visualization interface for data flows. It integrates React Flow to provide an interactive canvas where users can view and manipulate data flow nodes and connections.

## Props Interface

```typescript
interface CanvasProps {
  showControls?: boolean;
  showJsonPanel?: boolean;
  onNodeValuesChange?: (nodeId: string, field: string, value: string) => void;
  className?: string;
}
```

## Usage Examples

### Basic Canvas
```tsx
import { Canvas } from '@/components/organisms/Canvas';

<Canvas />
```

### With Controls
```tsx
<Canvas 
  showControls={true}
  onNodeValuesChange={handleNodeChange}
/>
```

### With JSON Panel
```tsx
<Canvas 
  showControls={true}
  showJsonPanel={true}
/>
```

## Features

### Node Types
- **Source Nodes**: Data input connections (blue)
- **Transform Nodes**: Data processing steps (purple)  
- **Destination Nodes**: Data output connections (green)

### Interactive Elements
- **Drag & Drop**: Move nodes around the canvas
- **Connections**: Connect nodes with edges
- **Selection**: Select and configure nodes
- **Zoom & Pan**: Navigate large flows

### Controls
- **Auto Layout**: Automatic node positioning
- **Add Nodes**: Create new nodes
- **Minimap**: Overview of entire flow
- **Zoom Controls**: Zoom in/out and fit view

## Node Status System

```typescript
type NodeStatus = 'pending' | 'partial' | 'complete' | 'error';
```

- `pending`: Orange - No configuration
- `partial`: Blue - Some fields configured  
- `complete`: Green - All required fields set
- `error`: Red - Configuration error

## State Integration

Integrates with `useCanvasStore` for:
- Node management (add, update, delete)
- Edge connections
- Layout algorithms
- Persistence

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Node and connection descriptions
- **Focus Management**: Proper focus handling
- **ARIA Labels**: Comprehensive labeling

## Performance

- **React Flow**: Optimized rendering engine
- **Virtualization**: Large flow support
- **Memoization**: Optimized re-renders
- **Lazy Loading**: On-demand node loading

## Implementation

Located at: `src/components/organisms/Canvas.tsx`

Uses React Flow for the core canvas functionality with custom node types and extensive state management integration.
