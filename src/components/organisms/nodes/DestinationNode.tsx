import type { NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function DestinationNode(props: NodeProps) {
  return <BaseNode {...props} role="destination" />;
}
