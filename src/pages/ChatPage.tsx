import { useChatStore, processPrefillFromLanding } from '../store/chat';
import { MessageBubble } from '../components/molecules/MessageBubble';
import { Canvas } from '../components/organisms/Canvas';
import { Footer } from '../components/atoms/Footer';
import { Bot, SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ChatPage() {
  const { messages, input, setInput, sendWithCanvasUpdate, aiThinking, highlightId } =
    useChatStore();
  const endRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const inputAreaRef = useRef<HTMLFormElement | null>(null);
  
  // State for dynamic message area height
  const [messageAreaMaxHeight, setMessageAreaMaxHeight] = useState<string>('calc(100vh - 280px)');

  // Process prefill from landing page on mount
  useEffect(() => {
    processPrefillFromLanding();
  }, []);

  // Calculate dynamic message area height
  useEffect(() => {
    const calculateMessageAreaHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 60; // Header height
      const inputAreaHeight = inputAreaRef.current?.offsetHeight || 120; // Input area height
      const footerHeight = 50; // Footer height (from Footer component)
      const padding = 50; // Extra padding for safety
      
      const availableHeight = window.innerHeight - headerHeight - inputAreaHeight - footerHeight - padding;
      setMessageAreaMaxHeight(`${Math.max(200, availableHeight)}px`); // Minimum 200px
    };

    // Calculate on mount and resize
    calculateMessageAreaHeight();
    window.addEventListener('resize', calculateMessageAreaHeight);
    
    return () => window.removeEventListener('resize', calculateMessageAreaHeight);
  }, []);

  // Recalculate when input area changes (textarea grows)
  useEffect(() => {
    const calculateMessageAreaHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 60;
      const inputAreaHeight = inputAreaRef.current?.offsetHeight || 120;
      const footerHeight = 50;
      const padding = 50;
      
      const availableHeight = window.innerHeight - headerHeight - inputAreaHeight - footerHeight - padding;
      setMessageAreaMaxHeight(`${Math.max(200, availableHeight)}px`);
    };

    // Small delay to ensure DOM has updated after input change
    const timeoutId = setTimeout(calculateMessageAreaHeight, 10);
    return () => clearTimeout(timeoutId);
  }, [input]);

  // Auto-scroll to last message on mount and when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);
  
  // Initial scroll on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Auto-resize textarea and maintain scroll position
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    
    // Reset height to calculate new height
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 120); // Max height of 120px
    el.style.height = newHeight + 'px';
    
    // Keep last message visible as composer grows
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 10);
  }, [input]);

  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">
      {/* Chat header */}
      <header ref={headerRef} className="border-b bg-violet-600 text-white">
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
          {/* Messages container - Dynamic max-height with thin scrollbar */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 scrollbar-thin"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-busy={aiThinking}
            style={{ 
              scrollBehavior: 'smooth',
              maxHeight: messageAreaMaxHeight
            }}
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
          {/* Input area - Fixed at bottom */}
          <form
            ref={inputAreaRef}
            onSubmit={(e) => {
              e.preventDefault();
              sendWithCanvasUpdate();
            }}
            className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50"
          >
            <div className="flex items-end gap-3">
              <textarea
                data-testid="chat-input"
                aria-multiline="true"
                rows={1}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none overflow-y-auto min-h-[44px] max-h-[120px] scrollbar-invisible"
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
        <div className="h-full bg-gray-50 p-4" data-testid="canvas-container">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Canvas showControls={false} showJsonPanel={false} />
          </div>
        </div>
      </main>

      {/* Footer - Reusable Footer Atom */}
      <Footer className="border-t" />
    </div>
  );
}
