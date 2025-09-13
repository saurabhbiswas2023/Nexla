import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { ConnectorBox } from '../../organisms/ConnectorBox';
import { ConnectorSpec } from '../../../types/connectors';

type DestinationNodeData = {
  spec: ConnectorSpec;
  values?: Record<string, string>;
  status?: 'pending' | 'partial' | 'complete' | 'error';
  onEdit?: (id: string, key: string, value: string) => void;
};

export default memo(function DestinationNode({ id, data }: NodeProps) {
  const nodeData = data as DestinationNodeData;
  return (
    <div className="select-none relative">
      <ConnectorBox
        instance={{
          role: 'destination',
          spec: nodeData.spec,
          values: nodeData.values,
          status: nodeData.status,
        }}
        nodeId={id}
        onEditValue={(nodeId, key, value) => nodeData.onEdit?.(nodeId, key, value)}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: '#065f46',
          border: '2px solid #064e3b',
          borderRadius: 9999,
          boxShadow: '0 0 0 2px #ffffff',
        }}
      />
    </div>
  );
});
