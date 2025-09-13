import { create } from 'zustand';
import { parseFlowFromText } from '../lib/intent';

export type FlowNode = {
  id: string;
  type: 'source' | 'transform' | 'destination';
  label: string;
  x: number;
  y: number;
};
export type FlowConn = { id: string; from: string; to: string };

type FlowState = {
  nodes: FlowNode[];
  conns: FlowConn[];
  buildFromText: (text: string) => void;
  reset: () => void;
};

export const useFlowStore = create<FlowState>()((set) => ({
  nodes: [
    { id: 'n1', type: 'source', label: 'Source', x: 40, y: 60 },
    { id: 'n2', type: 'transform', label: 'Transform', x: 220, y: 60 },
    { id: 'n3', type: 'destination', label: 'Destination', x: 420, y: 60 },
  ],
  conns: [
    { id: 'c1', from: 'n1', to: 'n2' },
    { id: 'c2', from: 'n2', to: 'n3' },
  ],
  buildFromText: (text) =>
    set(() => {
      const parsed = parseFlowFromText(text);
      const nodes: FlowNode[] = [];
      let x = 40;
      const y = 60;

      const addNode = (type: FlowNode['type'], label: string) => {
        const id = crypto.randomUUID();
        nodes.push({ id, type, label, x, y });
        x += 200;
        return id;
      };

      const ids: { source?: string; transform?: string; destination?: string } = {};
      if (parsed.source) ids.source = addNode('source', parsed.source);
      if (parsed.transform) ids.transform = addNode('transform', parsed.transform);
      if (parsed.destination) ids.destination = addNode('destination', parsed.destination);

      const conns: FlowConn[] = [];
      if (ids.source && ids.transform)
        conns.push({ id: crypto.randomUUID(), from: ids.source, to: ids.transform });
      if (ids.transform && ids.destination)
        conns.push({ id: crypto.randomUUID(), from: ids.transform, to: ids.destination });
      if (ids.source && !ids.transform && ids.destination)
        conns.push({ id: crypto.randomUUID(), from: ids.source, to: ids.destination });

      return { nodes, conns };
    }),
  reset: () =>
    set({
      nodes: [
        { id: 'n1', type: 'source', label: 'Source', x: 40, y: 60 },
        { id: 'n2', type: 'transform', label: 'Transform', x: 220, y: 60 },
        { id: 'n3', type: 'destination', label: 'Destination', x: 420, y: 60 },
      ],
      conns: [
        { id: 'c1', from: 'n1', to: 'n2' },
        { id: 'c2', from: 'n2', to: 'n3' },
      ],
    }),
}));
