export type ParsedFlow = {
  source: string | null;
  transform: string | null;
  destination: string | null;
};

const KNOWN_PROVIDERS = [
  'shopify',
  'bigquery',
  'snowflake',
  'salesforce',
  'mailchimp',
  'postgresql',
  'webhook',
  'stripe',
  'google sheets',
];

function findProviders(text: string): string[] {
  const lower = text.toLowerCase();
  const matches: string[] = [];
  for (const name of KNOWN_PROVIDERS) {
    if (lower.includes(name)) matches.push(name);
  }
  return matches;
}

function capitalizeLabel(label: string): string {
  return label
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function parseFlowFromText(text: string): ParsedFlow {
  const lower = text.toLowerCase();
  const providers = findProviders(lower);

  let source: string | null = null;
  let destination: string | null = null;
  let transform: string | null = null;

  // Pattern 1: "connect X to Y" | "sync X to Y" | "send X to Y"
  const toMatch = /(connect|sync|send|route|move)\s+(.+?)\s+to\s+(.+)/i.exec(text);
  if (toMatch) {
    source = toMatch[2].trim();
    destination = toMatch[3].trim();
  }

  // Pattern 2: "analyze X in Y" | "analyze X into Y"
  if (!destination) {
    const inMatch = /(analyze|store|save|log|write)\s+(.+?)\s+(in|into)\s+(.+)/i.exec(text);
    if (inMatch) {
      source = inMatch[2].trim();
      destination = inMatch[4].trim();
    }
  }

  // Use provider detection as fallback or to refine generic phrases
  if (!source && providers.length > 0) source = providers[0];
  if (!destination && providers.length > 1) destination = providers[1];

  // Normalize labels
  source = source ? capitalizeLabel(source) : null;
  destination = destination ? capitalizeLabel(destination) : null;

  // Simple transform inference
  if (/map|transform|clean|validate|normalize/i.test(text)) transform = 'Transform';
  else if (/analyze|aggregate|pivot/i.test(text)) transform = 'Analyze';
  else if (source && destination) transform = 'Map & Validate';

  return { source, transform, destination };
}
