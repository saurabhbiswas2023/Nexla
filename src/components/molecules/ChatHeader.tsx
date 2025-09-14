import { memo, forwardRef } from 'react';
import { Bot, Home } from 'lucide-react';
import { useChatStore } from '../../store/chat';
import { useCanvasStore } from '../../store/canvasStore';
import { useProgressStore } from '../../store/progressStore';

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
          
          {/* Home button to reset and go back to landing */}
          <div className="ml-auto">
            <button
              onClick={() => {
                // Reset all stores before navigation
                useChatStore.getState().resetStore();
                useCanvasStore.getState().resetStore();
                useProgressStore.getState().resetStore();
                
                // Clear localStorage
                localStorage.removeItem('prefillPrompt');
                localStorage.removeItem('canvas-store');
                localStorage.removeItem('chat-store');
                localStorage.removeItem('progress-store');
                
                // Navigate to home
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/90 hover:text-white text-sm font-medium min-h-[44px]"
              aria-label="Go back to home page and start fresh"
              title="Start Fresh - Go to Home"
            >
              <Home size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>
    );
  }
));

export default ChatHeader;
