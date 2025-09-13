import type { Node } from '@xyflow/react';
import { FLOW_CONSTANTS } from './constants';

export function computeResponsiveLayout(nodes: Node[], width: number, wasDragged: boolean): Node[] {
  if (wasDragged) return nodes;

  const { NODE_DIMENSIONS, CANVAS } = FLOW_CONSTANTS;
  const { width: NODE_W, height: NODE_H } = NODE_DIMENSIONS;

  // Ensure positions are within canvas bounds - leave more margin for visibility
  const maxY = CANVAS.defaultHeight - NODE_H - 80;

  // Always use horizontal layout - no vertical stacking on responsive

  // Horizontal layout for all screen sizes - responsive spacing starting from 40px
  const leftMargin = 40;
  const rightMargin = Math.max(40, width * 0.05); // 5% of width or 40px minimum
  const availableWidth = width - leftMargin - rightMargin;

  const xSrc = leftMargin; // Start from 40px from left

  // Calculate responsive spacing between nodes
  const minNodeSpacing = 60; // Minimum spacing between nodes
  const idealNodeSpacing = Math.min(100, availableWidth * 0.08); // 8% of available width or 100px max
  const nodeSpacing = Math.max(minNodeSpacing, idealNodeSpacing);

  // Position transform and destination nodes with responsive spacing
  // Ensure nodes fit within screen bounds
  const totalNodesWidth = 3 * NODE_W + 2 * nodeSpacing; // 3 nodes + 2 gaps
  const totalRequiredWidth = leftMargin + totalNodesWidth + rightMargin;

  let xTx, xDst;

  if (totalRequiredWidth > width) {
    // If nodes don't fit with ideal spacing, compress spacing
    const availableSpacing = (width - leftMargin - rightMargin - 3 * NODE_W) / 2;
    const compressedSpacing = Math.max(30, availableSpacing); // Minimum 30px spacing

    xTx = xSrc + NODE_W + compressedSpacing;
    xDst = xTx + NODE_W + compressedSpacing;
  } else {
    // Use ideal spacing
    xTx = xSrc + NODE_W + nodeSpacing;
    xDst = xTx + NODE_W + nodeSpacing;
  }

  // Keep all nodes at same Y level to prevent layering issues
  const baseY = Math.min(20, maxY); // Start near top with minimal gap, same for all nodes
  const ySrc = baseY;
  const yTx = baseY; // Same level as source and destination
  const yDst = baseY;

  const result = nodes.map((n) => {
    if (n.type === 'source') return { ...n, position: { x: xSrc, y: ySrc } };
    if (n.type === 'transform') return { ...n, position: { x: xTx, y: yTx } };
    if (n.type === 'destination') return { ...n, position: { x: xDst, y: yDst } };
    return n;
  });

  return result;
}
