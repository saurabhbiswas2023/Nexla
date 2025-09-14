import { memo, forwardRef } from 'react';
import { Bot } from 'lucide-react';

interface ChatHeaderProps {
  /**
   * Bot name to display
   */
  botName?: string;
  /**
   * Status message to display
   */
  statusMessage?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Background color classes
   */
  backgroundClassName?: string;
}

/**
 * ChatHeader Molecule Component
 *
 * A chat header with bot avatar, name, and status.
 * This is a MOLECULE because it:
 * - Combines multiple visual elements (icon + text)
 * - Has a single functional purpose (chat header)
 * - Is reusable across chat contexts
 * - Contains minimal business logic
 *
 * @example
 * ```tsx
 * <ChatHeader
 *   botName="NexBot"
 *   statusMessage="How can I help you today?"
 * />
 * ```
 */
export const ChatHeader = memo(forwardRef<HTMLElement, ChatHeaderProps>(
  function ChatHeader({
    botName = 'NexBot',
    statusMessage = 'How can I help you today?',
    className = '',
    backgroundClassName = 'bg-violet-600',
  }, ref) {
    return (
      <header 
        ref={ref}
        className={`border-b text-white ${backgroundClassName} ${className}`}
        role="banner"
        aria-label="Chat header"
      >
        <div className="w-full px-4 py-3 flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"
            role="img"
            aria-label={`${botName} avatar`}
          >
            <Bot size={18} aria-hidden="true" />
          </div>
          <div className="font-semibold" aria-label="Bot name">
            {botName}
          </div>
          <div 
            className="ml-2 text-white/70 text-sm"
            aria-label="Status message"
          >
            {statusMessage}
          </div>
        </div>
      </header>
    );
  }
));

export default ChatHeader;
