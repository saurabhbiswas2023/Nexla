import { memo } from 'react';
import { ConnectorLogo } from '../atoms/ConnectorLogo';

interface ConnectorLogosProps {
  /**
   * Text containing connector names (e.g., "Connect Shopify to BigQuery")
   */
  text: string;
  /**
   * Size of the logos
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Connector name mapping for text parsing
const connectorPatterns: Record<string, RegExp> = {
  'Shopify': /shopify/i,
  'Google BigQuery': /bigquery|big query/i,
  'Salesforce': /salesforce/i,
  'Mailchimp': /mailchimp/i,
  'PostgreSQL': /postgresql|postgres/i,
  'Stripe': /stripe/i,
  'Google Sheets': /google sheets|sheets/i,
  'Webhook': /webhook/i,
  'Snowflake': /snowflake/i,
};

/**
 * ConnectorLogos Molecule Component
 * 
 * Parses text to extract connector names and displays their logos.
 * This is a MOLECULE because it:
 * - Combines multiple atoms (ConnectorLogo components)
 * - Has parsing logic for connector detection
 * - Serves a specific UI purpose (show connector flow)
 * - Is reusable across different contexts
 */
export const ConnectorLogos = memo(function ConnectorLogos({
  text,
  size = 'md',
  className = ''
}: ConnectorLogosProps) {
  // Extract connector names from text
  const detectedConnectors: string[] = [];
  
  Object.entries(connectorPatterns).forEach(([connector, pattern]) => {
    if (pattern.test(text)) {
      detectedConnectors.push(connector);
    }
  });
  
  // If no connectors detected, show generic icon
  if (detectedConnectors.length === 0) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-7 h-7 rounded-full bg-amber-200 grid place-items-center text-amber-600">
          ⚡
        </div>
      </div>
    );
  }
  
  // Show first two connectors with arrow if multiple
  const displayConnectors = detectedConnectors.slice(0, 2);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {displayConnectors.map((connector, index) => (
        <div key={connector} className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-white shadow-sm border">
            <ConnectorLogo 
              connector={connector} 
              size={size}
            />
          </div>
          {index === 0 && displayConnectors.length > 1 && (
            <svg 
              className="w-3 h-3 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
});

export default ConnectorLogos;
