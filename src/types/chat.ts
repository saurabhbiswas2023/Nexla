/**
 * Shared chat types to ensure consistency across components
 */

export type MessageStatus = 'sending' | 'sent' | 'error' | 'thinking';

export type MessageType = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  status?: MessageStatus;
  createdAt?: number;
}

export interface ChatState {
  messages: ChatMessage[];
  input: string;
  conversationHistory: string[];
  aiThinking: boolean;
  highlightId: string | null;
}
