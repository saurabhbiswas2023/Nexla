import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { TransformBox } from '../TransformBox';

type TransformNodeData = {
  name: string;
  values?: Record<string, string>;
  status: 'pending' | 'partial' | 'complete' | 'error';
  onAdd?: (id: string, field: string) => void;
};

export default memo(function TransformNode({ id, data }: NodeProps) {
  const nodeData = data as TransformNodeData;
  return (
    <div className="select-none relative">
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: '#6d28d9',
          border: '2px solid #5b21b6',
          borderRadius: 9999,
          boxShadow: '0 0 0 2px #ffffff',
        }}
      />
      <TransformBox
        name={nodeData.name}
        status={nodeData.status}
        nodeId={id}
        values={nodeData.values}
        onAdd={(nodeId, field) => nodeData.onAdd?.(nodeId, field)}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: '#6d28d9',
          border: '2px solid #5b21b6',
          borderRadius: 9999,
          boxShadow: '0 0 0 2px #ffffff',
        }}
      />
    </div>
  );
});
