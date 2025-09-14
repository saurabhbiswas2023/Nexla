import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface NodeValues {
  source: Record<string, string | undefined>;
  destination: Record<string, string | undefined>;
  transform: Record<string, string | undefined>;
  // Transform-specific values stored by transform type
  transformByType: {
    'Dummy Transform': Record<string, string | undefined>;
    'Map & Validate': Record<string, string | undefined>;
    Cleanse: Record<string, string | undefined>;
    'Enrich & Map': Record<string, string | undefined>;
  };
}

export interface FlowConfiguration {
  nodes: {
    source: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
    destination: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
    transform: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
  };
}

export interface CanvasState {
  // Selected connectors (legacy - for backward compatibility)
  selectedSource: string;
  selectedDestination: string;
  selectedTransform: string;

  // Node values - persisted across changes (legacy - for backward compatibility)
  nodeValues: NodeValues;

  // New flow configuration
  flowConfiguration: FlowConfiguration;

  // Actions
  setSelectedSource: (source: string) => void;
  setSelectedDestination: (destination: string) => void;
  setSelectedTransform: (transform: string) => void;
  updateNodeValues: (values: Partial<NodeValues>) => void;
  updateSourceValues: (values: Record<string, string | undefined>) => void;
  updateDestinationValues: (values: Record<string, string | undefined>) => void;
  updateTransformValues: (values: Record<string, string | undefined>) => void;
  updateTransformValuesByType: (
    transformType: string,
    values: Record<string, string | undefined>
  ) => void;
  getTransformValuesByType: (transformType: string) => Record<string, string | undefined>;
  resetToDefaults: () => void;
  loadConfiguration: (config: {
    selectedSource?: string;
    selectedDestination?: string;
    selectedTransform?: string;
    nodeValues?: Partial<NodeValues>;
  }) => void;
  // New flow configuration methods
  loadFlowConfiguration: (config: FlowConfiguration) => void;
  updateNodeConfiguration: (
    nodeType: 'source' | 'destination' | 'transform',
    name: string,
    credentials: Record<string, string | undefined>
  ) => void;
  resetToDefaultConfiguration: () => void;
  getFlowConfigurationJSON: () => string;
  // Batched update method for atomic canvas updates
  batchUpdateCanvas: (updates: {
    source?: { name: string; credentials?: Record<string, string | undefined> };
    destination?: { name: string; credentials?: Record<string, string | undefined> };
    transform?: { name: string; credentials?: Record<string, string | undefined> };
  }) => void;
  
  // Reset all store data to initial state
  resetStore: () => void;
}

const defaultNodeValues: NodeValues = {
  source: {},
  destination: {},
  transform: {},
  transformByType: {
    'Dummy Transform': {},
    'Map & Validate': {},
    Cleanse: {},
    'Enrich & Map': {},
  },
};

