import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { parseFlowWithLLM, detectUserIntent, type FlowParseResult } from '../lib/openRouterService';
import { useCanvasStore } from './canvasStore';
import { connectorCatalog } from '../lib/connectorCatalog';
import { 
  FieldCollectionOrchestrator, 
  type CollectionState,
  analyzeCanvasForCollection 
} from '../lib/fieldCollectionService';
import { logger } from '../lib/logger';
import { useProgressStore } from './progressStore';
import { 
  generateAcknowledgment,
  analyzeUserBehavior,
  getNextBestQuestion,
  handleCanvasChange,
  determineAcknowledmentType,
  analyzeCompletionGaps,
  type AcknowledmentContext,
  type CanvasChangeEvent
} from '../lib/intelligentAcknowledgment';

// Removed complex regex-based detection functions - now using LLM-based intent detection

/**
 * FALLBACK: Detect obvious patterns when LLM fails
 */
function detectPatternFallback(input: string): { source?: string; destination?: string; transform?: string } | null {
  
  // PATTERN 1: "Source = X, Transform = Y, Destination = Z" format
  const structuredMatch = /source\s*=\s*([^,]+).*?(?:transform|transformation)\s*=\s*([^,]+).*?destination\s*=\s*([^,]+)/i.exec(input);
  if (structuredMatch) {
    const sourceText = structuredMatch[1].trim();
    const transformText = structuredMatch[2].trim();
    const destinationText = structuredMatch[3].trim();
    
    // Map source patterns
    let detectedSource: string | undefined;
    if (/stripe/i.test(sourceText)) detectedSource = 'Stripe';
    else if (/shopify/i.test(sourceText)) detectedSource = 'Shopify';
    else if (/salesforce/i.test(sourceText)) detectedSource = 'Salesforce';
    else if (/postgresql|postgres/i.test(sourceText)) detectedSource = 'PostgreSQL';
    else if (/mysql/i.test(sourceText)) detectedSource = 'MySQL';
    else if (/bigquery/i.test(sourceText)) detectedSource = 'Google BigQuery';
    else if (/snowflake/i.test(sourceText)) detectedSource = 'Snowflake';
    
    // Map destination patterns
    let detectedDestination: string | undefined;
    if (/bigquery/i.test(destinationText)) detectedDestination = 'Google BigQuery';
    else if (/snowflake/i.test(destinationText)) detectedDestination = 'Snowflake';
    else if (/webhook/i.test(destinationText)) detectedDestination = 'Webhook';
    else if (/postgresql|postgres/i.test(destinationText)) detectedDestination = 'PostgreSQL';
    else if (/mysql/i.test(destinationText)) detectedDestination = 'MySQL';
    
    // Map transform patterns
    let detectedTransform: string | undefined;
    if (/data\s+analysis|analyze/i.test(transformText)) detectedTransform = 'Data Analysis';
    else if (/cleanse|clean|format/i.test(transformText)) detectedTransform = 'Cleanse';
    else if (/map.*validate|validate.*map/i.test(transformText)) detectedTransform = 'Map & Validate';
    else if (/enrich.*map|map.*enrich/i.test(transformText)) detectedTransform = 'Enrich & Map';
    
    if (detectedSource || detectedDestination || detectedTransform) {
      return {
        source: detectedSource,
        destination: detectedDestination,
        transform: detectedTransform
      };
    }
  }
  
  // PATTERN 2: "Analyze X in Y" - X is source, Y is destination, transform is analysis
  const analyzeMatch = /analyze\s+(.+?)\s+(?:in|into|using)\s+(.+)/i.exec(input);
  if (analyzeMatch) {
    const sourceText = analyzeMatch[1].trim();
    const destinationText = analyzeMatch[2].trim();
    
    // Map common source patterns
    let detectedSource: string | undefined;
    if (/stripe/i.test(sourceText)) detectedSource = 'Stripe';
    else if (/shopify/i.test(sourceText)) detectedSource = 'Shopify';
    else if (/salesforce/i.test(sourceText)) detectedSource = 'Salesforce';
    else if (/postgresql|postgres/i.test(sourceText)) detectedSource = 'PostgreSQL';
    
    // Map common destination patterns  
    let detectedDestination: string | undefined;
    if (/google\s+sheets/i.test(destinationText)) detectedDestination = 'Google BigQuery'; // Use BigQuery as sheets alternative
    else if (/bigquery/i.test(destinationText)) detectedDestination = 'Google BigQuery';
    else if (/snowflake/i.test(destinationText)) detectedDestination = 'Snowflake';
    else if (/analytics/i.test(destinationText)) detectedDestination = 'Google Analytics';
    
    if (detectedSource && detectedDestination) {
      return {
        source: detectedSource,
        destination: detectedDestination,
        transform: 'Data Analysis'
      };
    }
  }
  
  // Don't use webhook fallback if email services are explicitly mentioned
  const emailServicePatterns = [
    /sendgrid/i,
    /mailchimp/i,
    /email/i,
    /mail/i,
    /smtp/i
  ];
  
  if (emailServicePatterns.some(pattern => pattern.test(input))) {
    return null; // Let LLM handle email services
  }
  
  // Webhook patterns
  const webhookPatterns = [
    /webhook/i,
    /web hook/i,
    /http endpoint/i,
    /rest endpoint/i,
    /api endpoint/i
  ];
  
  const hasWebhook = webhookPatterns.some(pattern => pattern.test(input));
  if (!hasWebhook) return null;
  
  // Source detection patterns
  const sourcePatterns = [
    { pattern: /get\s+(\w+)\s+/i, connector: 'PostgreSQL' },
    { pattern: /from\s+(\w+)/i, connector: 'PostgreSQL' },
    { pattern: /postgresql|postgres/i, connector: 'PostgreSQL' },
    { pattern: /mysql/i, connector: 'MySQL' },
    { pattern: /salesforce/i, connector: 'Salesforce' },
    { pattern: /shopify/i, connector: 'Shopify' },
    { pattern: /bigquery/i, connector: 'Google BigQuery' },
    { pattern: /snowflake/i, connector: 'Snowflake' }
  ];
  
  let detectedSource: string | undefined;
  let detectedDestination: string | undefined;
  
  // Detect source
  for (const { pattern, connector } of sourcePatterns) {
    if (pattern.test(input)) {
      detectedSource = connector;
      break;
    }
  }
  
  // If webhook is mentioned, check if it's likely the destination
  const toWebhookPatterns = [
    /send.*to.*webhook/i,
    /send.*webhook/i,
    /to.*webhook/i,
    /push.*to.*webhook/i,
    /post.*to.*webhook/i,
    /send.*to.*rest\s+endpoint/i,
    /send.*to.*http\s+endpoint/i,
    /to.*rest\s+endpoint/i,
    /to.*http\s+endpoint/i,
    /send.*to.*web\s+hook/i,
    /to.*web\s+hook/i,
    /destination.*webhook/i,
    /destination.*=.*webhook/i,
    /dest.*webhook/i
  ];
  
  if (toWebhookPatterns.some(pattern => pattern.test(input))) {
    detectedDestination = 'Webhook';
  }
  
  // Detect transformation patterns
  let detectedTransform: string | undefined;
  const transformPatterns = [
    { pattern: /format|cleanse|clean/i, transform: 'Cleanse' },
    { pattern: /map.*validate|validate.*map/i, transform: 'Map & Validate' },
    { pattern: /enrich.*map|map.*enrich/i, transform: 'Enrich & Map' },
    { pattern: /data\s+analysis|analyze/i, transform: 'Data Analysis' },
    { pattern: /transformation.*=.*cleanse/i, transform: 'Cleanse' },
    { pattern: /transform.*=.*cleanse/i, transform: 'Cleanse' }
  ];
  
  for (const { pattern, transform } of transformPatterns) {
    if (pattern.test(input)) {
      detectedTransform = transform;
      break;
    }
  }
  
  // Only return if we detected at least one connector
  if (detectedSource || detectedDestination || detectedTransform) {
    return {
      source: detectedSource,
      destination: detectedDestination,
      transform: detectedTransform
    };
  }
  
  return null;
}

