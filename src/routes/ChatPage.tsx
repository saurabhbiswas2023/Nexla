import { useChatStore } from '../store/chat';
import { MessageBubble } from '../components/molecules/MessageBubble';
import { FlowCanvasRF } from '../components/organisms/FlowCanvasRF';
import { Bot, SendHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ChatPage() {
  const { messages, input, setInput, send, aiThinking, highlightId } = useChatStore();
  const endRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to last message on mount and when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, []);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    // keep last message visible as composer grows
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [input]);

  return (
    <div className="h-screen grid grid-rows-[auto_1fr_auto]">
      {/* Chat header */}
      <header className="border-b bg-violet-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center">
            <Bot size={18} />
          </div>
          <div className="font-semibold">NexBot</div>
          <div className="ml-2 text-white/70 text-sm">How can I help you today?</div>
        </div>
      </header>

      {/* 50/50 content */}
      <main className="mx-auto max-w-7xl w-full px-4 overflow-hidden py-4 grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left: chat column with composer inside */}
        <div className="flex flex-col min-h-0">
          <div
            className="flex-1 overflow-y-auto pr-2 space-y-6"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-busy={aiThinking}
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                type={m.type}
                content={m.content}
                status={m.status}
                createdAt={m.createdAt}
                highlight={m.id === highlightId}
              />
            ))}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="mt-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <textarea
                  aria-multiline="true"
                  rows={1}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none overflow-hidden min-h-[44px]"
                  placeholder="Describe your data flow…"
                  value={input}
                  ref={composerRef}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-violet-200">
                <SendHorizontal size={16} />
                <span className="font-semibold">Send</span>
              </button>
            </div>
          </form>
        </div>
        {/* Right: canvas column */}
        <div className="min-h-0">
          <FlowCanvasRF nodes={[]} links={[]} />
        </div>
      </main>
    </div>
  );
}
