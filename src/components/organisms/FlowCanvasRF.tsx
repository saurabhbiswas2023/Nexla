import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Edge,
  Node,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SourceNode from './nodes/SourceNode';
import TransformNode from './nodes/TransformNode';
import DestinationNode from './nodes/DestinationNode';
import StatusBezierEdge from '../molecules/edges/StatusBezierEdge';
import { ErrorBoundary } from './ErrorBoundary';
import { computeResponsiveLayout } from '../../lib/flowLayout';
import { computeNodeStatus } from '../../lib/status';
import { ConnectorSpec } from '../../types/connectors';
import { FLOW_CONSTANTS } from '../../lib/constants';

export type RFStatus = 'pending' | 'partial' | 'complete' | 'error';

export type FlowNodeInput = {
  id: string;
  role: 'source' | 'transform' | 'destination';
  spec:
    | ConnectorSpec
    | {
        name: string;
        category: string;
        roles: { source: boolean; destination: boolean };
        credentials: { mandatory: string[]; optional?: string[] };
      };
  values?: Record<string, string>;
};

export type FlowEdgeInput = { fromId: string; toId: string; status: RFStatus };

const nodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  destination: DestinationNode,
} as const;

const edgeTypes = {
  statusBezier: StatusBezierEdge,
} as const;

type SourceDestData = {
  spec: ConnectorSpec;
  values?: Record<string, string>;
  status: RFStatus;
  onEdit: (id: string, key: string, value: string) => void;
};

type TransformData = {
  name: string;
  values?: Record<string, string>;
  status: RFStatus;
  onAdd: (id: string, field: string) => void;
};

type NodeData = SourceDestData | TransformData;

