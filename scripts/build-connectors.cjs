const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const mdPath = path.join(ROOT, 'chatmodel.md');
const outPath = path.join(ROOT, 'src', 'data', 'connectors.json');

function readFile(fp) {
  return fs.readFileSync(fp, 'utf8');
}

function extractTitles(md) {
  const startHeader = '### Connector Titles Extracted';
  const endHeader = '### Roles:';
  const start = md.indexOf(startHeader);
  if (start === -1) return [];
  const after = md.slice(start + startHeader.length);
  const end = after.indexOf(endHeader);
  const block = end === -1 ? after : after.slice(0, end);
  return block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.replace(/^\-\s+/, ''))
    .filter(Boolean);
}

const DB = /BigQuery|Snowflake|PostgreSQL|MySQL|SQLServer|Oracle|Teradata|AlloyDB|Db2|Elasticsearch|Sybase|Hive|Spanner|Cloud SQL|Synapse|Athena|Redshift|BigQuery API|HANA|Weaviate|Milvus|Qdrant|Vespa/i;
const FILE = /S3|Storage|Blob|Dropbox|Box|WebDAV|Sharepoint|Drive|FTP|Delta Lake|Data Lake/i;
const STREAM = /Kafka|Pub Sub|Kinesis|JMS|EMS|Firehose/i;
const CRM = /Salesforce|Hubspot|Zoho|Pipedrive|Zendesk|Capsule|Affinity|Freshsales|Keap|Totango|Gainsight/i;
const ECOMM = /Shopify|Magento|Big Commerce|Commerce Cloud|Mirakl|Walmart|Ticketmaster|SkyScanner|Amazon Seller/i;
const ADS = /Ads|Advertising|DSP|Search Ads|Criteo|TradeDesk|Google Analytics|Braze|Klaviyo|Sendgrid|Mailchimp|Marketo|Campaigner|Snapchat|LinkedIn|Facebook|Amazon Ads/i;
const VECTOR = /Pinecone|Weaviate|Qdrant|Milvus|Vespa/i;
const LLM = /Open AI|Anthropic|Gemini|Mistral|Grok|Together AI|Perplexity|NVIDIA AI|Azure AI Studio/i;
const DAAS = /data\.world|Crunchbase|OpenWeather|News API|FDA|Mailboxlayer|Collibra|Reltio|Hightouch|Usajobs|Looker/i;
const CYBER = /VirusTotal|Zscaler|Netskope|Proofpoint|Fingerbank|Security|Cyber/i;
const GENERIC = /REST API|GraphQL API|SOAP API|Webhook/i;

function categorize(name) {
  if (DB.test(name)) return 'Databases';
  if (FILE.test(name)) return 'File Systems';
  if (STREAM.test(name)) return 'Streaming';
  if (CRM.test(name)) return 'CRM';
  if (ECOMM.test(name)) return 'E-Commerce';
  if (ADS.test(name)) return 'Marketing & Advertising';
  if (VECTOR.test(name)) return 'Vector Databases';
  if (LLM.test(name)) return 'LLMs';
  if (DAAS.test(name)) return 'Data as a Service';
  if (CYBER.test(name)) return 'Cybersecurity';
  if (GENERIC.test(name)) return 'Generic APIs';
  return 'Other';
}

function main() {
  const md = readFile(mdPath);
  const titles = extractTitles(md);
  const connectors = titles.map((name) => ({ name, category: categorize(name) }));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ connectors }, null, 2));
  console.log(`Wrote ${connectors.length} connectors to ${path.relative(ROOT, outPath)}`);
}

main();
