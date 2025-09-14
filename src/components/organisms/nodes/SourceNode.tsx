import type { NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function SourceNode(props: NodeProps) {
  return <BaseNode {...props} role="source" />;
}
