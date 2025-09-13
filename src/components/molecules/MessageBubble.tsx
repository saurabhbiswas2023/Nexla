import { Bot, User as UserIcon, CheckCheck, AlertCircle, Loader } from 'lucide-react';

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
      className={`${isUser ? 'ml-auto max-w-[90%]' : 'max-w-[80%]'} w-full ${highlight ? 'ring-2 ring-violet-300 rounded-2xl transition-[box-shadow] duration-700' : ''}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 shadow-sm border ${isUser ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <Avatar size={16} className={isUser ? 'text-white/80' : 'text-slate-500'} />
          <div className={isUser ? 'text-white/80' : 'text-slate-600'}>
            {isUser ? 'You' : 'NexBot'}
          </div>
          {meta && <div className={isUser ? 'text-white/60' : 'text-slate-400'}>· {meta}</div>}
          <div className="ml-auto inline-flex items-center gap-1">
            {status === 'thinking' && (
              <Loader
                size={14}
                className={isUser ? 'animate-spin text-white/80' : 'animate-spin text-slate-400'}
              />
            )}
            {status === 'sent' && (
              <CheckCheck size={14} className={isUser ? 'text-white/80' : 'text-slate-400'} />
            )}
            {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
          </div>
        </div>
        <div className={`mt-1 whitespace-pre-wrap ${isUser ? '' : 'text-slate-900'}`}>
          {status === 'thinking' ? (
            <span className="inline-flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-slate-400'} animate-bounce [animation-delay:-0.2s]`}
              />
              <span
                className={`h-2 w-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-slate-400'} animate-bounce [animation-delay:-0.1s]`}
              />
              <span
                className={`h-2 w-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-slate-400'} animate-bounce`}
              />
            </span>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
