import { memo, forwardRef, useEffect, useRef } from 'react';
import { MessageBubble } from '../molecules/MessageBubble';
import type { ChatMessage } from '../../types/chat';

interface MessageAreaProps {
  /**
   * Array of messages to display
   */
  messages: ChatMessage[];
  /**
   * Whether AI is currently thinking
   */
  aiThinking?: boolean;
  /**
   * ID of message to highlight
   */
  highlightId?: string | null;
  /**
   * Maximum height of the message area
   */
  maxHeight?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Test ID for the message area
   */
  testId?: string;
}

/**
 * MessageArea Organism Component
 *
 * A scrollable message area displaying chat messages.
 * This is an ORGANISM because it:
 * - Contains complex business logic (scrolling, message display)
 * - Manages multiple MessageBubble molecules
 * - Has context-specific functionality (chat display)
 * - Handles auto-scrolling behavior
 *
 * @example
 * ```tsx
 * <MessageArea
 *   messages={messages}
 *   aiThinking={isThinking}
 *   highlightId={highlightedMessageId}
 * />
 * ```
 */
export const MessageArea = memo(forwardRef<HTMLDivElement, MessageAreaProps>(
  function MessageArea({
    messages,
    aiThinking = false,
    highlightId = null,
    maxHeight = 'calc(100vh - 280px)',
    className = '',
    testId = 'message-area',
  }, ref) {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to last message when messages change
    useEffect(() => {
      // Use setTimeout to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        endRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
      }, 100); // Slightly longer delay for smoother animation
      return () => clearTimeout(timeoutId);
    }, [messages.length]);

    // Initial smooth scroll on mount
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        endRef.current?.scrollIntoView({ 
          behavior: 'smooth', // Changed from 'auto' to 'smooth' for first view
          block: 'end',
          inline: 'nearest'
        });
      }, 300); // Longer delay for initial smooth scroll
      return () => clearTimeout(timeoutId);
    }, []);

    return (
      <div
        ref={ref}
        data-testid={testId}
        className={`flex-1 overflow-y-auto p-4 space-y-6 min-h-0 scrollbar-thin smooth-scroll ${className}`}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={aiThinking}
        aria-label="Chat messages"
        style={{ 
          scrollBehavior: 'smooth',
          scrollPaddingTop: '20px',
          scrollPaddingBottom: '20px',
          maxHeight
        }}
      >
        {messages.length === 0 ? (
          <div 
            className="flex items-center justify-center h-full text-gray-500 text-center"
            role="status"
            aria-label="No messages yet"
          >
            <div>
              <div className="text-lg font-medium mb-2">Welcome to NexBot!</div>
              <div className="text-sm">Start by describing your data flow needs.</div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              type={message.type}
              content={message.content}
              status={message.status}
              createdAt={message.createdAt || Date.now()}
              highlight={message.id === highlightId}
            />
          ))
        )}
        <div ref={endRef} aria-hidden="true" />
      </div>
    );
  }
));

export default MessageArea;
