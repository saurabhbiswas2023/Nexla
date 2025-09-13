import { useCallback } from 'react';
import { computeNodeStatus, NodeRole } from '../lib/status';
import { ConnectorSpec } from '../types/connectors';

export interface NodeActionHandlers {
  updateNodeValue: (key: string, value: string) => void;
  addTransformField: (field: string) => void;
}

export const useNodeActions = (
  nodeId: string,
  role: NodeRole,
  spec:
    | ConnectorSpec
    | { name: string; category: string; credentials: { mandatory: string[]; optional?: string[] } },
  onUpdate: (nodeId: string, updates: { values?: Record<string, string>; status?: string }) => void
): NodeActionHandlers => {
  const updateNodeValue = useCallback(
    (key: string, value: string) => {
      const newValues = (values: Record<string, string> = {}) => ({ ...values, [key]: value });

      // Compute new status based on role and updated values
      let newStatus: string;
      if (role === 'transform') {
        const transformSpec = spec as { name: string };
        newStatus = computeNodeStatus('transform', transformSpec.name, [], newValues());
      } else {
        const connectorSpec = spec as ConnectorSpec;
        const mandatory = connectorSpec.credentials?.mandatory || [];
        newStatus = computeNodeStatus(role, undefined, mandatory, newValues());
      }

      onUpdate(nodeId, { values: newValues(), status: newStatus });
    },
    [nodeId, role, spec, onUpdate]
  );

  const addTransformField = useCallback(
    (field: string) => {
      if (role !== 'transform') return;

      const newValues = (values: Record<string, string> = {}) => ({ ...values, [field]: '1' });
      const transformSpec = spec as { name: string };
      const newStatus = computeNodeStatus('transform', transformSpec.name, [], newValues());

      onUpdate(nodeId, { values: newValues(), status: newStatus });
    },
    [nodeId, role, spec, onUpdate]
  );

  return { updateNodeValue, addTransformField };
};