/**
 * PRE-LLM: Detect if user input is a single connector name that needs role clarification
 * This runs BEFORE the LLM to catch obvious cases deterministically
 */
function detectSingleConnectorName(userInput: string): string | null {
  const input = userInput.toLowerCase().trim();
  
  // Skip if input has clear directional words
  const hasDirectionalWords = /\b(from|to|source|destination|connect\s+.*\s+to|sync\s+.*\s+to|get.*from|send.*to|as\s+(my\s+)?(source|destination))\b/i.test(input);
  if (hasDirectionalWords) return null;
  
  // Skip if input is too long (likely a sentence, not just a connector name)
  if (input.split(' ').length > 3) return null;
  
  // Check for exact or close matches with connector names
  const connectorNames = Object.keys(connectorCatalog);
  
  // First pass: exact matches (case insensitive)
  for (const connectorName of connectorNames) {
    if (input === connectorName.toLowerCase()) {
      return connectorName;
    }
  }
  
  // Second pass: partial matches (input contains connector or vice versa)
  for (const connectorName of connectorNames) {
    const connectorLower = connectorName.toLowerCase();
    
    // Check if input is a substring of connector name or vice versa
    if ((input.length >= 3 && connectorLower.includes(input)) || 
        (connectorLower.length >= 3 && input.includes(connectorLower))) {
      return connectorName;
    }
  }
  
  // Third pass: word-based matching for multi-word connectors
  const inputWords = input.split(/\s+/);
  for (const connectorName of connectorNames) {
    const connectorWords = connectorName.toLowerCase().split(/\s+/);
    
    // Check if all input words match connector words
    if (inputWords.every(word => 
      connectorWords.some(connectorWord => 
        connectorWord.includes(word) || word.includes(connectorWord)
      )
    )) {
      return connectorName;
    }
  }
  
  return null;
}

/**
 * POST-LLM: Fallback check to ensure we ask for role clarity when LLM doesn't
 * This catches cases that the pre-LLM check and LLM both missed
 */
