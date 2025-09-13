import { memo } from 'react';
import type { EdgeProps } from '@xyflow/react';
import { getBezierPath } from '@xyflow/react';
import { statusColorHex } from '../../../lib/status';
import { FLOW_CONSTANTS } from '../../../lib/constants';

type EdgeData = { status: 'pending' | 'partial' | 'complete' | 'error'; kind?: 'tx-dst' };

export default memo(function StatusBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const payload = data as EdgeData | undefined;
  const status = payload?.status || 'partial';
  const color =
    payload?.kind === 'tx-dst'
      ? FLOW_CONSTANTS.COLORS.edge.transformToDestination
      : statusColorHex(status);
  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={color}
        strokeWidth={4}
        fill="none"
        markerEnd={markerEnd}
      />
    </g>
  );
});
