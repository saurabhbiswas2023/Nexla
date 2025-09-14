import { memo } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  /**
   * Text to display with the indicator
   */
  text?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the indicator should be visible
   */
  visible?: boolean;
}

/**
 * ScrollIndicator Atom Component
 *
 * A visual indicator showing users they can scroll down.
 * This is an ATOM because it:
 * - Has single responsibility (visual indicator)
 * - Contains no business logic
 * - Is highly reusable
 * - Has no dependencies on other components
 *
 * @example
 * ```tsx
 * <ScrollIndicator
 *   text="Scroll down to see canvas"
 *   visible={showIndicator}
 * />
 * ```
 */
export const ScrollIndicator = memo(function ScrollIndicator({
  text = 'Scroll down to see more',
  className = '',
  visible = true,
}: ScrollIndicatorProps) {
  if (!visible) return null;

  return (
    <div 
      className={`flex items-center justify-center gap-2 py-3 text-sm text-gray-600 bg-gray-50 border-t animate-pulse ${className}`}
      role="status"
      aria-label={text}
    >
      <span>{text}</span>
      <ChevronDown size={16} className="animate-bounce" aria-hidden="true" />
    </div>
  );
});

export default ScrollIndicator;
