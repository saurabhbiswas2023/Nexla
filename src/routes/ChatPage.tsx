import { useChatStore, processPrefillFromLanding } from '../store/chat';
import { MessageBubble } from '../components/molecules/MessageBubble';
import { Canvas } from '../components/organisms/Canvas';
import { Footer } from '../components/atoms/Footer';
import { Bot, SendHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ChatPage() {
  const { messages, input, setInput, sendWithCanvasUpdate, aiThinking, highlightId } =
    useChatStore();
  const endRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  // Process prefill from landing page on mount
  useEffect(() => {
    processPrefillFromLanding();
  }, []);

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
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">
      {/* Chat header */}
      <header className="border-b bg-violet-600 text-white">
        <div className="w-full px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center">
            <Bot size={18} />
          </div>
          <div className="font-semibold">NexBot</div>
          <div className="ml-2 text-white/70 text-sm">How can I help you today?</div>
        </div>
      </header>

      {/* 40/60 content - Full screen */}
      <main className="w-full h-full overflow-hidden grid grid-cols-[40%_60%]">
        {/* Left: chat column (40%) */}
        <div
          className="flex flex-col h-full border-r border-gray-200 bg-white"
          data-testid="chat-interface"
        >
          <div
            className="flex-1 overflow-y-auto p-4 space-y-6"
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
              sendWithCanvasUpdate();
            }}
            className="p-4 border-t border-gray-200 bg-gray-50"
          >
            <div className="flex items-end gap-3">
              <textarea
                data-testid="chat-input"
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
                    sendWithCanvasUpdate();
                  }
                }}
              />
              <button
                type="submit"
                data-testid="send-button"
                className="rounded-2xl bg-violet-600 text-white px-4 py-3 font-semibold hover:bg-violet-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Send message"
              >
                <SendHorizontal size={20} />
                <span className="font-semibold">Send</span>
              </button>
            </div>
          </form>
        </div>
        {/* Right: canvas column (60%) */}
        <div className="h-full bg-gray-50" data-testid="canvas-container">
          <Canvas showControls={false} showJsonPanel={false} />
        </div>
      </main>

      {/* Footer - Reusable Footer Atom */}
      <Footer className="border-t" />
    </div>
  );
}
