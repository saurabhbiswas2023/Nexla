import { useChatStore, processPrefillFromLanding } from '../store/chat';
import { Canvas } from '../components/organisms/Canvas';
import { Footer } from '../components/atoms/Footer';
import { ChatHeader } from '../components/molecules/ChatHeader';
import { ChatInput, type ChatInputRef } from '../components/molecules/ChatInput';
import { MessageArea } from '../components/organisms/MessageArea';
import { ScrollIndicator } from '../components/atoms/ScrollIndicator';
import { Button } from '../components/atoms/Button';
import { ThemeToggle } from '../components/atoms/ThemeToggle';
import { useEffect, useRef, useState } from 'react';

export function ChatPage() {
  const { messages, input, setInput, sendWithCanvasUpdate, aiThinking, highlightId } =
    useChatStore();
  const headerRef = useRef<HTMLElement | null>(null);
  const chatInputRef = useRef<ChatInputRef | null>(null);
  
  // State for dynamic message area height
  const [messageAreaMaxHeight, setMessageAreaMaxHeight] = useState<string>('calc(100vh - 280px)');
  
  // State for showing back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Process prefill from landing page on mount
  useEffect(() => {
    processPrefillFromLanding();
  }, []);

  // Auto-focus input after AI responses complete
  useEffect(() => {
    if (!aiThinking && messages.length > 1) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [aiThinking, messages.length]);

  // Calculate dynamic message area height
  useEffect(() => {
    const calculateMessageAreaHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 60; // Header height
      const inputAreaHeight = 120; // Fixed input area height estimate
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
      const inputAreaHeight = 120; // Fixed input area height estimate
      const footerHeight = 50;
      const padding = 50;
      
      const availableHeight = window.innerHeight - headerHeight - inputAreaHeight - footerHeight - padding;
      setMessageAreaMaxHeight(`${Math.max(200, availableHeight)}px`);
    };

    // Small delay to ensure DOM has updated after input change
    const timeoutId = setTimeout(calculateMessageAreaHeight, 10);
    return () => clearTimeout(timeoutId);
  }, [input]);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user has scrolled down more than one viewport height
      setShowBackToTop(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-screen grid grid-rows-[auto_1fr_auto] lg:h-screen lg:overflow-hidden relative bg-white dark:bg-slate-900">
      {/* Theme Toggle - Top Right */}
      <ThemeToggle className="fixed top-4 right-4 z-30" size="md" />
      {/* Chat Header - Molecule */}
      <div className="relative z-20">
        <ChatHeader 
          ref={headerRef}
          botName="NexBot"
          statusMessage="How can I help you today?"
        />
      </div>

      {/* Mobile-first responsive content */}
      <main className="w-full h-full overflow-hidden relative z-20">
        {/* Mobile: Vertical stack, Desktop: Horizontal grid */}
        <div className="h-full flex flex-col lg:grid lg:grid-cols-[40%_60%] lg:overflow-hidden">
          {/* Chat Section */}
          <div
            className="flex flex-col h-screen lg:h-full border-r-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800"
            data-testid="chat-interface"
          >
            {/* Message Area - Organism */}
            <MessageArea
              messages={messages}
              aiThinking={aiThinking}
              highlightId={highlightId}
              maxHeight={messageAreaMaxHeight}
            />
            
            {/* Chat Input - Molecule */}
            <ChatInput
              ref={chatInputRef}
              value={input}
              onChange={setInput}
              onSubmit={sendWithCanvasUpdate}
              placeholder="Describe your data flow…"
              disabled={aiThinking}
            />
            
            {/* Scroll Indicator - Mobile Only */}
            <ScrollIndicator
              text="Scroll down to see canvas"
              className="lg:hidden"
              visible={messages.length > 0}
            />
          </div>
          
          {/* Canvas Section - Scrollable on mobile, fixed on desktop */}
          <div className="h-screen lg:h-full bg-gray-50 dark:bg-slate-900 p-4" data-testid="canvas-container">
            <div className="h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col overflow-hidden">
              <div className="lg:hidden mb-4 text-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Data Flow Canvas</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data flow visualization appears here</p>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full w-full">
                  <Canvas showControls={false} showJsonPanel={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Reusable Footer Atom */}
      <div className="relative z-20">
        <Footer className="border-t" />
      </div>
      
      {/* Back to Top Button - Mobile Only */}
      <Button
        variant="floating"
        position="fixed-bottom-right"
        icon="chevron-up"
        visible={showBackToTop}
        className="lg:hidden"
        onClick={() => setShowBackToTop(false)}
      >
        Back to Chat
      </Button>
    </div>
  );
}
