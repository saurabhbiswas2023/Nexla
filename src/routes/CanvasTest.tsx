import { Canvas } from '../components/organisms/Canvas';
import { useCanvasStore } from '../store/canvasStore';

export function CanvasTest() {
  // Use Zustand store for state management
  const { loadConfiguration } = useCanvasStore();

  // Test scenarios data
  const testScenarios = [
    {
      id: 'default',
      name: '🎯 Default Dummy Nodes',
      description: 'Empty placeholder nodes ready for configuration',
      data: {
        selectedSource: 'Dummy Source',
        selectedDestination: 'Dummy Destination',
        selectedTransform: 'Dummy Transform',
        nodeValues: {
          source: {},
          destination: {},
          transform: {},
        },
      },
    },
    {
      id: 'salesforce-mailchimp',
      name: '🚀 Salesforce → Mailchimp',
      description: 'Complete CRM to Email Marketing flow',
      data: {
        selectedSource: 'Salesforce',
        selectedDestination: 'Mailchimp',
        selectedTransform: 'Map & Validate',
        nodeValues: {
          source: { username: 'sales@company.com', password: 'pass123', securityToken: 'token456' },
          destination: { apiKey: 'mc_key_789', serverPrefix: 'us1', listId: '12345' },
          transform: {},
        },
      },
    },
    {
      id: 'shopify-snowflake',
      name: '💼 Shopify → Snowflake',
      description: 'E-commerce to Data Warehouse',
      data: {
        selectedSource: 'Shopify',
        selectedDestination: 'Snowflake',
        selectedTransform: 'Cleanse',
        nodeValues: {
          source: { apiKey: 'shop_key_abc', domain: 'mystore.myshopify.com' },
          destination: {
            account: 'company.snowflakecomputing.com',
            username: 'datauser',
            password: 'snow123',
            warehouse: 'COMPUTE_WH',
          },
          transform: { cleansingRule: 'remove_nulls', dataQuality: 'high' },
        },
      },
    },
    {
      id: 'postgres-elasticsearch',
      name: '🔍 PostgreSQL → Elasticsearch',
      description: 'Database to Search Engine',
      data: {
        selectedSource: 'PostgreSQL',
        selectedDestination: 'Elasticsearch',
        selectedTransform: 'Enrich & Map',
        nodeValues: {
          source: {
            host: 'localhost',
            port: '5432',
            database: 'products',
            username: 'dbuser',
            password: 'dbpass',
          },
          destination: {
            host: 'elastic.company.com',
            port: '9200',
            index: 'products',
            username: 'elastic',
            password: 'elastic123',
          },
          transform: { enrichment: 'add_metadata', mapping: 'product_schema' },
        },
      },
    },
    {
      id: 'partial-config',
      name: '⚠️ Partial Configuration',
      description: 'Some fields missing - shows pending/partial status',
      data: {
        selectedSource: 'Salesforce',
        selectedDestination: 'Mailchimp',
        selectedTransform: 'Map & Validate',
        nodeValues: {
          source: { username: 'incomplete@example.com' },
          destination: { apiKey: 'partial_key' },
          transform: {},
        },
      },
    },
    {
      id: 'empty-config',
      name: '📝 Empty Configuration',
      description: 'No values - all nodes pending',
      data: {
        source: 'Salesforce',
        destination: 'Snowflake',
        transform: 'Cleanse',
        values: { source: {}, destination: {}, transform: {} },
      },
    },
  ];

  // Apply test scenario
  const applyScenario = (scenario: (typeof testScenarios)[0]) => {
    loadConfiguration(scenario.data);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="text-xl font-semibold mb-6">Canvas Test — Dynamic Data Testing</div>

      {/* Test Scenario Buttons */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl border">
        <div className="text-sm font-semibold text-slate-700 mb-4">
          🧪 Test Scenarios - Click to Apply
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => applyScenario(scenario)}
              className="text-left p-3 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-sm text-slate-800">{scenario.name}</div>
              <div className="text-xs text-slate-500 mt-1">{scenario.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Single Dynamic Canvas */}
      <div className="mb-12">
        <Canvas
          showControls={true}
          showJsonPanel={true}
          title="⚡ Dynamic Canvas - Updates Based on Test Data"
        />
      </div>
    </div>
  );
}
