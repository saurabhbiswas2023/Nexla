import { memo } from 'react';

interface ConnectorLogoProps {
  /**
   * Name of the connector (e.g., "Shopify", "BigQuery", "Salesforce")
   */
  connector: string;
  /**
   * Size of the logo
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Alt text for accessibility (optional, defaults to connector name)
   */
  alt?: string;
}

// Logo mapping - Simple, recognizable brand representations with accurate colors
const logoSVGs: Record<string, string> = {
  'Shopify': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 6c-1.1 0-2 .9-2 2v2h-4V8c0-1.1-.9-2-2-2s-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2h-2V8c0-1.1-.9-2-2-2z" fill="#95BF47"/>
    <circle cx="12" cy="15" r="2" fill="white"/>
  </svg>`,
  
  'BigQuery': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3l8 5v8l-8 5-8-5V8l8-5z" fill="#4285F4"/>
    <path d="M12 3v5l-8 3V8l8-5z" fill="#669DF6"/>
    <path d="M12 8v5l8-3V8l-8 3z" fill="#AECBFA"/>
  </svg>`,
  
  'Google BigQuery': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3l8 5v8l-8 5-8-5V8l8-5z" fill="#4285F4"/>
    <path d="M12 3v5l-8 3V8l8-5z" fill="#669DF6"/>
    <path d="M12 8v5l8-3V8l-8 3z" fill="#AECBFA"/>
  </svg>`,
  
  'Salesforce': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 10c0-1.5 1-3 3-3s3 1.5 3 3c1 0 2 .5 2 2s-1 2-2 2H8c-1 0-2-.5-2-2s1-2 2-2z" fill="#00A1E0"/>
    <circle cx="6" cy="16" r="1.5" fill="#00A1E0"/>
    <circle cx="12" cy="16" r="1.5" fill="#00A1E0"/>
    <circle cx="18" cy="16" r="1.5" fill="#00A1E0"/>
  </svg>`,
  
  'Mailchimp': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FFE01B"/>
    <circle cx="9" cy="10" r="1.5" fill="#241C15"/>
    <circle cx="15" cy="10" r="1.5" fill="#241C15"/>
    <path d="M8 14c0 2 2 4 4 4s4-2 4-4" stroke="#241C15" stroke-width="2" fill="none"/>
    <circle cx="17" cy="8" r="1" fill="#241C15"/>
  </svg>`,
  
  'PostgreSQL': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="8" rx="8" ry="4" fill="#336791"/>
    <ellipse cx="12" cy="12" rx="8" ry="3" fill="#336791"/>
    <ellipse cx="12" cy="16" rx="8" ry="2" fill="#336791"/>
    <circle cx="12" cy="8" r="2" fill="white"/>
  </svg>`,
  
  'Stripe': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#635BFF"/>
    <path d="M8 12c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" fill="white"/>
    <path d="M14 10v4" stroke="white" stroke-width="2"/>
  </svg>`,
  
  'Google Sheets': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#0F9D58"/>
    <path d="M6 8h12M6 12h12M6 16h12" stroke="white" stroke-width="1.5"/>
    <path d="M10 6v12M14 6v12" stroke="white" stroke-width="1.5"/>
  </svg>`,
  
  'Webhook': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="12" r="3" fill="#FF6B6B"/>
    <circle cx="18" cy="12" r="3" fill="#FF6B6B"/>
    <path d="M9 12h6" stroke="#FF6B6B" stroke-width="2"/>
    <path d="M15 9l3 3-3 3" stroke="#FF6B6B" stroke-width="2" fill="none"/>
  </svg>`,
  
  'Snowflake': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3 5-3 3-3-3 3-5zm0 20l-3-5 3-3 3 3-3 5zm10-10l-5-3 3-3 3 3-5 3zm-20 0l5 3-3 3-3-3 5-3z" fill="#29B5E8"/>
    <circle cx="12" cy="12" r="2" fill="#29B5E8"/>
  </svg>`
};

// Size classes mapping
const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
};

/**
 * ConnectorLogo Atom Component
 * 
 * Displays brand logos for data connectors using inline SVGs for optimal performance.
 * This is an ATOM because it:
 * - Has a single responsibility (display logo)
 * - Is highly reusable
 * - Contains no business logic
 * - Is a fundamental UI building block
 */
export const ConnectorLogo = memo(function ConnectorLogo({
  connector,
  size = 'md',
  className = '',
  alt
}: ConnectorLogoProps) {
  const logoSVG = logoSVGs[connector];
  const altText = alt || `${connector} logo`;
  
  if (!logoSVG) {
    // Fallback to a generic connector icon
    return (
      <div 
        className={`${sizeClasses[size]} ${className} rounded-full bg-slate-200 flex items-center justify-center`}
        aria-label={altText}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3/4 h-3/4">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
    );
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} ${className} flex-shrink-0`}
      dangerouslySetInnerHTML={{ __html: logoSVG }}
      aria-label={altText}
      role="img"
    />
  );
});

export default ConnectorLogo;