const defaultFlowConfiguration: FlowConfiguration = {
  nodes: {
    source: {
      name: 'Dummy Source',
      credentials: {
        username: '',
        password: '',
      },
    },
    destination: {
      name: 'Dummy Destination',
      credentials: {
        apiKey: '',
        serverPrefix: '',
      },
    },
    transform: {
      name: 'Dummy Transform',
      credentials: {},
    },
  },
};

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedSource: 'Dummy Source',
        selectedDestination: 'Dummy Destination',
        selectedTransform: 'Dummy Transform',
        nodeValues: {
          ...defaultNodeValues,
          // Ensure transformByType is always present
          transformByType: {
            'Dummy Transform': {},
            'Map & Validate': {},
            Cleanse: {},
            'Enrich & Map': {},
          },
        },
        flowConfiguration: defaultFlowConfiguration,

        // Actions
        setSelectedSource: (source: string) =>
          set({ selectedSource: source }, false, 'setSelectedSource'),

        setSelectedDestination: (destination: string) =>
          set({ selectedDestination: destination }, false, 'setSelectedDestination'),

        setSelectedTransform: (transform: string) =>
          set({ selectedTransform: transform }, false, 'setSelectedTransform'),

        updateNodeValues: (values: Partial<NodeValues>) =>
          set(
            (state) => ({
              nodeValues: {
                ...state.nodeValues,
                source: { ...state.nodeValues.source, ...values.source },
                destination: { ...state.nodeValues.destination, ...values.destination },
                transform: { ...state.nodeValues.transform, ...values.transform },
              },
            }),
            false,
            'updateNodeValues'
          ),

        updateSourceValues: (values: Record<string, string | undefined>) =>
          set(
            (state) => ({
              nodeValues: {
                ...state.nodeValues,
                source: { ...state.nodeValues.source, ...values },
              },
            }),
            false,
            'updateSourceValues'
          ),

        updateDestinationValues: (values: Record<string, string | undefined>) =>
          set(
            (state) => ({
              nodeValues: {
                ...state.nodeValues,
                destination: { ...state.nodeValues.destination, ...values },
              },
            }),
            false,
            'updateDestinationValues'
          ),

        updateTransformValues: (values: Record<string, string | undefined>) =>
          set(
            (state) => ({
              nodeValues: {
                ...state.nodeValues,
                transform: { ...state.nodeValues.transform, ...values },
              },
            }),
            false,
            'updateTransformValues'
          ),

        updateTransformValuesByType: (
          transformType: string,
          values: Record<string, string | undefined>
        ) =>
          set(
            (state) => {
              // Ensure transformByType exists and has the required structure
              const currentTransformByType = state.nodeValues.transformByType || {
                'Dummy Transform': {},
                'Map & Validate': {},
                Cleanse: {},
                'Enrich & Map': {},
              };

              return {
                nodeValues: {
                  ...state.nodeValues,
                  transformByType: {
                    ...currentTransformByType,
                    [transformType]: {
                      ...(currentTransformByType[
                        transformType as keyof typeof currentTransformByType
                      ] || {}),
                      ...values,
                    },
                  },
                },
              };
            },
            false,
            'updateTransformValuesByType'
          ),

        getTransformValuesByType: (transformType: string) => {
          const state = get();
          // Safely access transformByType with fallbacks
          const transformByType = state.nodeValues.transformByType || {
            'Dummy Transform': {},
            'Map & Validate': {},
            Cleanse: {},
            'Enrich & Map': {},
          };
          return transformByType[transformType as keyof typeof transformByType] || {};
        },

        resetToDefaults: () =>
          set(
            {
              selectedSource: 'Dummy Source',
              selectedDestination: 'Dummy Destination',
              selectedTransform: 'Dummy Transform',
              nodeValues: defaultNodeValues,
            },
            false,
            'resetToDefaults'
          ),

        loadConfiguration: (config) => {
          const state = get();
          set(
            {
              selectedSource: config.selectedSource ?? state.selectedSource,
              selectedDestination: config.selectedDestination ?? state.selectedDestination,
              selectedTransform: config.selectedTransform ?? state.selectedTransform,
              nodeValues: {
                ...state.nodeValues,
                source: { ...state.nodeValues.source, ...config.nodeValues?.source },
                destination: { ...state.nodeValues.destination, ...config.nodeValues?.destination },
                transform: { ...state.nodeValues.transform, ...config.nodeValues?.transform },
              },
            },
            false,
            'loadConfiguration'
          );
        },

        // New flow configuration methods
        loadFlowConfiguration: (config: FlowConfiguration) => {
          set(
            (state) => ({
              // Update new flow configuration
              flowConfiguration: config,
              // Sync with legacy state for backward compatibility
              selectedSource: config.nodes.source.name,
              selectedDestination: config.nodes.destination.name,
              selectedTransform: config.nodes.transform.name,
              nodeValues: {
                ...state.nodeValues,
                source: config.nodes.source.credentials,
                destination: config.nodes.destination.credentials,
                transform: config.nodes.transform.credentials,
              },
            }),
            false,
            'loadFlowConfiguration'
          );
        },

        updateNodeConfiguration: (
          nodeType: 'source' | 'destination' | 'transform',
          name: string,
          credentials: Record<string, string | undefined>
        ) => {
          set(
            (state) => ({
              flowConfiguration: {
                ...state.flowConfiguration,
                nodes: {
                  ...state.flowConfiguration.nodes,
                  [nodeType]: { name, credentials },
                },
              },
              // Sync with legacy state
              [`selected${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`]: name,
              nodeValues: {
                ...state.nodeValues,
                [nodeType]: credentials,
              },
            }),
            false,
            'updateNodeConfiguration'
          );
        },

        resetToDefaultConfiguration: () => {
          set(
            {
              flowConfiguration: defaultFlowConfiguration,
              selectedSource: 'Dummy Source',
              selectedDestination: 'Dummy Destination',
              selectedTransform: 'Dummy Transform',
              nodeValues: defaultNodeValues,
            },
            false,
            'resetToDefaultConfiguration'
          );
        },

        getFlowConfigurationJSON: () => {
          const state = get();
          return JSON.stringify(state.flowConfiguration, null, 2);
        },

        // Batched update method for atomic canvas updates
        batchUpdateCanvas: (updates) => {
          const currentState = get();
          
          
          // Prepare the complete configuration in memory (no intermediate renders)
          const newFlowConfiguration = { ...currentState.flowConfiguration };
          const newNodeValues = { ...currentState.nodeValues };
          let newSelectedSource = currentState.selectedSource;
          let newSelectedDestination = currentState.selectedDestination;
          let newSelectedTransform = currentState.selectedTransform;

          // Apply source updates
          if (updates.source) {
            newSelectedSource = updates.source.name;
            newFlowConfiguration.nodes.source = {
              name: updates.source.name,
              credentials: {
                ...currentState.flowConfiguration.nodes.source.credentials,
                ...updates.source.credentials,
              },
            };
            newNodeValues.source = {
              ...currentState.nodeValues.source,
              ...updates.source.credentials,
            };
          }

          // Apply destination updates
          if (updates.destination) {
            newSelectedDestination = updates.destination.name;
            newFlowConfiguration.nodes.destination = {
              name: updates.destination.name,
              credentials: {
                ...currentState.flowConfiguration.nodes.destination.credentials,
                ...updates.destination.credentials,
              },
            };
            newNodeValues.destination = {
              ...currentState.nodeValues.destination,
              ...updates.destination.credentials,
            };
          }

          // Apply transform updates
          if (updates.transform) {
            newSelectedTransform = updates.transform.name;
            newFlowConfiguration.nodes.transform = {
              name: updates.transform.name,
              credentials: {
                ...currentState.flowConfiguration.nodes.transform.credentials,
                ...updates.transform.credentials,
              },
            };
            newNodeValues.transform = {
              ...currentState.nodeValues.transform,
              ...updates.transform.credentials,
            };
          }

          // Single atomic update - only one render!
          set(
            {
              selectedSource: newSelectedSource,
              selectedDestination: newSelectedDestination,
              selectedTransform: newSelectedTransform,
              flowConfiguration: newFlowConfiguration,
              nodeValues: newNodeValues,
            },
            false,
            'batchUpdateCanvas'
          );

        },

        // Reset all store data to initial state (for landing page navigation)
        resetStore: () => {
          set(
            {
              selectedSource: 'Dummy Source',
              selectedDestination: 'Dummy Destination',
              selectedTransform: 'Dummy Transform',
              nodeValues: {
                ...defaultNodeValues,
                transformByType: {
                  'Dummy Transform': {},
                  'Map & Validate': {},
                  Cleanse: {},
                  'Enrich & Map': {},
                },
              },
              flowConfiguration: defaultFlowConfiguration,
            },
            false,
            'resetStore'
          );
        },
      }),
      {
        name: 'canvas-store', // unique name for localStorage
        partialize: (state) => ({
          selectedSource: state.selectedSource,
          selectedDestination: state.selectedDestination,
          selectedTransform: state.selectedTransform,
          nodeValues: state.nodeValues,
          flowConfiguration: state.flowConfiguration,
        }), // only persist these fields
        // Migration function to handle old localStorage data
        migrate: (persistedState: unknown) => {
          interface LegacyState {
            selectedSource?: string;
            selectedDestination?: string;
            selectedTransform?: string;
            nodeValues?: Partial<NodeValues>;
            flowConfiguration?: FlowConfiguration;
          }
          const state = persistedState as LegacyState;
          if (state && state.nodeValues && !state.nodeValues.transformByType) {
            // Add missing transformByType structure to existing data
            state.nodeValues.transformByType = {
              'Dummy Transform': {},
              'Map & Validate': {},
              Cleanse: {},
              'Enrich & Map': {},
            };
          }
          if (state && !state.flowConfiguration) {
            // Add missing flowConfiguration for existing data
            state.flowConfiguration = defaultFlowConfiguration;
          }
          return state;
        },
        version: 1, // Increment when structure changes
      }
    ),
    { name: 'CanvasStore' } // name for Redux DevTools
  )
);
