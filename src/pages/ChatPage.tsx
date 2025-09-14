import { useChatStore, processPrefillFromLanding } from '../store/chat';
import { Footer } from '../components/atoms/Footer';
import { ChatHeader } from '../components/molecules/ChatHeader';
import { ChatInput, type ChatInputRef } from '../components/molecules/ChatInput';
import { MessageArea } from '../components/organisms/MessageArea';
import { ScrollIndicator } from '../components/atoms/ScrollIndicator';
import { Button } from '../components/atoms/Button';
import { ThemeToggle } from '../components/atoms/ThemeToggle';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';

// Lazy load heavy Canvas component
const Canvas = lazy(() => import('../components/organisms/Canvas').then(module => ({ default: module.Canvas })));

// Canvas loading component
const CanvasLoader = () => (
  <div className="h-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading Canvas...</p>
    </div>
  </div>
);

export function ChatPage() {
  const { 
    messages, 
    input, 
    setInput, 
    sendWithCanvasUpdate, 
    aiThinking, 
    highlightId,
    handleCanvasChangeEvent,
    isCollectingFields 
  } = useChatStore();
  const headerRef = useRef<HTMLElement | null>(null);
  const chatInputRef = useRef<ChatInputRef | null>(null);
  
  
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

  // Handle canvas field changes - trigger intelligent acknowledgment
  const handleCanvasFieldChange = (values: {
    source?: Record<string, string | undefined>;
    destination?: Record<string, string | undefined>;
    transform?: Record<string, string | undefined>;
  }) => {
    // Only respond during active field collection
    if (!isCollectingFields) return;

    // Find which field was changed by comparing with current values
    // This is a simplified approach - in a real app you'd want more sophisticated change detection
    Object.entries(values).forEach(([nodeType, nodeValues]) => {
      if (nodeValues) {
        Object.entries(nodeValues).forEach(([fieldName, fieldValue]) => {
          if (fieldValue && fieldValue.trim() !== '') {
            // Create canvas change event for intelligent acknowledgment
            const canvasEvent = {
              type: 'field-updated' as const,
              nodeType: nodeType as 'source' | 'transform' | 'destination',
              changes: {
                fieldName,
                fieldValue
              },
              completionStatus: 'partial' as const // Will be determined by the intelligent system
            };
            
            handleCanvasChangeEvent(canvasEvent);
          }
        });
      }
    });
  };


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
      <main className="w-full min-h-0 overflow-hidden relative z-20">
        {/* Mobile: Vertical stack, Desktop: Horizontal grid */}
        <div className="h-full flex flex-col lg:grid lg:grid-cols-[40%_60%] lg:overflow-hidden">
          {/* Chat Section */}
          <div
            className="flex flex-col min-h-[50vh] lg:min-h-0 lg:h-full border-r-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 pb-14 lg:pb-0"
            data-testid="chat-interface"
          >
            {/* Message Area - Organism */}
            <MessageArea
              messages={messages}
              aiThinking={aiThinking}
              highlightId={highlightId}
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
          <div className="min-h-[150vh] lg:h-full bg-gray-50 dark:bg-slate-900 p-4 pb-14 lg:pb-4" data-testid="canvas-container">
            <div className="min-h-[130vh] lg:min-h-[400px] h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col overflow-hidden">
              <div className="lg:hidden mb-4 text-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Data Flow Canvas</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data flow visualization appears here</p>
              </div>
              <div className="flex-1 min-h-[120vh] lg:min-h-[300px] overflow-hidden">
                <div className="h-full w-full min-h-[120vh] lg:min-h-[300px]">
                  <Suspense fallback={<CanvasLoader />}>
                    <Canvas 
                      showControls={false} 
                      showJsonPanel={false}
                      onNodeValuesChange={handleCanvasFieldChange}
                    />
                  </Suspense>
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
