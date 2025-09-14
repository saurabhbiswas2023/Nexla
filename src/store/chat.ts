import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { parseFlowWithLLM } from '../lib/openRouterService';
import { useCanvasStore } from './canvasStore';
import { 
  FieldCollectionOrchestrator, 
  type CollectionState,
  analyzeCanvasForCollection 
} from '../lib/fieldCollectionService';
import { logger } from '../lib/logger';

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
  isProcessingLLM: boolean;
  
  // Field Collection State
  fieldCollectionState: CollectionState | null;
  isCollectingFields: boolean;
  
  // Field Collection Methods
  startSmartCollection: () => void;
  processCollectionInput: (input: string) => void;
  completeFieldCollection: () => void;
  skipFieldCollection: () => void;
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
      isProcessingLLM: false,
      
      // Field Collection State
      fieldCollectionState: null,
      isCollectingFields: false,

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
        const { input, messages, conversationHistory, isCollectingFields } = get();
        if (!input.trim()) return;

        // If we're in field collection mode, handle it differently
        if (isCollectingFields) {
          const userId = crypto.randomUUID();
          const userMsg: Message = {
            id: userId,
            type: 'user',
            content: input.trim(),
            status: 'sent',
            createdAt: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, userMsg],
            input: '',
            highlightId: userId,
          }));

          // Clear highlight shortly after
          setTimeout(() => set({ highlightId: null }), 900);

          // Process the field collection input
          get().processCollectionInput(input.trim());
          return;
        }

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
          isProcessingLLM: true,
        });

        // Clear highlight shortly after to create a flash effect
        setTimeout(() => set({ highlightId: null }), 900);

        try {
          // Parse the user input with LLM
          const result = await parseFlowWithLLM(input.trim(), conversationHistory);

          if (result.success && result.data) {
            const canvasStore = useCanvasStore.getState();


            // Prepare batched update object (all changes in memory, no renders yet)
            const batchedUpdates: {
              source?: { name: string; credentials?: Record<string, string | undefined> };
              destination?: { name: string; credentials?: Record<string, string | undefined> };
              transform?: { name: string; credentials?: Record<string, string | undefined> };
            } = {};

            // Collect source updates
            if (result.data.source) {
              batchedUpdates.source = {
                name: result.data.source,
                credentials: result.data.credentials?.source as Record<string, string | undefined> | undefined,
              };
            }

            // Collect destination updates
            if (result.data.destination) {
              batchedUpdates.destination = {
                name: result.data.destination,
                credentials: result.data.credentials?.destination as Record<string, string | undefined> | undefined,
              };
            }

            // Collect transform updates
            if (result.data.transform) {
              batchedUpdates.transform = {
                name: result.data.transform,
                credentials: result.data.credentials?.transform as Record<string, string | undefined> | undefined,
              };
            }

            // Single atomic canvas update - only one render!
            if (Object.keys(batchedUpdates).length > 0) {
              canvasStore.batchUpdateCanvas(batchedUpdates);
            }

            // Update conversation history
            const newHistory = [...conversationHistory, input.trim()];

            // Check if we should start field collection
            const updatedCanvasState = useCanvasStore.getState();
            const analysis = analyzeCanvasForCollection(updatedCanvasState);
            
            if (analysis.totalStepsNeeded > 0) {
              // Start field collection instead of generic response
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === aiId ? { ...m, content: "Perfect! I've identified your systems. Now let's configure the connections.", status: 'sent' } : m
                ),
                aiThinking: false,
                isProcessingLLM: false,
                conversationHistory: newHistory,
              }));

              // Start field collection after a brief delay
              setTimeout(() => {
                get().startSmartCollection();
              }, 500);
            } else {
              // Generate standard AI response
              const aiResponse =
                result.data.followUpQuestion ||
                "Great! I've updated your flow. What would you like to configure next?";

              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === aiId ? { ...m, content: aiResponse, status: 'sent' } : m
                ),
                aiThinking: false,
                isProcessingLLM: false,
                conversationHistory: newHistory,
              }));
            }
          } else {
            throw new Error(result.error || 'Failed to parse flow');
          }
        } catch (error) {
          logger.error('Error in sendWithCanvasUpdate', error, 'chat-store');

          // Fallback response
          const errorResponse =
            "I'm having trouble understanding that. Could you please rephrase your request?";

          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiId ? { ...m, content: errorResponse, status: 'sent' } : m
            ),
            aiThinking: false,
            isProcessingLLM: false,
          }));
        }
      },

      // Field Collection Methods
      startSmartCollection: () => {
        const canvasState = useCanvasStore.getState();
        const analysis = analyzeCanvasForCollection(canvasState);
        
        if (analysis.totalStepsNeeded === 0) {
          return;
        }

        const collectionState = FieldCollectionOrchestrator.createCollectionPlan(canvasState);
        
        if (collectionState.currentStep) {
          const aiId = crypto.randomUUID();
          const aiMessage: Message = {
            id: aiId,
            type: 'ai',
            content: collectionState.currentStep.question,
            status: 'sent',
            createdAt: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, aiMessage],
            fieldCollectionState: collectionState,
            isCollectingFields: true,
          }));

        }
      },

      processCollectionInput: (input: string) => {
        const { fieldCollectionState } = get();
        
        if (!fieldCollectionState?.currentStep) {
      logger.warn('No active collection step', undefined, 'field-collection');
          return;
        }

        const canvasStore = useCanvasStore.getState();
        const result = FieldCollectionOrchestrator.processInput(input, fieldCollectionState.currentStep);
        
        if (!result.success) {
          // Show error message
          const aiId = crypto.randomUUID();
          const errorMessage: Message = {
            id: aiId,
            type: 'ai',
            content: result.error || 'Please provide a valid input.',
            status: 'sent',
            createdAt: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, errorMessage],
          }));
          return;
        }

        // Handle skipped fields
        if (result.wasSkipped) {
          
          // Add confirmation message for skipped field
          const aiId = crypto.randomUUID();
          const skipMessage: Message = {
            id: aiId,
            type: 'ai',
            content: `Okay, I'll skip the ${fieldCollectionState.currentStep.currentField} field.`,
            status: 'sent',
            createdAt: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, skipMessage],
          }));
        }

        // Apply canvas update (only if not skipped)
        if (result.canvasUpdate) {
          const { nodeType, updateType, nodeName, fieldName, fieldValue } = result.canvasUpdate;
          
          if (updateType === 'node-name' && nodeName) {
            // Update node name in canvas
            if (nodeType === 'source') {
              canvasStore.setSelectedSource(nodeName);
            } else if (nodeType === 'transform') {
              canvasStore.setSelectedTransform(nodeName);
            } else if (nodeType === 'destination') {
              canvasStore.setSelectedDestination(nodeName);
            }
            
          } else if (updateType === 'field-value' && fieldName && fieldValue) {
            // Update field value in canvas
            if (nodeType === 'transform') {
              // For transforms, update both general transform values and type-specific values
              const currentTransformValues = canvasStore.nodeValues.transform || {};
              canvasStore.updateNodeValues({
                transform: {
                  ...currentTransformValues,
                  [fieldName]: fieldValue
                }
              });
              
              // Also update transform-specific values by type
              const currentTransformName = canvasStore.selectedTransform;
              if (currentTransformName) {
                canvasStore.updateTransformValuesByType(currentTransformName, {
                  [fieldName]: fieldValue
                });
              }
            } else {
              // For source/destination, use regular update
              const currentValues = canvasStore.nodeValues[nodeType] || {};
              canvasStore.updateNodeValues({
                [nodeType]: {
                  ...currentValues,
                  [fieldName]: fieldValue
                }
              });
            }
          }
        }

        // Get next step
        const updatedCanvasState = useCanvasStore.getState();
        const nextStep = FieldCollectionOrchestrator.getNextStep(fieldCollectionState, updatedCanvasState);
        
        if (nextStep) {
          // Check if we're transitioning to a new node
          const currentNodeType = fieldCollectionState.currentStep.nodeType;
          const nextNodeType = nextStep.nodeType;
          const isNodeTransition = currentNodeType !== nextNodeType;
          
          const aiId = crypto.randomUUID();
          let messageContent = nextStep.question;
          
          // Add node completion message if transitioning
          if (isNodeTransition) {
            const nodeTypeNames = {
              source: 'source system',
              transform: 'transformation',
              destination: 'destination system'
            };
            
            const completedNodeName = nodeTypeNames[currentNodeType];
            const nextNodeName = nodeTypeNames[nextNodeType];
            
            messageContent = `Great! Your ${completedNodeName} is fully configured. Now let's set up your ${nextNodeName}.\n\n${nextStep.question}`;
          }
          
          const nextMessage: Message = {
            id: aiId,
            type: 'ai',
            content: messageContent,
            status: 'sent',
            createdAt: Date.now(),
          };

          const updatedCollectionState: CollectionState = {
            ...fieldCollectionState,
            currentStep: nextStep,
            completedSteps: [...fieldCollectionState.completedSteps, fieldCollectionState.currentStep]
          };

          set((state) => ({
            messages: [...state.messages, nextMessage],
            fieldCollectionState: updatedCollectionState,
          }));

        } else {
          // Collection complete
          get().completeFieldCollection();
        }
      },

      completeFieldCollection: () => {
        const aiId = crypto.randomUUID();
        const completionMessage: Message = {
          id: aiId,
          type: 'ai',
          content: 'Perfect! Your data flow is now fully configured. You can see all the connections and credentials in the canvas. Is there anything else you\'d like to adjust?',
          status: 'sent',
          createdAt: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, completionMessage],
          fieldCollectionState: null,
          isCollectingFields: false,
        }));

      },

      skipFieldCollection: () => {
        set({
          fieldCollectionState: null,
          isCollectingFields: false,
        });

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
          fieldCollectionState: null,
          isCollectingFields: false,
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


  // Canvas state will be updated by LLM response if needed

  // Replace messages entirely with just the welcome message
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
    ],
    input: prefill, // Set the input to prefill
    conversationHistory: [],
    highlightId: null,
    aiThinking: false,
    isProcessingLLM: false,
  });

  // Process the prefill with the enhanced chatbot
  setTimeout(() => {
    const store = useChatStore.getState();

    // Send the prefill - this will create both user message and AI response
    store.sendWithCanvasUpdate();
  }, 100); // Very short timeout just to ensure state is set

  // Clear the prefill after processing
  localStorage.removeItem('prefillPrompt');
};
