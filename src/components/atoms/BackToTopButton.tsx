import { memo } from 'react';
import { ChevronUp, MessageCircle } from 'lucide-react';

interface BackToTopButtonProps {
  /**
   * Callback when button is clicked
   */
  onClick?: () => void;
  /**
   * Text to display with the button
   */
  text?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the button should be visible
   */
  visible?: boolean;
}

/**
 * BackToTopButton Atom Component
 *
 * A button to scroll back to the top of the page.
 * This is an ATOM because it:
 * - Has single responsibility (navigation button)
 * - Contains no business logic
 * - Is highly reusable
 * - Has no dependencies on other components
 *
 * @example
 * ```tsx
 * <BackToTopButton
 *   text="Back to Chat"
 *   onClick={scrollToTop}
 *   visible={showButton}
 * />
 * ```
 */
export const BackToTopButton = memo(function BackToTopButton({
  onClick,
  text = 'Back to Chat',
  className = '',
  visible = true,
}: BackToTopButtonProps) {
  if (!visible) return null;

  const handleClick = () => {
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50 
        bg-violet-600 text-white 
        rounded-full px-4 py-3 
        shadow-lg hover:shadow-xl 
        hover:bg-violet-500 
        focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2
        transition-all duration-200
        flex items-center gap-2
        min-h-[44px] min-w-[44px]
        ${className}
      `}
      aria-label={text}
    >
      <MessageCircle size={20} aria-hidden="true" />
      <span className="font-medium text-sm">{text}</span>
      <ChevronUp size={16} aria-hidden="true" />
    </button>
  );
});

export default BackToTopButton;