function InnerCanvas({
  initial,
  links,
  onNodeValuesChange,
}: {
  initial: FlowNodeInput[];
  links: FlowEdgeInput[];
  onNodeValuesChange?: (values: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  }) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([] as Node<NodeData>[]);
  const [userDragged, setUserDragged] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Helper function to notify parent of value changes
  const notifyValueChanges = useCallback(
    (updatedNodes: Node<NodeData>[]) => {
      if (!onNodeValuesChange) return;

      const values: {
        source?: Record<string, string | undefined>;
        destination?: Record<string, string | undefined>;
        transform?: Record<string, string | undefined>;
      } = {};

      updatedNodes.forEach((node) => {
        if (node.type === 'source' || node.type === 'destination') {
          const data = node.data as SourceDestData;
          values[node.type] = data.values || {};
        } else if (node.type === 'transform') {
          const data = node.data as TransformData;
          values.transform = data.values || {};
        }
      });

      onNodeValuesChange(values);
    },
    [onNodeValuesChange]
  );

  // Initialize nodes when initial data changes
  useEffect(() => {
    const initialNodes: Node<NodeData>[] = initial.map((n) => {
      // Set proper initial positions based on role - left-aligned starting from 40px
      let x = 40,
        y = 50;
      if (n.role === 'source') {
        x = 40;
        y = 50;
      } else if (n.role === 'transform') {
        x = 400;
        y = 50;
      } else if (n.role === 'destination') {
        x = 760;
        y = 50;
      }

      return {
        id: n.id,
        type: n.role,
        position: { x, y },
        zIndex: n.role === 'transform' ? 10 : n.role === 'source' ? 5 : 1, // Transform on top
        data:
          n.role === 'transform'
            ? {
                name: (n.spec as { name: string }).name,
                values: n.values,
                status: computeNodeStatus(
                  'transform',
                  (n.spec as { name: string }).name,
                  [],
                  n.values
                ),
                onAdd: (id: string, field: string) => {
                  setNodes((prev) => {
                    const updated = prev.map((node) => {
                      if (node.id !== id || node.type !== 'transform') return node;
                      const d = node.data as TransformData;
                      const newVals = { ...(d.values || {}), [field]: '1' };
                      return {
                        ...node,
                        data: {
                          ...d,
                          values: newVals,
                          status: computeNodeStatus('transform', d.name, [], newVals),
                        },
                      };
                    });
                    // Notify parent of changes
                    setTimeout(() => notifyValueChanges(updated), 0);
                    return updated;
                  });
                },
              }
            : {
                spec: n.spec as ConnectorSpec,
                values: n.values,
                status: computeNodeStatus(
                  n.role,
                  undefined,
                  (n.spec as ConnectorSpec).credentials?.mandatory || [],
                  n.values
                ),
                onEdit: (id: string, key: string, value: string) => {
                  setNodes((prev) => {
                    const updated = prev.map((node) => {
                      if (node.id !== id || (node.type !== 'source' && node.type !== 'destination'))
                        return node;
                      const d = node.data as SourceDestData;
                      const newVals = { ...(d.values || {}), [key]: value };
                      const mandatory = d.spec.credentials?.mandatory || [];
                      const status = computeNodeStatus(node.type, undefined, mandatory, newVals);
                      return { ...node, data: { ...d, values: newVals, status } };
                    });
                    // Notify parent of changes
                    setTimeout(() => notifyValueChanges(updated), 0);
                    return updated;
                  });
                },
              },
      };
    });

    setNodes(initialNodes);
  }, [initial, setNodes, notifyValueChanges]);

  const layout = useCallback(() => {
    const host = hostRef.current;
    if (!host) {
      console.log('⚠️ Layout called but host ref is null');
      return;
    }
    const w = host.getBoundingClientRect().width;
    setNodes((prev) => computeResponsiveLayout(prev, w, userDragged) as typeof prev);
  }, [userDragged, setNodes]);

  // Note: Node initialization is handled in the earlier useEffect

  const roleById = useMemo(() => {
    const map = new Map<string, 'source' | 'transform' | 'destination'>();
    initial.forEach((n) => map.set(n.id, n.role));
    return map;
  }, [initial]);
  const edges: Edge[] = useMemo(
    () =>
      links.map((e, idx) => {
        const kind =
          roleById.get(e.fromId) === 'transform' && roleById.get(e.toId) === 'destination'
            ? 'tx-dst'
            : undefined;
        return {
          id: `e-${idx}`,
          source: e.fromId,
          target: e.toId,
          type: 'statusBezier',
          data: { status: e.status, kind },
        } as Edge;
      }),
    [links, roleById]
  );

  // Enable responsive layout
  useEffect(() => {
    setTimeout(() => layout(), 300);
    const onResize = () => setTimeout(() => layout(), 100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [layout]);

  const onNodeDragStart = useCallback(() => setUserDragged(true), []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div
      ref={hostRef}
      className="relative rounded-xl bg-slate-50 border"
      data-testid="flow-canvas"
      style={{ height: FLOW_CONSTANTS.CANVAS.defaultHeight }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDragStart={onNodeDragStart}
        proOptions={proOptions}
        nodesConnectable
        nodesDraggable
        panOnScroll
        zoomOnScroll
        minZoom={FLOW_CONSTANTS.CANVAS.minZoom}
        maxZoom={FLOW_CONSTANTS.CANVAS.maxZoom}
        defaultViewport={{ x: 0, y: -800, zoom: 1 }}
        translateExtent={[
          [-100, -1000],
          [1400, 400],
        ]}
        nodeExtent={[
          [0, 0],
          [1200, 1000],
        ]}
        onViewportChange={() => {}} // Prevent viewport changes
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvasRF({
  nodes,
  links,
  onNodeValuesChange,
}: {
  nodes: FlowNodeInput[];
  links: FlowEdgeInput[];
  onNodeValuesChange?: (values: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  }) => void;
}) {
  // wrapper to provide context
  const props = { initial: nodes || [], links: links || [], onNodeValuesChange } as {
    initial: FlowNodeInput[];
    links: FlowEdgeInput[];
    onNodeValuesChange?: (values: {
      source?: Record<string, string | undefined>;
      destination?: Record<string, string | undefined>;
      transform?: Record<string, string | undefined>;
    }) => void;
  };
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <InnerCanvas {...props} />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}