function checkIfShouldAskForRoleClarity(
  llmResult: NonNullable<FlowParseResult['data']>, 
  userInput: string
): string | null {
  // If LLM already set needsRoleClarity, don't override
  if (llmResult.needsRoleClarity) return null;
  
  // If both source and destination are set, no clarity needed
  if (llmResult.source && llmResult.destination) return null;
  
  // If only one role is set and it's clear from context, no clarity needed
  if (llmResult.source || llmResult.destination) {
    // Check if the input has clear directional words
    const hasDirectionalWords = /\b(from|to|source|destination|connect\s+\w+\s+to|sync\s+\w+\s+to|get.*from|send.*to)\b/i.test(userInput);
    if (hasDirectionalWords) return null;
  }
  
  // Use the same detection logic as pre-LLM check
  return detectSingleConnectorName(userInput);
}

export type Message = {
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
  
  // Role Clarification State
  pendingRoleClarity: string | null; // Connector name waiting for role clarification
  
  // Field Collection Methods
  startSmartCollection: () => void;
  processCollectionInput: (input: string) => void;
  completeFieldCollection: () => void;
  skipFieldCollection: () => void;
  
  // Helper method for adding AI responses with thinking animation
  addAIResponseWithThinking: (content: string, additionalUpdates?: Record<string, unknown>) => void;
  
  // Intelligent acknowledgment methods
  handleCanvasChangeEvent: (event: CanvasChangeEvent) => void;
  generateIntelligentResponse: (context: AcknowledmentContext) => string;
  
  // Reset all chat data to initial state
  resetStore: () => void;
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
      
      // Role Clarification State
      pendingRoleClarity: null,

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
        const { input, messages, conversationHistory, isCollectingFields, pendingRoleClarity } = get();
        if (!input.trim()) return;

        // If we're waiting for role clarification, use LLM to understand intent
        if (pendingRoleClarity) {
          const userInput = input.trim();
          const userInputLower = userInput.toLowerCase();
          
          console.log('🔍 SIMPLE INTENT CHECK:', {
            userInput,
            pendingRoleClarity,
            userInputLower
          });
          
          // DEAD SIMPLE LOGIC FIRST - NO LLM BULLSHIT FOR OBVIOUS CASES
          
          // 1. COMPLEX ROLE + DESTINATION DETECTION
          // Handle cases like "source and I need to send data to postgres"
          if (userInputLower.includes('source') || userInputLower.includes('destination')) {
            console.log('🎯 ROLE DETECTED IN COMPLEX MESSAGE:', userInput);
            
            // Extract role
            const isSource = userInputLower.includes('source');
            const role = isSource ? 'source' : 'destination';
            
            // Check if user also mentions destination connector
            let destinationConnector = null;
            const destinationPatterns = [
              /(?:send|to|into|destination)\s+(?:data\s+)?(?:to\s+)?(\w+)/gi,
              /(?:and|then|also)\s+(?:send|to|into)\s+(?:data\s+)?(?:to\s+)?(\w+)/gi,
              /postgres|postgresql|bigquery|snowflake|salesforce|shopify/gi
            ];
            
            for (const pattern of destinationPatterns) {
              const matches = [...userInput.matchAll(pattern)];
              for (const match of matches) {
                const candidate = match[1] || match[0];
                if (candidate) {
                  // Find matching connector
                  const allConnectors = Object.keys(connectorCatalog);
                  const matchedConnector = allConnectors.find(connector => 
                    connector.toLowerCase().includes(candidate.toLowerCase()) ||
                    candidate.toLowerCase().includes(connector.toLowerCase())
                  );
                  if (matchedConnector) {
                    destinationConnector = matchedConnector;
                    break;
                  }
                }
              }
              if (destinationConnector) break;
            }
            
            console.log('🔍 Detected:', { role, destinationConnector });
            
            const userId = crypto.randomUUID();
            const userMsg: Message = {
              id: userId,
              type: 'user',
              content: userInput,
              status: 'sent',
              createdAt: Date.now(),
            };

            set((state) => ({
              messages: [...state.messages, userMsg],
              input: '',
              highlightId: userId,
            }));

            setTimeout(() => set({ highlightId: null }), 900);
            
            // Handle role selection
            const canvasStore = useCanvasStore.getState();
            
            if (role === 'source') {
              canvasStore.setSelectedSource(pendingRoleClarity);
              if (destinationConnector) {
                canvasStore.setSelectedDestination(destinationConnector);
              }
            } else {
              canvasStore.setSelectedDestination(pendingRoleClarity);
              if (destinationConnector) {
                canvasStore.setSelectedSource(destinationConnector);
              }
            }

            // Update progress
            const progressStore = useProgressStore.getState();
            const updatedCanvasState = useCanvasStore.getState();
            progressStore.calculateFromCanvasState({
              selectedSource: updatedCanvasState.selectedSource,
              selectedDestination: updatedCanvasState.selectedDestination,
              selectedTransform: updatedCanvasState.selectedTransform,
              nodeValues: updatedCanvasState.nodeValues,
              transformByType: {
                'Dummy Transform': {},
                'Map & Validate': {},
                'Cleanse': {},
                'Enrich & Map': updatedCanvasState.getTransformValuesByType('Enrich & Map'),
                'Data Analysis': updatedCanvasState.getTransformValuesByType('Data Analysis'),
              },
            });

            const aiId = crypto.randomUUID();
            let confirmationContent = `Perfect! I've set ${pendingRoleClarity} as your ${role}.`;
            
            if (destinationConnector) {
              confirmationContent += ` I also detected that you want to send data to ${destinationConnector}, so I've set that as your destination.`;
            }
            
            confirmationContent += ` Now let's configure the connections.`;
            
            const confirmationMessage: Message = {
              id: aiId,
              type: 'ai',
              content: confirmationContent,
              status: 'sent',
              createdAt: Date.now(),
            };

            set((state) => ({
              messages: [...state.messages, confirmationMessage],
              pendingRoleClarity: null,
            }));

            setTimeout(() => {
              get().startSmartCollection();
            }, 500);
            
            return;
          }
          
          // 2. SIMPLE CORRECTION DETECTION - "no its [connector]" OR "no its not"
          if (userInputLower.startsWith('no')) {
            console.log('🚨 REJECTION DETECTED - SIMPLE LOGIC');
            
            // Case 1: "no its [connector]" - user specifying new connector
            const correctionMatch = userInputLower.match(/no\s+it'?s\s+(.+)/);
            if (correctionMatch) {
              const suggestedConnector = correctionMatch[1].trim();
              
              // Skip if it's just "not" - handle separately
              if (suggestedConnector !== 'not') {
                console.log('🔍 Suggested connector:', suggestedConnector);
                
                // Find matching connector from catalog
                const allConnectors = Object.keys(connectorCatalog);
                const matchedConnector = allConnectors.find(connector => 
                  connector.toLowerCase().includes(suggestedConnector) ||
                  suggestedConnector.includes(connector.toLowerCase())
                );
                
                if (matchedConnector) {
                  console.log('✅ MATCHED CONNECTOR:', matchedConnector);
                  
                  const userId = crypto.randomUUID();
                  const userMsg: Message = {
                    id: userId,
                    type: 'user',
                    content: userInput,
                    status: 'sent',
                    createdAt: Date.now(),
                  };

                  const aiId = crypto.randomUUID();
                  const clarificationMsg: Message = {
                    id: aiId,
                    type: 'ai',
                    content: `Got it! Is ${matchedConnector} your source (where you get data from) or destination (where you send data to)?`,
                    status: 'sent',
                    createdAt: Date.now(),
                  };

                  set((state) => ({
                    messages: [...state.messages, userMsg, clarificationMsg],
                    input: '',
                    pendingRoleClarity: matchedConnector,
                    conversationHistory: [...conversationHistory, userInput],
                  }));
                  
                  return;
                }
              }
            }
            
            // Case 2: "no its not" or just "no" - ask what they meant
            if (userInputLower.includes('not') || userInputLower.trim() === 'no') {
              console.log('🤔 USER REJECTED - ASKING WHAT THEY MEANT');
              
              const userId = crypto.randomUUID();
              const userMsg: Message = {
                id: userId,
                type: 'user',
                content: userInput,
                status: 'sent',
                createdAt: Date.now(),
              };

              const aiId = crypto.randomUUID();
              const clarificationMsg: Message = {
                id: aiId,
                type: 'ai',
                content: `I understand that's not the right connector. What connector did you mean? Please tell me the name of the system you want to connect.`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, userMsg, clarificationMsg],
                input: '',
                // Keep pendingRoleClarity null so next input is treated as new connector
                pendingRoleClarity: null,
                conversationHistory: [...conversationHistory, userInput],
              }));
              
              return;
            }
          }
          
          // 3. ONLY NOW TRY LLM AS FALLBACK
          console.log('🤖 Trying LLM as fallback...');
          
          const fullContext = [
            ...conversationHistory,
            ...messages.slice(-4).map(m => m.content)
          ];
          
          try {
            const intent = await detectUserIntent(userInput, {
              pendingRoleClarity,
              conversationHistory: fullContext
            });
            
            console.log('🎯 Intent Detection Result:', intent);

            const userId = crypto.randomUUID();
            const userMsg: Message = {
              id: userId,
              type: 'user',
              content: userInput,
              status: 'sent',
              createdAt: Date.now(),
            };

            set((state) => ({
              messages: [...state.messages, userMsg],
              input: '',
              highlightId: userId,
            }));

            setTimeout(() => set({ highlightId: null }), 900);

            // CRITICAL FIX: Add simple fallback for basic role words if LLM fails
            const userInputLower = userInput.toLowerCase().trim();
            const isSimpleRole = userInputLower === 'source' || userInputLower === 'destination' || 
                               userInputLower === 'src' || userInputLower === 'dest';
            
            if (isSimpleRole && (!intent.intent || intent.intent !== 'role_clarification')) {
              console.log('🚨 LLM FAILED - Using fallback for simple role:', userInputLower);
              intent.intent = 'role_clarification';
              intent.role = userInputLower === 'source' || userInputLower === 'src' ? 'source' : 'destination';
              intent.confidence = 0.99;
            }

            if (intent.intent === 'connector_correction' && intent.connectorName) {
              // User wants to correct the connector name
              const aiId = crypto.randomUUID();
              const clarificationMsg: Message = {
                id: aiId,
                type: 'ai',
                content: `Got it! Is ${intent.connectorName} your source (where you get data from) or destination (where you send data to)?`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, clarificationMsg],
                pendingRoleClarity: intent.connectorName,
                conversationHistory: [...conversationHistory, userInput],
              }));

            } else if (intent.intent === 'role_clarification' && intent.role) {
              // User is specifying the role
              const canvasStore = useCanvasStore.getState();
              if (intent.role === 'source') {
                canvasStore.setSelectedSource(pendingRoleClarity);
              } else {
                canvasStore.setSelectedDestination(pendingRoleClarity);
              }

              // Update progress
              const progressStore = useProgressStore.getState();
              const updatedCanvasState = useCanvasStore.getState();
              progressStore.calculateFromCanvasState({
                selectedSource: updatedCanvasState.selectedSource,
                selectedDestination: updatedCanvasState.selectedDestination,
                selectedTransform: updatedCanvasState.selectedTransform,
                nodeValues: updatedCanvasState.nodeValues,
                transformByType: {
                  'Dummy Transform': {},
                  'Map & Validate': {},
                  'Cleanse': {},
                  'Enrich & Map': updatedCanvasState.getTransformValuesByType('Enrich & Map'),
                },
              });

              // Confirmation and start field collection
              const aiId = crypto.randomUUID();
              const confirmationMessage: Message = {
                id: aiId,
                type: 'ai',
                content: `Perfect! I've set ${pendingRoleClarity} as your ${intent.role}. Now let's configure the connections.`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, confirmationMessage],
                pendingRoleClarity: null,
              }));

              setTimeout(() => {
                get().startSmartCollection();
              }, 500);

            } else {
              // Unclear intent, ask for clarification
              const aiId = crypto.randomUUID();
              const clarificationMsg: Message = {
                id: aiId,
                type: 'ai',
                content: `Please specify if ${pendingRoleClarity} is your "source" (where you get data from) or "destination" (where you send data to).`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, clarificationMsg],
              }));
            }

            return;
          } catch (error) {
            console.error('🚨 LLM Intent Detection FAILED:', error);
            logger.error('Intent detection failed', error, 'chat-store');
            
            // Add user message first (CRITICAL - was missing!)
            const userId = crypto.randomUUID();
            const userMsg: Message = {
              id: userId,
              type: 'user',
              content: userInput,
              status: 'sent',
              createdAt: Date.now(),
            };

            set((state) => ({
              messages: [...state.messages, userMsg],
              input: '',
              highlightId: userId,
            }));

            setTimeout(() => set({ highlightId: null }), 900);
            
            // ROBUST FALLBACK: Handle common role words
            const userInputLower = userInput.toLowerCase().trim();
            const isSource = userInputLower === 'source' || userInputLower === 'src' || userInputLower.includes('source');
            const isDestination = userInputLower === 'destination' || userInputLower === 'dest' || userInputLower.includes('destination');
            
            if (isSource || isDestination) {
              console.log('✅ Using FALLBACK role detection:', isSource ? 'source' : 'destination');
              
              // Handle role selection with fallback logic
              const canvasStore = useCanvasStore.getState();
              if (isSource) {
                canvasStore.setSelectedSource(pendingRoleClarity);
              } else {
                canvasStore.setSelectedDestination(pendingRoleClarity);
              }

              // Update progress
              const progressStore = useProgressStore.getState();
              const updatedCanvasState = useCanvasStore.getState();
              progressStore.calculateFromCanvasState({
                selectedSource: updatedCanvasState.selectedSource,
                selectedDestination: updatedCanvasState.selectedDestination,
                selectedTransform: updatedCanvasState.selectedTransform,
                nodeValues: updatedCanvasState.nodeValues,
                transformByType: {
                  'Dummy Transform': {},
                  'Map & Validate': {},
                  'Cleanse': {},
                  'Enrich & Map': updatedCanvasState.getTransformValuesByType('Enrich & Map'),
                },
              });

              const aiId = crypto.randomUUID();
              const confirmationMessage: Message = {
                id: aiId,
                type: 'ai',
                content: `Perfect! I've set ${pendingRoleClarity} as your ${isSource ? 'source' : 'destination'}. Now let's configure the connections.`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, confirmationMessage],
                pendingRoleClarity: null,
              }));

              setTimeout(() => {
                get().startSmartCollection();
              }, 500);
            } else {
              // Ask for clarification
              const aiId = crypto.randomUUID();
              const clarificationMsg: Message = {
                id: aiId,
                type: 'ai',
                content: `Please specify if ${pendingRoleClarity} is your "source" or "destination".`,
                status: 'sent',
                createdAt: Date.now(),
              };

              set((state) => ({
                messages: [...state.messages, clarificationMsg],
              }));
            }
            return;
          }
        }

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

        // PRE-LLM CHECK: Detect single connector names before going to LLM
        const singleConnectorDetected = detectSingleConnectorName(input.trim());
        if (singleConnectorDetected) {
          const userId = crypto.randomUUID();
          const aiId = crypto.randomUUID();
          const userMsg: Message = {
            id: userId,
            type: 'user',
            content: input.trim(),
            status: 'sent',
            createdAt: Date.now(),
          };
          const clarificationMsg: Message = {
            id: aiId,
            type: 'ai',
            content: `Is ${singleConnectorDetected} your source (where you get data from) or destination (where you send data to)?`,
            status: 'sent',
            createdAt: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, userMsg, clarificationMsg],
            input: '',
            highlightId: userId,
            pendingRoleClarity: singleConnectorDetected,
            conversationHistory: [...conversationHistory, input.trim()],
          }));

          setTimeout(() => set({ highlightId: null }), 900);
          return; // Skip LLM entirely for single connector names
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
          // FALLBACK DETECTION: Handle obvious patterns before LLM
          const patternFallback = detectPatternFallback(input.trim());
          if (patternFallback) {
            console.log('🎯 PATTERN FALLBACK DETECTED:', patternFallback);
            
            // MINIMUM THINKING ANIMATION: Ensure at least 500ms of thinking animation
            const thinkingStartTime = Date.now();
            const minThinkingDuration = 500;
            
            // Apply pattern detection directly
            const canvasStore = useCanvasStore.getState();
            if (patternFallback.source) {
              canvasStore.setSelectedSource(patternFallback.source);
            }
            if (patternFallback.destination) {
              canvasStore.setSelectedDestination(patternFallback.destination);
            }
            if (patternFallback.transform) {
              canvasStore.setSelectedTransform(patternFallback.transform);
            }
            
            // Update conversation history
            const newHistory = [...conversationHistory, input.trim()];
            
            // Generate intelligent success response
            const userBehavior = analyzeUserBehavior(messages);
            const updatedCanvasState = useCanvasStore.getState();
            
            // Create a canvas change event for the pattern detection
            const canvasEvent: CanvasChangeEvent = {
              type: 'node-selected',
              nodeType: patternFallback.source ? 'source' : 
                       patternFallback.destination ? 'destination' : 'transform',
              changes: {
                nodeName: patternFallback.source || patternFallback.destination || patternFallback.transform
              },
              completionStatus: 'partial'
            };
            
            const successResponse = handleCanvasChange(canvasEvent, updatedCanvasState, userBehavior);

            // Calculate remaining thinking time
            const elapsedTime = Date.now() - thinkingStartTime;
            const remainingTime = Math.max(0, minThinkingDuration - elapsedTime);

            setTimeout(() => {
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === aiId ? { ...m, content: successResponse, status: 'sent' } : m
                ),
                aiThinking: false,
                isProcessingLLM: false,
                conversationHistory: newHistory,
              }));
              
              // Start field collection for the identified systems
              setTimeout(() => {
                const { startSmartCollection } = get();
                startSmartCollection();
              }, 500);
            }, remainingTime);
            
            return;
          }

          // MINIMUM THINKING ANIMATION: Ensure at least 500ms of thinking animation for LLM
          const thinkingStartTime = Date.now();
          const minThinkingDuration = 500;

          // Parse the user input with LLM
          const result = await parseFlowWithLLM(input.trim(), conversationHistory);
          
          // DEBUG: Log LLM response to see what it's actually returning
          console.log('🤖 LLM Response:', JSON.stringify(result, null, 2));

          // Calculate remaining thinking time
          const elapsedTime = Date.now() - thinkingStartTime;
          const remainingTime = Math.max(0, minThinkingDuration - elapsedTime);

          if (result.success && result.data) {
            const canvasStore = useCanvasStore.getState();

            // FALLBACK: Check if we should ask for role clarity even if LLM didn't set it
            const shouldAskForRoleClarity = checkIfShouldAskForRoleClarity(result.data, input.trim());
            
            // Handle role clarity needed - don't update canvas yet, just ask for clarification
            if (result.data.needsRoleClarity || shouldAskForRoleClarity) {
              const connectorName = result.data.needsRoleClarity || shouldAskForRoleClarity;
              // Update conversation history
              const newHistory = [...conversationHistory, input.trim()];
              
              // Generate role clarification response
              const clarificationResponse = result.data.followUpQuestion || 
                `Is ${connectorName} your source (where you get data from) or destination (where you send data to)?`;

              setTimeout(() => {
                set((s) => ({
                  messages: s.messages.map((m) =>
                    m.id === aiId ? { ...m, content: clarificationResponse, status: 'sent' } : m
                  ),
                  aiThinking: false,
                  isProcessingLLM: false,
                  conversationHistory: newHistory,
                  pendingRoleClarity: connectorName, // Store connector name waiting for role
                }));
              }, remainingTime);
              return; // Don't proceed with canvas updates
            }

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
              
              // Update progress after LLM canvas changes
              const progressStore = useProgressStore.getState();
              const updatedCanvasState = useCanvasStore.getState();
              progressStore.calculateFromCanvasState({
                selectedSource: updatedCanvasState.selectedSource,
                selectedDestination: updatedCanvasState.selectedDestination,
                selectedTransform: updatedCanvasState.selectedTransform,
                nodeValues: updatedCanvasState.nodeValues,
                transformByType: {
                  'Dummy Transform': {},
                  'Map & Validate': {},
                  'Cleanse': {},
                  'Enrich & Map': updatedCanvasState.getTransformValuesByType('Enrich & Map'),
                },
              });
            }

            // Update conversation history
            const newHistory = [...conversationHistory, input.trim()];

            // Check if we should start field collection
            const updatedCanvasState = useCanvasStore.getState();
            const analysis = analyzeCanvasForCollection(updatedCanvasState);
            
            if (analysis.totalStepsNeeded > 0) {
              // Start field collection instead of generic response
              setTimeout(() => {
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
              }, remainingTime);
            } else {
              // Generate standard AI response
              const aiResponse =
                result.data.followUpQuestion ||
                "Great! I've updated your flow. What would you like to configure next?";

              setTimeout(() => {
                set((s) => ({
                  messages: s.messages.map((m) =>
                    m.id === aiId ? { ...m, content: aiResponse, status: 'sent' } : m
                  ),
                  aiThinking: false,
                  isProcessingLLM: false,
                  conversationHistory: newHistory,
                }));
              }, remainingTime);
            }
          } else {
            throw new Error(result.error || 'Failed to parse flow');
          }
        } catch (error) {
          logger.error('Error in sendWithCanvasUpdate', error, 'chat-store');

          // Fallback response
          const errorResponse =
            "I'm having trouble understanding that. Could you please rephrase your request?";

          // Use the same minimum thinking duration for error responses
          const errorRemainingTime = Math.max(0, 500);
          
          setTimeout(() => {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiId ? { ...m, content: errorResponse, status: 'sent' } : m
              ),
              aiThinking: false,
              isProcessingLLM: false,
            }));
          }, errorRemainingTime);
        }
      },

      // Helper function to add thinking animation to any AI response
      addAIResponseWithThinking: (content: string, additionalUpdates?: Record<string, unknown>) => {
        console.log('🤖 addAIResponseWithThinking called with:', content.substring(0, 50) + '...');
        const aiId = crypto.randomUUID();
        
        // FIRST: Create thinking message
        const thinkingMessage: Message = {
          id: aiId,
          type: 'ai',
          content: '',
          status: 'thinking',
          createdAt: Date.now(),
        };

        console.log('💭 Adding thinking message with ID:', aiId);
        set((state) => ({
          messages: [...state.messages, thinkingMessage],
          aiThinking: true,
          ...additionalUpdates,
        }));

        // THEN: After 500ms minimum, show the actual response
        const thinkingStartTime = Date.now();
        const minThinkingDuration = 500;
        
        setTimeout(() => {
          const elapsedTime = Date.now() - thinkingStartTime;
          const remainingTime = Math.max(0, minThinkingDuration - elapsedTime);
          
          console.log(`⏱️ Elapsed: ${elapsedTime}ms, Remaining: ${remainingTime}ms`);
          
          setTimeout(() => {
            console.log('✅ Updating message to sent status');
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === aiId ? { 
                  ...m, 
                  content, 
                  status: 'sent' 
                } : m
              ),
              aiThinking: false,
            }));
          }, remainingTime);
        }, 0);
      },

      // Intelligent acknowledgment methods
      handleCanvasChangeEvent: (event: CanvasChangeEvent) => {
        const { isCollectingFields, messages } = get();
        
        // Only respond during active field collection
        if (!isCollectingFields) return;
        
        const canvasState = useCanvasStore.getState();
        const userBehavior = analyzeUserBehavior(messages);
        const response = handleCanvasChange(event, canvasState, userBehavior);
        
        get().addAIResponseWithThinking(response);
      },

      generateIntelligentResponse: (context: AcknowledmentContext) => {
        const acknowledgmentType = determineAcknowledmentType({
          type: 'field-updated',
          nodeType: context.nodeType,
          changes: {
            fieldName: context.fieldName,
            fieldValue: context.fieldValue
          },
          completionStatus: context.nodeProgress.percentage === 100 ? 'complete' : 'partial'
        });
        
        return generateAcknowledgment(acknowledgmentType, context);
      },

      // Field Collection Methods
      startSmartCollection: () => {
        console.log('🚀 startSmartCollection called');
        const canvasState = useCanvasStore.getState();
        const analysis = analyzeCanvasForCollection(canvasState);
        
        console.log('📊 Analysis:', analysis);
        
        if (analysis.totalStepsNeeded === 0) {
          console.log('⚠️ No steps needed, returning early');
          return;
        }

        const collectionState = FieldCollectionOrchestrator.createCollectionPlan(canvasState);
        console.log('📋 Collection state:', collectionState);
        
        if (collectionState.currentStep) {
          console.log('✨ Adding AI response with thinking for:', collectionState.currentStep.question);
          get().addAIResponseWithThinking(
            collectionState.currentStep.question,
            {
              fieldCollectionState: collectionState,
              isCollectingFields: true,
            }
          );
        } else {
          console.log('⚠️ No current step found');
        }
      },

      processCollectionInput: (input: string) => {
        const { fieldCollectionState, messages } = get();
        
        if (!fieldCollectionState?.currentStep) {
      logger.warn('No active collection step', undefined, 'field-collection');
          return;
        }

        const canvasStore = useCanvasStore.getState();
        const result = FieldCollectionOrchestrator.processInput(input, fieldCollectionState.currentStep);
        
        if (!result.success) {
          // Show error message with thinking animation
          get().addAIResponseWithThinking(result.error || 'Please provide a valid input.');
          return;
        }

        // Analyze user behavior for intelligent responses
        const userBehavior = analyzeUserBehavior(messages);

        // Handle skipped fields with intelligent acknowledgment
        if (result.wasSkipped) {
          const skipMessage = userBehavior.prefersBriefResponses 
            ? `✓ Skipped ${fieldCollectionState.currentStep.currentField}`
            : `Okay, I'll skip the ${fieldCollectionState.currentStep.currentField} field.`;
          get().addAIResponseWithThinking(skipMessage);
        }

        // Apply canvas update and generate intelligent acknowledgment
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
            
            // Generate intelligent acknowledgment for node selection
            const canvasEvent: CanvasChangeEvent = {
              type: 'node-selected',
              nodeType,
              changes: { nodeName },
              completionStatus: 'partial'
            };
            
            const acknowledgment = handleCanvasChange(canvasEvent, canvasStore, userBehavior);
            get().addAIResponseWithThinking(acknowledgment);
            
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
            
            // Generate intelligent acknowledgment for field update
            const updatedCanvasState = useCanvasStore.getState();
            
            // Check if node is now complete
            const gaps = analyzeCompletionGaps(updatedCanvasState);
            const nodeGaps = gaps.filter(gap => gap.nodeType === nodeType);
            const completionStatus = nodeGaps.length === 0 ? 'complete' : 'partial';
            
            const canvasEvent: CanvasChangeEvent = {
              type: 'field-updated',
              nodeType,
              changes: { fieldName, fieldValue },
              completionStatus
            };
            
            const acknowledgment = handleCanvasChange(canvasEvent, updatedCanvasState, userBehavior);
            get().addAIResponseWithThinking(acknowledgment);
          }

          // Update progress after canvas changes
          const progressStore = useProgressStore.getState();
          const updatedCanvasState = canvasStore;
          progressStore.calculateFromCanvasState({
            selectedSource: updatedCanvasState.selectedSource,
            selectedDestination: updatedCanvasState.selectedDestination,
            selectedTransform: updatedCanvasState.selectedTransform,
            nodeValues: updatedCanvasState.nodeValues,
            transformByType: {
              'Dummy Transform': {},
              'Map & Validate': {},
              'Cleanse': {},
              'Enrich & Map': updatedCanvasState.getTransformValuesByType('Enrich & Map'),
            },
          });
        }

        // Get next step using intelligent questioning
        const updatedCanvasState = useCanvasStore.getState();
        const nextStep = FieldCollectionOrchestrator.getNextStep(fieldCollectionState, updatedCanvasState);
        
        if (nextStep) {
          // Check if we're transitioning to a new node
          const currentNodeType = fieldCollectionState.currentStep.nodeType;
          const nextNodeType = nextStep.nodeType;
          const isNodeTransition = currentNodeType !== nextNodeType;
          
          // Generate intelligent next question
          const intelligentQuestion = getNextBestQuestion(updatedCanvasState, userBehavior);
          let messageContent = intelligentQuestion;
          
          // Add node completion celebration if transitioning
          if (isNodeTransition) {
            const nodeTypeNames = {
              source: 'source system',
              transform: 'transformation',
              destination: 'destination system'
            };
            
            const completedNodeName = nodeTypeNames[currentNodeType];
            
            const celebrationMessage = userBehavior.prefersBriefResponses
              ? `✅ ${completedNodeName} complete!`
              : `Great! Your ${completedNodeName} is fully configured.`;
            
            messageContent = `${celebrationMessage}\n\n${intelligentQuestion}`;
          }
          
          const updatedCollectionState: CollectionState = {
            ...fieldCollectionState,
            currentStep: nextStep,
            completedSteps: [...fieldCollectionState.completedSteps, fieldCollectionState.currentStep]
          };

          get().addAIResponseWithThinking(
            messageContent,
            {
              fieldCollectionState: updatedCollectionState,
            }
          );

        } else {
          // Collection complete - intelligent celebration
          const completionMessage = userBehavior.prefersBriefResponses
            ? "🎉 All done! Your data flow is ready."
            : "🎉 Perfect! Your data flow is now fully configured and ready to go! Is there anything else you'd like to adjust?";
          
          get().addAIResponseWithThinking(completionMessage, {
            fieldCollectionState: null,
            isCollectingFields: false,
          });
        }
      },

      completeFieldCollection: () => {
        get().addAIResponseWithThinking(
          'Perfect! Your data flow is now fully configured. You can see all the connections and credentials in the canvas. Is there anything else you\'d like to adjust?',
          {
            fieldCollectionState: null,
            isCollectingFields: false,
          }
        );
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
          pendingRoleClarity: null,
        }),

      // Reset all chat data to initial state (for landing page navigation)
      resetStore: () =>
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
          input: '',
          conversationHistory: [],
          aiThinking: false,
          highlightId: null,
          isProcessingLLM: false,
          fieldCollectionState: null,
          isCollectingFields: false,
          pendingRoleClarity: null,
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
