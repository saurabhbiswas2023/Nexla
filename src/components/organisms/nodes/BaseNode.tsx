import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { ConnectorBox } from '../../organisms/ConnectorBox';
import { ConnectorSpec } from '../../../types/connectors';

type NodeRole = 'source' | 'destination';

type BaseNodeData = {
  spec: ConnectorSpec;
  values?: Record<string, string>;
  status?: 'pending' | 'partial' | 'complete' | 'error';
  onEdit?: (id: string, key: string, value: string) => void;
};

interface BaseNodeProps extends NodeProps {
  role: NodeRole;
}

const nodeConfig = {
  source: {
    handleType: 'source' as const,
    handlePosition: Position.Right,
    handleStyle: {
      width: 12,
      height: 12,
      background: '#1e40af',
      border: '2px solid #1e3a8a',
      borderRadius: 9999,
      boxShadow: '0 0 0 2px #ffffff',
    },
    handleAfter: true,
  },
  destination: {
    handleType: 'target' as const,
    handlePosition: Position.Left,
    handleStyle: {
      width: 12,
      height: 12,
      background: '#065f46',
      border: '2px solid #064e3b',
      borderRadius: 9999,
      boxShadow: '0 0 0 2px #ffffff',
    },
    handleAfter: false,
  },
};

export default memo(function BaseNode({ id, data, role }: BaseNodeProps) {
  const nodeData = data as BaseNodeData;
  const config = nodeConfig[role];

  const handleElement = (
    <Handle
      type={config.handleType}
      position={config.handlePosition}
      style={config.handleStyle}
    />
  );

  const connectorBox = (
    <ConnectorBox
      instance={{
        role,
        spec: nodeData.spec,
        values: nodeData.values,
        status: nodeData.status,
      }}
      nodeId={id}
      onEditValue={(nodeId, key, value) => nodeData.onEdit?.(nodeId, key, value)}
    />
  );

  return (
    <div className="select-none relative">
      {!config.handleAfter && handleElement}
      {connectorBox}
      {config.handleAfter && handleElement}
    </div>
  );
});
