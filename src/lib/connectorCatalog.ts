import { ConnectorSpec } from '../types/connectors';
// Parse the connector titles from chatmodel.md to build a catalog dynamically.
// Vite allows importing raw files with ?raw
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import connectorsJson from '../data/connectors.json';

const DB_SET = new Set([
  'Google BigQuery',
  'Snowflake',
  'PostgreSQL',
  'MySQL',
  'Microsoft SQLServer',
  'Oracle Database',
  'Teradata',
  'MongoDB',
  'DynamoDB',
  'Elasticsearch',
  'Sybase',
  'IBM Db2',
  'Google AlloyDB',
]);
const FILE_SET = new Set([
  'Amazon S3',
  'Google Cloud Storage',
  'Azure Blob Storage',
  'Dropbox',
  'Box',
  'WebDAV',
  'Sharepoint',
  'Google Drive',
  'FTP, SFTP, FTPS',
]);
const STREAM_SET = new Set(['Kafka', 'Google Pub Sub', 'AWS Kinesis Firehose', 'JMS', 'Tibco EMS']);
const CRM_SET = new Set([
  'Salesforce',
  'Zoho',
  'Pipedrive',
  'Copper',
  'Hubspot',
  'Freshsales',
  'Zendesk Support',
  'Capsule',
  'Affinity CRM',
]);
const ECOMM_SET = new Set([
  'Shopify',
  'Magento',
  'Big Commerce Graph API',
  'Big Commerce Store Management',
  'Salesforce B2B Commerce Cloud',
  'Salesforce B2C Commerce Cloud',
  'Mirakl',
  'Walmart',
]);
const ADS_SET = new Set([
  'Google Ads',
  'Facebook Ads',
  'LinkedIn Ads',
  'Snapchat Ads',
  'Criteo',
  'The TradeDesk',
  'Amazon Ads',
]);
const VECTOR_SET = new Set(['Pinecone', 'Weaviate', 'Qdrant', 'Vespa', 'Milvus']);
const LLM_SET = new Set([
  'Open AI',
  'Anthropic AI',
  'Google Gemini',
  'Mistral AI',
  'Together AI',
  'Grok by xAI',
  'Perplexity AI',
  'NVIDIA AI',
  'Azure AI Studio',
]);
const DAAS_SET = new Set([
  'data.world',
  'Crunchbase',
  'Crunchbase Pro',
  'OpenWeather',
  'News API',
  'FDA',
  'Collibra',
  'Hightouch',
  'Reltio',
  'Usajobs',
  'Looker',
]);
const CYBER_SET = new Set(['VirusTotal', 'Zscaler', 'Netskope', 'Proofpoint', 'Fingerbank']);

function categoryFor(name: string): string {
  if (DB_SET.has(name) || /SQL|DB2|Db2|Sybase|AlloyDB|BigQuery/.test(name)) return 'Databases';
  if (FILE_SET.has(name) || /(S3|Storage|Drive|Dropbox|Box|WebDAV|Sharepoint|FTP)/i.test(name))
    return 'File Systems';
  if (STREAM_SET.has(name) || /(Kafka|Pub Sub|Kinesis|JMS|EMS)/i.test(name)) return 'Streaming';
  if (
    CRM_SET.has(name) ||
    /(Salesforce|Hubspot|Zoho|Zendesk|Capsule|Pipedrive|Freshsales)/i.test(name)
  )
    return 'CRM';
  if (
    ECOMM_SET.has(name) ||
    /(Shopify|Magento|Big Commerce|Commerce Cloud|Mirakl|Walmart)/i.test(name)
  )
    return 'E-Commerce';
  if (ADS_SET.has(name) || /(Ads|Advertising|DSP|SA 360|Search Ads)/i.test(name))
    return 'Marketing & Advertising';
  if (VECTOR_SET.has(name)) return 'Vector Databases';
  if (LLM_SET.has(name)) return 'LLMs';
  if (DAAS_SET.has(name)) return 'Data as a Service';
  if (CYBER_SET.has(name) || /(Security|Cyber|Zscaler|Netskope)/i.test(name))
    return 'Cybersecurity';
  if (/REST|GraphQL|SOAP|Webhook/i.test(name)) return 'Generic APIs';
  return 'Other';
}

function defaultsForCategory(cat: string): {
  roles: { source: boolean; destination: boolean };
  mandatory: string[];
  optional?: string[];
} {
  switch (cat) {
    case 'Databases':
      return {
        roles: { source: true, destination: true },
        mandatory: ['host/account', 'user', 'password or key', 'database/schema'],
        optional: ['warehouse', 'role', 'ssl'],
      };
    case 'File Systems':
      return {
        roles: { source: true, destination: true },
        mandatory: ['endpoint/bucket', 'auth'],
        optional: ['region', 'path/prefix'],
      };
    case 'Streaming':
      return {
        roles: { source: true, destination: true },
        mandatory: ['broker/endpoint', 'topic/stream', 'auth'],
        optional: ['tls/sasl'],
      };
    case 'CRM':
      return {
        roles: { source: true, destination: true },
        mandatory: ['baseUrl/loginUrl', 'clientId', 'clientSecret', 'user', 'token/password'],
        optional: ['instance'],
      };
    case 'E-Commerce':
      return {
        roles: { source: true, destination: true },
        mandatory: ['storeDomain', 'apiKey/token'],
        optional: ['apiVersion'],
      };
    case 'Marketing & Advertising':
      return {
        roles: { source: true, destination: true },
        mandatory: ['accessToken/apiKey', 'accountId'],
        optional: ['clientId', 'clientSecret'],
      };
    case 'Vector Databases':
      return {
        roles: { source: true, destination: true },
        mandatory: ['endpoint/host', 'apiKey', 'index/collection'],
        optional: [],
      };
    case 'LLMs':
      return {
        roles: { source: false, destination: true },
        mandatory: ['apiKey', 'model'],
        optional: ['endpoint'],
      };
    case 'Data as a Service':
      return {
        roles: { source: true, destination: false },
        mandatory: ['apiKey'],
        optional: ['baseUrl', 'accountId'],
      };
    case 'Cybersecurity':
      return {
        roles: { source: true, destination: false },
        mandatory: ['apiKey'],
        optional: ['baseUrl'],
      };
    case 'Generic APIs':
      return {
        roles: { source: true, destination: true },
        mandatory: ['baseUrl', 'auth'],
        optional: ['headers', 'params'],
      };
    default:
      return {
        roles: { source: true, destination: true },
        mandatory: ['baseUrl or host', 'auth'],
        optional: [],
      };
  }
}

function buildCatalog(): Record<string, ConnectorSpec> {
  const titles = (connectorsJson as { connectors: { name: string; category?: string }[] })
    .connectors;
  const map: Record<string, ConnectorSpec> = {};
  titles.forEach(({ name, category: declared }) => {
    const category = declared || categoryFor(name);
    const d = defaultsForCategory(category);
    map[name] = {
      name,
      category,
      roles: d.roles,
      credentials: { mandatory: d.mandatory, optional: d.optional },
    };
  });
  return map;
}

export const connectorCatalog: Record<string, ConnectorSpec> = buildCatalog();
