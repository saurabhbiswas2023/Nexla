import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { ConnectorBox } from '../../organisms/ConnectorBox';
import { ConnectorSpec } from '../../../types/connectors';

type SourceNodeData = {
  spec: ConnectorSpec;
  values?: Record<string, string>;
  status?: 'pending' | 'partial' | 'complete' | 'error';
  onEdit?: (id: string, key: string, value: string) => void;
};

export default memo(function SourceNode({ id, data }: NodeProps) {
  const nodeData = data as SourceNodeData;
  return (
    <div className="select-none relative">
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: '#1e40af',
          border: '2px solid #1e3a8a',
          borderRadius: 9999,
          boxShadow: '0 0 0 2px #ffffff',
        }}
      />
      <ConnectorBox
        instance={{
          role: 'source',
          spec: nodeData.spec,
          values: nodeData.values,
          status: nodeData.status,
        }}
        nodeId={id}
        onEditValue={(nodeId, key, value) => nodeData.onEdit?.(nodeId, key, value)}
      />
    </div>
  );
});
