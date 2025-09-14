import { memo } from 'react';
import { ConnectorLogos } from './ConnectorLogos';

interface ExampleCardProps {
  /**
   * The example text to display
   */
  label: string;
  /**
   * Callback when the card is clicked
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Test ID for the card
   */
  testId?: string;
}

/**
 * ExampleCard Molecule Component
 *
 * A clickable card displaying an example with icon and text.
 * This is a MOLECULE because it:
 * - Combines visual elements (icon + text)
 * - Has a single functional purpose (display example)
 * - Is reusable across contexts
 * - Contains minimal interaction logic
 *
 * @example
 * ```tsx
 * <ExampleCard
 *   label="Connect Shopify to BigQuery"
 *   onClick={() => handleExampleClick('shopify-bigquery')}
 * />
 * ```
 */
export const ExampleCard = memo(function ExampleCard({
  label,
  onClick,
  className = '',
  testId = 'example-card',
}: ExampleCardProps) {
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      data-testid={testId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        rounded-xl border bg-white p-4 text-left shadow-sm 
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2
        transition-all duration-200 w-full min-h-[44px]
        ${className}
      `}
      aria-label={`Example: ${label}`}
    >
      <div className="flex items-center gap-3">
        <ConnectorLogos 
          text={label}
          size="md"
          className="flex-shrink-0"
        />
        <div className="text-slate-800 font-medium">{label}</div>
      </div>
    </button>
  );
});

export default ExampleCard;
