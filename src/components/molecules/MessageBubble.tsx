import { Bot, User as UserIcon, CheckCheck, AlertCircle } from 'lucide-react';

type Props = {
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
  highlight?: boolean;
};

export function MessageBubble({ type, content, status, createdAt, highlight }: Props) {
  const isUser = type === 'user';
  const Avatar = isUser ? UserIcon : Bot;
  const meta = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  return (
    <div
      data-testid={`message-${type}-${crypto.randomUUID()}`}
      className={`${isUser ? 'ml-auto max-w-[90%]' : 'max-w-[80%]'} w-full ${highlight ? 'ring-2 ring-violet-300 rounded-2xl transition-[box-shadow] duration-700' : ''}`}
    >
      <div
        className={`rounded-2xl px-4 py-2 shadow-sm border ${isUser ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <Avatar size={16} className={isUser ? 'text-white/80' : 'text-slate-500'} />
          <div className={isUser ? 'text-white/80' : 'text-slate-600'}>
            {isUser ? 'You' : 'NexBot'}
          </div>
          {/* Thinking animation in header for AI messages */}
          {!isUser && status === 'thinking' && (
            <div className="inline-flex items-center gap-1 ml-2">
              <span
                className="h-1.5 w-1.5 rounded-full bg-violet-400 thinking-bounce shadow-sm [animation-delay:-0.2s]"
                style={{ boxShadow: '0 0 4px rgba(139,92,246,0.4)' }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-violet-400 thinking-bounce shadow-sm"
                style={{ boxShadow: '0 0 4px rgba(139,92,246,0.4)' }}
              />
            </div>
          )}
          {meta && <div className={isUser ? 'text-white/60' : 'text-slate-400'}>· {meta}</div>}
          <div className="ml-auto inline-flex items-center gap-1">
            {status === 'sent' && (
              <CheckCheck size={14} className={isUser ? 'text-white/80' : 'text-slate-400'} />
            )}
            {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
          </div>
        </div>
        {/* Only show content when not thinking */}
        {status !== 'thinking' && (
          <div className={`mt-0.5 whitespace-pre-wrap ${isUser ? '' : 'text-slate-900'}`}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
