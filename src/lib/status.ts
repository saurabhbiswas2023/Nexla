import { FLOW_CONSTANTS } from './constants';

export type Status = 'pending' | 'partial' | 'complete' | 'error';
export type NodeRole = 'source' | 'transform' | 'destination';

// Discriminated union for better type safety
export type FlowNodeSpec =
  | { type: 'connector'; spec: import('../types/connectors').ConnectorSpec }
  | {
      type: 'transform';
      name: string;
      category: string;
      credentials: { mandatory: string[]; optional?: string[] };
    };

// Type guards
export const isConnectorSpec = (
  spec: FlowNodeSpec
): spec is { type: 'connector'; spec: import('../types/connectors').ConnectorSpec } =>
  spec.type === 'connector';

export const isTransformSpec = (
  spec: FlowNodeSpec
): spec is {
  type: 'transform';
  name: string;
  category: string;
  credentials: { mandatory: string[]; optional?: string[] };
} => spec.type === 'transform';

export function statusColorHex(status: Status): string {
  return FLOW_CONSTANTS.COLORS.status[status];
}

export function computeNodeStatus(
  role: NodeRole,
  name: string | undefined,
  mandatory: string[],
  values: Record<string, string> | undefined
): Status {
  // ALL DUMMY NODES MUST ALWAYS BE PENDING - NEVER COMPLETE
  if (name === 'Dummy Source' || name === 'Dummy Destination' || name === 'Dummy Transform') {
    return 'pending';
  }

  if (role === 'transform') {
    // These transforms are complete when selected (no additional config needed)
    if (name === 'Map & Validate' || name === 'Cleanse' || name === 'Data Analysis') {
      return 'complete';
    }
    
    // For other transforms, check if they have extra configuration
    const hasExtras = Object.keys(values || {}).length > 0;
    return hasExtras ? 'complete' : 'pending';
  }
  const filled = mandatory.filter((k) => !!(values || {})[k]);
  if (filled.length === 0) return 'pending';
  if (filled.length < mandatory.length) return 'partial';
  return 'complete';
}

// Validation helper
export function validateNodeData(
  role: NodeRole,
  spec: FlowNodeSpec,
  values?: Record<string, string>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (role === 'transform') {
    if (!isTransformSpec(spec)) {
      errors.push('Invalid transform specification');
    }
  } else {
    if (!isConnectorSpec(spec)) {
      errors.push('Invalid connector specification');
    } else {
      const mandatory = spec.spec.credentials?.mandatory || [];
      const missing = mandatory.filter((field) => !(values || {})[field]);
      if (missing.length > 0) {
        errors.push(`Missing required fields: ${missing.join(', ')}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}
