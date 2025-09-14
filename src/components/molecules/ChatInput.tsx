import { memo, forwardRef, useEffect, useRef } from 'react';
import { SendHorizontal } from 'lucide-react';
import { sanitizeInput } from '../../lib/security';

interface ChatInputProps {
  /**
   * Current input value
   */
  value: string;
  /**
   * Callback when input value changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when form is submitted
   */
  onSubmit: () => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Test ID for the textarea
   */
  inputTestId?: string;
  /**
   * Test ID for the submit button
   */
  submitTestId?: string;
}

/**
 * ChatInput Molecule Component
 *
 * A chat input area with auto-resizing textarea and send button.
 * This is a MOLECULE because it:
 * - Combines textarea + button elements
 * - Has a single functional purpose (message input)
 * - Is reusable across chat contexts
 * - Contains input handling logic
 *
 * @example
 * ```tsx
 * <ChatInput
 *   value={input}
 *   onChange={setInput}
 *   onSubmit={handleSubmit}
 *   placeholder="Type your message..."
 * />
 * ```
 */
export const ChatInput = memo(forwardRef<HTMLFormElement, ChatInputProps>(
  function ChatInput({
    value,
    onChange,
    onSubmit,
    placeholder = 'Describe your data flow…',
    disabled = false,
    className = '',
    inputTestId = 'chat-input',
    submitTestId = 'send-button',
  }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      
      // Reset height to calculate new height
      el.style.height = 'auto';
      const newHeight = Math.min(el.scrollHeight, 120); // Max height of 120px
      el.style.height = newHeight + 'px';
    }, [value]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!value.trim() || disabled) return;
      
      // Basic validation
      const trimmedValue = value.trim();
      if (trimmedValue.length > 1000) {
        // Could add error handling here
        return;
      }

      // Sanitize input before submission
      const sanitizedValue = sanitizeInput(trimmedValue);
      if (sanitizedValue !== trimmedValue) {
        // Could add error handling here
        return;
      }

      onSubmit();
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      
      // Auto-resize
      const el = e.currentTarget;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled) {
          handleSubmit(e);
        }
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={`flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 ${className}`}
        role="form"
        aria-label="Message input form"
      >
        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            ref={textareaRef}
            data-testid={inputTestId}
            aria-multiline="true"
            rows={1}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none overflow-y-auto min-h-[44px] max-h-[120px] scrollbar-invisible"
            placeholder={placeholder}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Message input"
            aria-describedby="input-help"
          />
          <button
            type="submit"
            data-testid={submitTestId}
            className="rounded-2xl bg-violet-600 text-white px-3 sm:px-4 py-3 font-semibold hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
            disabled={disabled || !value.trim()}
          >
            <SendHorizontal size={20} aria-hidden="true" />
            <span className="font-semibold ml-1 hidden sm:inline">Send</span>
          </button>
        </div>
        <div id="input-help" className="sr-only">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    );
  }
));

export default ChatInput;
