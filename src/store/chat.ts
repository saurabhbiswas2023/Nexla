import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { parseFlowWithLLM } from '../lib/openRouterService';
import { useCanvasStore } from './canvasStore';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
};

type ChatState = {
  messages: Message[];
  input: string;
  conversationHistory: string[];
  setInput: (v: string) => void;
  send: () => void;
  sendWithCanvasUpdate: () => void;
  clearMessages: () => void;
  aiThinking: boolean;
  highlightId: string | null;
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [
        {
          id: 'm1',
          type: 'ai',
          content:
            'Welcome! I can help you build data integration flows. What systems would you like to connect?',
          status: 'sent',
          createdAt: Date.now(),
        },
      ],
      input: '',
      conversationHistory: [],
      setInput: (v) => set({ input: v }),
      aiThinking: false,
      highlightId: null,

      // Basic send method (legacy)
      send: () => {
        const { input, messages } = get();
        if (!input.trim()) return;
        const userId = crypto.randomUUID();
        const aiId = crypto.randomUUID();
        const userMsg: Message = {
          id: userId,
          type: 'user',
          content: input.trim(),
          status: 'sent',
          createdAt: Date.now(),
        };
        const thinking: Message = {
          id: aiId,
          type: 'ai',
          content: '',
          status: 'thinking',
          createdAt: Date.now(),
        };
        set({
          messages: [...messages, userMsg, thinking],
          input: '',
          aiThinking: true,
          highlightId: userId,
        });
        // Clear highlight shortly after to create a flash effect
        setTimeout(() => set({ highlightId: null }), 900);
        // Simulate AI completion
        setTimeout(() => {
          const finalText =
            'Got it. I will start a draft flow: [Source] → [Transform] → [Destination].';
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiId ? { ...m, content: finalText, status: 'sent' } : m
            ),
            aiThinking: false,
          }));
        }, 600);
      },

      // Enhanced send method with LLM integration and canvas updates
      sendWithCanvasUpdate: async () => {
        const { input, messages, conversationHistory } = get();
        if (!input.trim()) return;

        const userId = crypto.randomUUID();
        const aiId = crypto.randomUUID();
        const userMsg: Message = {
          id: userId,
          type: 'user',
          content: input.trim(),
          status: 'sent',
          createdAt: Date.now(),
        };
        const thinking: Message = {
          id: aiId,
          type: 'ai',
          content: '',
          status: 'thinking',
          createdAt: Date.now(),
        };

        set({
          messages: [...messages, userMsg, thinking],
          input: '',
          aiThinking: true,
          highlightId: userId,
        });

        // Clear highlight shortly after to create a flash effect
        setTimeout(() => set({ highlightId: null }), 900);

        try {
          // Parse the user input with LLM
          const result = await parseFlowWithLLM(input.trim(), conversationHistory);

          if (result.success && result.data) {
            const canvasStore = useCanvasStore.getState();

            // Check if we have a complete flow (source, transform, destination)
            if (result.data.source && result.data.transform && result.data.destination) {
              // Update all nodes at once for complete flow
              canvasStore.loadConfiguration({
                selectedSource: result.data.source,
                selectedTransform: result.data.transform,
                selectedDestination: result.data.destination,
              });

              // Update credentials if provided
              if (result.data.credentials) {
                Object.entries(result.data.credentials).forEach(([nodeType, creds]) => {
                  if (
                    nodeType === 'source' ||
                    nodeType === 'transform' ||
                    nodeType === 'destination'
                  ) {
                    canvasStore.updateNodeConfiguration(
                      nodeType as 'source' | 'transform' | 'destination',
                      nodeType,
                      creds as Record<string, string | undefined>
                    );
                  }
                });
              }
            } else {
              // Update individual nodes as they're identified
              if (result.data.source) {
                canvasStore.loadConfiguration({ selectedSource: result.data.source });
              }
              if (result.data.destination) {
                canvasStore.loadConfiguration({ selectedDestination: result.data.destination });
              }
              if (result.data.transform) {
                canvasStore.loadConfiguration({ selectedTransform: result.data.transform });
              }
              // Note: We don't automatically set a default transform anymore
              // The transform should remain "Dummy Transform" until explicitly mentioned
            }

            // Update conversation history
            const newHistory = [...conversationHistory, input.trim()];

            // Generate AI response
            const aiResponse =
              result.data.followUpQuestion ||
              "Great! I've updated your flow. What would you like to configure next?";

            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiId ? { ...m, content: aiResponse, status: 'sent' } : m
              ),
              aiThinking: false,
              conversationHistory: newHistory,
            }));
          } else {
            throw new Error(result.error || 'Failed to parse flow');
          }
        } catch (error) {
          console.error('Error in sendWithCanvasUpdate:', error);

          // Fallback response
          const errorResponse =
            "I'm having trouble understanding that. Could you please rephrase your request?";

          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiId ? { ...m, content: errorResponse, status: 'sent' } : m
            ),
            aiThinking: false,
          }));
        }
      },

      clearMessages: () =>
        set({
          messages: [
            {
              id: 'm1',
              type: 'ai',
              content:
                'Welcome! I can help you build data integration flows. What systems would you like to connect?',
              status: 'sent',
              createdAt: Date.now(),
            },
          ],
          conversationHistory: [],
          highlightId: null,
        }),
    }),
    { name: 'chat-store' }
  )
);

// Exported function to process prefill from landing page
export const processPrefillFromLanding = () => {
  if (typeof window === 'undefined') return;

  const prefill = localStorage.getItem('prefillPrompt');
  if (!prefill) return;

  console.log('🔄 Processing prefill from landing:', prefill);

  const userId = crypto.randomUUID();
  const aiId = crypto.randomUUID();

  // Replace messages entirely (don't append to existing messages)
  useChatStore.setState({
    messages: [
      {
        id: 'm1',
        type: 'ai',
        content:
          'Welcome! I can help you build data integration flows. What systems would you like to connect?',
        status: 'sent',
        createdAt: Date.now(),
      },
      { id: userId, type: 'user', content: prefill, status: 'sent', createdAt: Date.now() },
    ],
    input: '', // Don't set input to prefill to avoid duplicate
    conversationHistory: [],
    highlightId: userId, // Highlight the user message
    aiThinking: true, // Show AI thinking
  });

  // Process the prefill with the enhanced chatbot
  setTimeout(() => {
    const store = useChatStore.getState();
    console.log('🔄 Executing prefill timeout for:', prefill);

    // Set input and send - this will create the AI response
    store.setInput(prefill);
    store.sendWithCanvasUpdate();
  }, 500); // Reduced timeout for faster response

  // Clear the prefill after processing
  localStorage.removeItem('prefillPrompt');
};
