import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { connectorCatalog } from '../../lib/connectorCatalog';
import { FlowCanvasRF } from './FlowCanvasRF';
import { useCanvasStore } from '../../store/canvasStore';
import { validateFlowConfiguration, sanitizeInput } from '../../lib/security';
import { ProgressIndicator } from '../molecules/ProgressIndicator';
import { useProgressStore } from '../../store/progressStore';

type Status = 'pending' | 'partial' | 'complete' | 'error';

interface CanvasProps {
  // Configuration props
  selectedSource?: string;
  selectedDestination?: string;
  selectedTransform?: string;

  // Dynamic node values
  nodeValues?: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  };

  // Callbacks for updates
  onSourceChange?: (source: string) => void;
  onDestinationChange?: (destination: string) => void;
  onTransformChange?: (transform: string) => void;
  onNodeValuesChange?: (values: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  }) => void;

  // UI Configuration
  showControls?: boolean;
  showJsonPanel?: boolean;
  title?: string;
  className?: string;
}

export function Canvas({
  onSourceChange,
  onDestinationChange,
  onTransformChange,
  onNodeValuesChange,
  showControls = true,
  showJsonPanel = true,
  title = '⚡ Live Configuration Preview',
  className = '',
}: CanvasProps) {
  // Local state for validation errors and screen reader announcements
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState<string>('');
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');

  // Refs for keyboard navigation
  const canvasRef = useRef<HTMLDivElement>(null);
  const sourceSelectRef = useRef<HTMLSelectElement>(null);
  const transformSelectRef = useRef<HTMLSelectElement>(null);
  const destinationSelectRef = useRef<HTMLSelectElement>(null);
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Use Zustand store for state management
  const {
    selectedSource,
    selectedDestination,
    selectedTransform,
    nodeValues,
    setSelectedSource,
    setSelectedDestination,
    setSelectedTransform,
    updateNodeValues,
    updateTransformValuesByType,
    getTransformValuesByType,
    loadFlowConfiguration,
    resetToDefaultConfiguration,
    getFlowConfigurationJSON,
  } = useCanvasStore();

  // Progress store for tracking completion
  const { calculateFromCanvasState } = useProgressStore();

  // Note: Transition state management removed for cleaner code

  // Helper function to announce changes to screen readers
  const announceChange = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const announceStatus = useCallback((message: string) => {
    setStatusAnnouncement(message);
    setTimeout(() => setStatusAnnouncement(''), 1000);
  }, []);

  // Handlers that work with both external callbacks and Zustand store
  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    onSourceChange?.(value);
    announceChange(`Source connector changed to ${value}`);
  };

  const handleDestinationChange = (value: string) => {
    setSelectedDestination(value);
    onDestinationChange?.(value);
    announceChange(`Destination connector changed to ${value}`);
  };

  const handleTransformChange = (value: string) => {
    setSelectedTransform(value);
    onTransformChange?.(value);
    announceChange(`Transform type changed to ${value}`);
  };

  const handleNodeValuesChange = (values: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  }) => {
    // Handle regular source and destination updates
    if (values.source || values.destination) {
      updateNodeValues({ source: values.source, destination: values.destination });
    }

    // Handle transform updates - store them by transform type
    if (values.transform) {
      updateTransformValuesByType(selectedTransform, values.transform);
      // Also update the generic transform for backward compatibility
      updateNodeValues({ transform: values.transform });
    }

    onNodeValuesChange?.(values);
  };

  // Get available connectors for dropdowns (include dummy options)
  const sourceConnectors = [
    'Dummy Source',
    ...Object.keys(connectorCatalog).filter((name) => connectorCatalog[name].roles?.source),
  ];
  const destinationConnectors = [
    'Dummy Destination',
    ...Object.keys(connectorCatalog).filter((name) => connectorCatalog[name].roles?.destination),
  ];
  const transformOptions = ['Dummy Transform', 'Map & Validate', 'Cleanse', 'Enrich & Map'];

  // Create dynamic nodes based on selections
  const createDynamicNodes = useCallback(() => {
    // Define dummy specs for default placeholders
    const getDummySourceSpec = () => ({
      name: 'Dummy Source',
      category: 'Data Source',
      roles: { source: true, destination: false },
      credentials: {
        mandatory: ['username', 'password'],
        optional: [],
      },
    });

    const getDummyDestinationSpec = () => ({
      name: 'Dummy Destination',
      category: 'Data Destination',
      roles: { source: false, destination: true },
      credentials: {
        mandatory: ['apiKey', 'serverPrefix'],
        optional: [],
      },
    });

    const getDummyTransformSpec = () => ({
      name: 'Dummy Transform',
      category: 'Transform',
      credentials: { mandatory: [], optional: [] },
    });

    // Use catalog or dummy specs
    const sourceSpec = connectorCatalog[selectedSource] || getDummySourceSpec();
    const destinationSpec = connectorCatalog[selectedDestination] || getDummyDestinationSpec();
    // Transform spec - handle both catalog entries and hardcoded transform types
    const transformSpec =
      selectedTransform === 'Dummy Transform'
        ? getDummyTransformSpec()
        : {
            name: selectedTransform,
            category: 'Transform',
            credentials: { mandatory: [], optional: [] },
          };

    // Use unique IDs that include the selection to force re-rendering
    const sourceId = `source-${selectedSource.replace(/\s+/g, '-')}`;
    const transformId = `transform-${selectedTransform.replace(/\s+/g, '-')}`;
    const destinationId = `destination-${selectedDestination.replace(/\s+/g, '-')}`;

    // Ensure we always have default values for each node type (empty for dummies)
    const sourceValues = nodeValues.source || {};
    const destinationValues = nodeValues.destination || {};
    // Get transform values specific to the current transform type
    const transformValues = getTransformValuesByType(selectedTransform);

    const nodes: {
      id: string;
      role: 'source' | 'transform' | 'destination';
      spec: unknown;
      values?: Record<string, string | undefined>;
    }[] = [
      { id: sourceId, role: 'source', spec: sourceSpec, values: sourceValues },
      { id: transformId, role: 'transform', spec: transformSpec, values: transformValues },
      { id: destinationId, role: 'destination', spec: destinationSpec, values: destinationValues },
    ];

    const edges: { fromId: string; toId: string; status: Status }[] = [
      { fromId: sourceId, toId: transformId, status: 'pending' },
      { fromId: transformId, toId: destinationId, status: 'pending' },
    ];

    return { nodes, edges };
  }, [
    selectedSource,
    selectedDestination,
    selectedTransform,
    nodeValues,
    getTransformValuesByType,
  ]);

  const dynamicFlow = useMemo(() => createDynamicNodes(), [createDynamicNodes]);

  // Update progress when canvas state changes
  useEffect(() => {
    calculateFromCanvasState({
      selectedSource,
      selectedDestination,
      selectedTransform,
      nodeValues,
      transformByType: {
        'Dummy Transform': {},
        'Map & Validate': {},
        'Cleanse': {},
        'Enrich & Map': getTransformValuesByType('Enrich & Map'),
      },
    });
  }, [selectedSource, selectedDestination, selectedTransform, nodeValues, getTransformValuesByType, calculateFromCanvasState]);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    // Only handle navigation when not in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (event.key) {
      case '1':
        event.preventDefault();
        sourceSelectRef.current?.focus();
        break;
      case '2':
        event.preventDefault();
        transformSelectRef.current?.focus();
        break;
      case '3':
        event.preventDefault();
        destinationSelectRef.current?.focus();
        break;
      case 'j':
      case 'J':
        event.preventDefault();
        jsonTextareaRef.current?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        canvasRef.current?.focus();
        break;
      case '?':
        event.preventDefault();
        // Show keyboard shortcuts help
        alert(
          'Keyboard Shortcuts:\n1 - Focus Source\n2 - Focus Transform\n3 - Focus Destination\nJ - Focus JSON\nEsc - Focus Canvas\nTab - Navigate elements\n? - Show this help'
        );
        break;
    }
  }, []);

  // Set up keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  return (
    <div
      ref={canvasRef}
      className={`flex flex-col h-full ${className}`}
      tabIndex={0}
      role="application"
      aria-label="Data flow configuration canvas"
      aria-describedby="keyboard-help"
    >
      {/* Dynamic Configuration Controls */}
      {showControls && (
        <div className="p-4 bg-slate-50 rounded-xl border">
          <div className="text-sm font-semibold text-slate-700 mb-4">
            🎛️ Configure Your Data Flow
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Source Selector */}
            <div>
              <label
                htmlFor="source-selector"
                className="block text-xs font-medium text-slate-600 mb-2"
              >
                Source Connector
              </label>
              <select
                ref={sourceSelectRef}
                id="source-selector"
                value={selectedSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                aria-label="Select source connector for data flow"
                aria-describedby="source-help"
              >
                {sourceConnectors.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div id="source-help" className="sr-only">
                Choose the data source connector that will provide input data for your flow
              </div>
            </div>

            {/* Transform Selector */}
            <div>
              <label
                htmlFor="transform-selector"
                className="block text-xs font-medium text-slate-600 mb-2"
              >
                Transform Type
              </label>
              <select
                ref={transformSelectRef}
                id="transform-selector"
                value={selectedTransform}
                onChange={(e) => handleTransformChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                aria-label="Select transform type for data processing"
                aria-describedby="transform-help"
              >
                {transformOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div id="transform-help" className="sr-only">
                Choose the data transformation method to process your data
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label
                htmlFor="destination-selector"
                className="block text-xs font-medium text-slate-600 mb-2"
              >
                Destination Connector
              </label>
              <select
                ref={destinationSelectRef}
                id="destination-selector"
                value={selectedDestination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                aria-label="Select destination connector for data output"
                aria-describedby="destination-help"
              >
                {destinationConnectors.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div id="destination-help" className="sr-only">
                Choose the destination connector where processed data will be sent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Configuration Panel */}
      {showJsonPanel && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm font-semibold text-slate-700 mb-4">
            📝 Dynamic JSON Configuration
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* JSON Input */}
            <div>
              <label
                htmlFor="json-config"
                className="block text-xs font-medium text-slate-600 mb-2"
              >
                Flow Configuration (JSON)
              </label>
              <textarea
                ref={jsonTextareaRef}
                id="json-config"
                className="w-full h-32 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                value={getFlowConfigurationJSON()}
                aria-label="JSON configuration for data flow"
                aria-describedby="json-help"
                placeholder={`{
              "nodes": {
                "source": {
                  "name": "Shopify",
                  "credentials": {
                    "apiKey": "shop_key_abc",
                    "storeDomain": "mystore.myshopify.com"
                  }
                },
                "destination": {
                  "name": "Snowflake",
                  "credentials": {
                    "host/account": "company.snowflakecomputing.com",
                    "user": "datauser",
                    "password or key": "snow123",
                    "database/schema": "PROD_DB"
                  }
                },
                "transform": {
                  "name": "Cleanse",
                  "credentials": {
                    "cleansingRule": "remove_nulls"
                  }
                }
              }
            }`}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);

                    // Check if it's the new flow configuration format
                    if (
                      parsed.nodes &&
                      parsed.nodes.source &&
                      parsed.nodes.destination &&
                      parsed.nodes.transform
                    ) {
                      // Validate and sanitize the configuration
                      const validation = validateFlowConfiguration(parsed);

                      if (validation.isValid && validation.sanitized) {
                        loadFlowConfiguration(validation.sanitized);
                        setValidationErrors([]);
                        announceStatus('Configuration loaded successfully');
                      } else {
                        setValidationErrors(validation.errors);
                        announceStatus(
                          `Configuration validation failed: ${validation.errors.length} errors found`
                        );
                      }
                    } else {
                      // Fallback to old format for backward compatibility
                      // Still sanitize the input
                      const sanitizedParsed: Record<string, Record<string, string>> = {};
                      for (const [key, value] of Object.entries(parsed)) {
                        if (typeof value === 'object' && value !== null) {
                          sanitizedParsed[key] = {};
                          for (const [subKey, subValue] of Object.entries(
                            value as Record<string, unknown>
                          )) {
                            if (typeof subValue === 'string') {
                              sanitizedParsed[key][sanitizeInput(subKey)] = sanitizeInput(subValue);
                            }
                          }
                        }
                      }
                      handleNodeValuesChange(sanitizedParsed);
                      setValidationErrors([]);
                      announceStatus('Legacy configuration format loaded');
                    }
                  } catch {
                    setValidationErrors(['Invalid JSON format']);
                    announceStatus('Invalid JSON format detected');
                  }
                }}
              />
              <div id="json-help" className="sr-only">
                Enter JSON configuration to define your data flow with source, transform, and
                destination nodes
              </div>
              {validationErrors.length > 0 && (
                <div
                  className="mt-2 p-2 bg-red-ultra-light border-red-ultra-light rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="text-xs font-medium text-red-800 mb-1">Validation Errors:</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Quick Actions</label>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Load Shopify → Snowflake flow configuration
                    loadFlowConfiguration({
                      nodes: {
                        source: {
                          name: 'Shopify',
                          credentials: {
                            'apiKey/token': 'shop_key_abc',
                            storeDomain: 'mystore.myshopify.com',
                          },
                        },
                        destination: {
                          name: 'Snowflake',
                          credentials: {
                            'host/account': 'company.snowflakecomputing.com',
                            user: 'datauser',
                            'password or key': 'snow123',
                            'database/schema': 'PROD_DB',
                            warehouse: 'COMPUTE_WH',
                          },
                        },
                        transform: {
                          name: 'Cleanse',
                          credentials: { cleansingRule: 'remove_nulls', dataQuality: 'high' },
                        },
                      },
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Load sample Shopify to Snowflake configuration"
                >
                  🚀 Load Your JSON (Shopify → Snowflake)
                </button>
                <button
                  onClick={() => {
                    // Load Salesforce → Mailchimp flow configuration
                    loadFlowConfiguration({
                      nodes: {
                        source: {
                          name: 'Salesforce',
                          credentials: {
                            username: 'demo@salesforce.com',
                            password: 'demo123',
                            securityToken: 'token123',
                          },
                        },
                        destination: {
                          name: 'Mailchimp',
                          credentials: { apiKey: 'mailchimp_key_456', serverPrefix: 'us1' },
                        },
                        transform: {
                          name: 'Map & Validate',
                          credentials: {},
                        },
                      },
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="Load sample Salesforce to Mailchimp configuration"
                >
                  🔄 Load Sample (Salesforce → Mailchimp)
                </button>
                <button
                  onClick={resetToDefaultConfiguration}
                  className="w-full min-h-[44px] px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  aria-label="Reset configuration to default dummy nodes"
                >
                  🔄 Reset to Dummy Nodes
                </button>
                <div className="text-xs text-slate-500 mt-2">
                  <strong>Current Flow Configuration:</strong>
                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-20">
                    {getFlowConfigurationJSON()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas - Expanded to fill remaining space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="text-sm font-semibold text-slate-600 px-1 mb-3 flex-shrink-0">{title}</div>
        
        {/* Progress Indicator */}
        <div className="px-1 mb-4 flex-shrink-0">
          <ProgressIndicator />
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <FlowCanvasRF
            nodes={dynamicFlow.nodes as unknown as import('./FlowCanvasRF').FlowNodeInput[]}
            links={dynamicFlow.edges as unknown as import('./FlowCanvasRF').FlowEdgeInput[]}
            onNodeValuesChange={handleNodeValuesChange}
          />
        </div>
      </div>

      {/* Keyboard Navigation Help */}
      <div id="keyboard-help" className="sr-only">
        Keyboard shortcuts: Press 1 for Source, 2 for Transform, 3 for Destination, J for JSON
        editor, Escape to focus canvas, Tab to navigate, ? for help
      </div>

      {/* Screen Reader Live Regions */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {statusAnnouncement}
      </div>
    </div>
  );
}
