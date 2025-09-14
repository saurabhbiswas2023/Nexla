import { connectorCatalog } from './connectorCatalog';
import { logger } from './logger';

export interface FlowParseResult {
  success: boolean;
  data?: {
    source?: string | null;
    transform?: string | null;
    destination?: string | null;
    needsRoleClarity?: string | null;
    credentials?: Record<string, unknown>;
    followUpQuestion?: string | null;
  };
  error?: string;
}

const OPENROUTER_API_KEY =
  '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const systemPrompt = `You are an AI assistant that helps users build data integration flows. Your primary job is to identify systems and transformations from user messages.

FOCUS ON SYSTEM IDENTIFICATION:
1. Source system (where data comes from)
2. Transform operations (how to process data) 
3. Destination system (where data goes)

IMPORTANT RULES:
1. Only identify systems that are explicitly mentioned by the user
2. Don't assume default transforms - only set transform when explicitly mentioned
3. Don't ask about credentials - the system will handle field collection automatically
4. Be conversational and helpful
5. Focus on understanding the data flow intent
6. Use exact connector names from the catalog when possible
7. Only set transform when explicitly mentioned - do NOT assume default transforms
8. **CRITICAL RULE**: ALWAYS ask for role clarification unless the role is EXPLICITLY clear from context

ROLE CLARITY REQUIREMENTS:
- If user says just a connector name (like "Shopify", "BigQuery", "Salesforce") → ALWAYS set needsRoleClarity
- If user says "I want to use X" without specifying role → ALWAYS set needsRoleClarity  
- If user says "X system" without direction → ALWAYS set needsRoleClarity
- Only skip role clarity if user explicitly says "source", "destination", "from", "to", "connect X to Y", etc.

SYSTEM IDENTIFICATION EXAMPLES:
- "Connect Shopify to BigQuery" → source: "Shopify", destination: "Google BigQuery", transform: null (CLEAR ROLES)
- "Sync Salesforce contacts to Mailchimp" → source: "Salesforce", destination: "Mailchimp", transform: null (CLEAR ROLES)
- "Get data from PostgreSQL" → source: "PostgreSQL", destination: null, transform: null (CLEAR SOURCE ROLE)
- "Send data to Snowflake" → source: null, destination: "Snowflake", transform: null (CLEAR DESTINATION ROLE)
- "I want to use Salesforce as my source" → source: "Salesforce", destination: null, transform: null (CLEAR SOURCE ROLE)

EXAMPLES REQUIRING ROLE CLARITY:
- "Shopify" → needsRoleClarity: "Shopify", followUpQuestion: "Is Shopify your source (where you get data from) or destination (where you send data to)?"
- "BigQuery" → needsRoleClarity: "Google BigQuery", followUpQuestion: "Is BigQuery your source (where you get data from) or destination (where you send data to)?"
- "I want to use Salesforce" → needsRoleClarity: "Salesforce", followUpQuestion: "Is Salesforce your source (where you get data from) or destination (where you send data to)?"
- "Mailchimp system" → needsRoleClarity: "Mailchimp", followUpQuestion: "Is Mailchimp your source (where you get data from) or destination (where you send data to)?"
- "PostgreSQL database" → needsRoleClarity: "PostgreSQL", followUpQuestion: "Is PostgreSQL your source (where you get data from) or destination (where you send data to)?"

ROLE CLARITY NEEDED:
**ALWAYS** ask for role clarification unless the user explicitly indicates direction with words like "from", "to", "source", "destination", "connect X to Y", "sync X to Y", etc.

FOLLOW-UP QUESTIONS:
- If needsRoleClarity: ask "Is [connector] your source or destination?"
- If missing source: ask what system they want to get data from
- If missing destination: ask where they want to send the data
- If missing transform: ask what type of data processing they need
- Don't ask about credentials - that's handled automatically

Respond with JSON in this exact format:
{
  "source": "system name or null",
  "transform": "transform type or null", 
  "destination": "system name or null",
  "needsRoleClarity": "connector name that needs role clarification or null",
  "credentials": {},
  "followUpQuestion": "What specific question to ask next"
}`;

// COMPLETELY OVERHAULED: Context-aware intent detection with full connector knowledge
export async function detectUserIntent(
  userMessage: string,
  context: {
    pendingRoleClarity?: string | null;
    conversationHistory?: string[];
  }
): Promise<{
  intent: 'role_clarification' | 'connector_correction' | 'new_flow_request';
  connectorName?: string;
  role?: 'source' | 'destination';
  confidence: number;
}> {
  // PASS ALL CONNECTORS - No more filtering, LLM needs full context
  const allConnectors = Object.keys(connectorCatalog).sort();
  
  // Build rich conversation context
  const conversationContext = context.conversationHistory?.length 
    ? `CONVERSATION HISTORY:\n${context.conversationHistory.map((msg, i) => `${i % 2 === 0 ? 'User' : 'Bot'}: ${msg}`).join('\n')}\n\n`
    : '';
  
  const currentContext = context.pendingRoleClarity 
    ? `CURRENT SITUATION: We are asking the user to clarify if "${context.pendingRoleClarity}" is a source or destination.\n\n`
    : '';
  
  const intentPrompt = `You are Claude, an expert at understanding user intent in data integration conversations.

CURRENT SITUATION:
${currentContext}

CONVERSATION HISTORY:
${conversationContext}

USER'S MESSAGE: "${userMessage}"

AVAILABLE CONNECTORS: ${allConnectors.join(', ')}

ANALYZE THE USER'S INTENT:

The user is responding to a question about whether a connector is their "source" or "destination". Look at their message and determine:

1. ROLE_CLARIFICATION: User is answering the role question
   - "source", "destination", "it's a source", etc.
   
2. CONNECTOR_CORRECTION: User wants to change the connector
   - "no its [connector]", "I meant [connector]", "actually [connector]"
   - "no its not" (rejection without specifying new connector)
   
3. NEW_FLOW_REQUEST: User wants to start over
   - "connect X to Y", "new flow", etc.

CRITICAL RULES:
- If user says "no" without specifying a new connector → ask what they meant
- If user says "no its [name]" → extract the exact connector name from the available list
- If user says "source" or "destination" → that's their role choice
- Be very precise about connector name matching

Respond with JSON only:
{
  "intent": "role_clarification|connector_correction|new_flow_request",
  "connectorName": "exact connector name from list or null",
  "role": "source|destination or null",
  "confidence": 0.0-1.0,
  "reasoning": "why you chose this intent"
}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexla-data-flow.com',
        'X-Title': 'Nexla Intent Detection',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // BEST INTENT PARSING LLM
        messages: [{ role: 'user', content: intentPrompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API Error:', response.status, errorText);
      
      // Don't throw - use fallback instead
      return createSmartFallback(userMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    // Fallback
    return {
      intent: 'new_flow_request',
      confidence: 0.5
    };
  } catch (error) {
    logger.error('Intent detection failed', error, 'intent-detection');
    return {
      intent: 'new_flow_request', 
      confidence: 0.5
    };
  }
}

export async function parseFlowWithLLM(
  userMessage: string,
  conversationHistory: string[] = []
): Promise<FlowParseResult> {
  
  // FULL CONTEXT APPROACH: Pass ALL connectors and conversation history
  const allConnectors = Object.keys(connectorCatalog).sort();
  
  // Build comprehensive conversation context
  const conversationContext = conversationHistory.length > 0
    ? `\n\nCONVERSATION HISTORY:\n${conversationHistory.map((msg, i) => `${i % 2 === 0 ? 'User' : 'Bot'}: ${msg}`).join('\n')}`
    : '';
  
  const connectorContext = `\n\nALL AVAILABLE CONNECTORS (${allConnectors.length} total):\n${allConnectors.join(', ')}\n\nCRITICAL: If user mentions ANY connector name without clear source/destination role, ALWAYS set needsRoleClarity to the EXACT connector name from this complete list. Use the full conversation context to understand user intent.${conversationContext}`;
  try {
    const messages = [
      { role: 'system', content: systemPrompt + connectorContext },
      ...conversationHistory.map((msg, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: msg,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexla-data-flow.com',
        'X-Title': 'Nexla Data Flow Architect',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // WORKING MODEL FROM YESTERDAY
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenRouter response');
    }

    // Try to parse JSON from the response
    let parsedResult;
    try {
      // Extract JSON from response (handle cases where LLM adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback to regex parsing if JSON parsing fails
        logger.warn('JSON parsing failed, using fallback regex parsing', undefined, 'openrouter-service');
      return parseFlowFromTextRegex(content);
    }

    return {
      success: true,
      data: {
        source: parsedResult.source || null,
        transform: parsedResult.transform || null,
        destination: parsedResult.destination || null,
        credentials: parsedResult.credentials || {},
        followUpQuestion: parsedResult.followUpQuestion || null,
      },
    };
  } catch (error) {
    logger.error('OpenRouter service error', error, 'openrouter-service');

    // Fallback to regex parsing
    return parseFlowFromTextRegex(userMessage);
  }
}

// Fallback regex-based parsing
function parseFlowFromTextRegex(text: string): FlowParseResult {
  // Common patterns for source systems
  const sourcePatterns = [
    /(?:from|connect|sync|get.*from|extract.*from)\s+(\w+)/i,
    /(\w+)\s+(?:to|into|→)/i,
  ];

  // Common patterns for destination systems
  const destPatterns = [
    /(?:to|into|send.*to|load.*into|→)\s+(\w+)/i,
    /(?:from|connect|sync)\s+\w+\s+(?:to|into)\s+(\w+)/i,
  ];

  let source = null;
  let destination = null;

  // Try to find source
  for (const pattern of sourcePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].toLowerCase();
      // Check if it's a known connector
      const connectorName = Object.keys(connectorCatalog).find(
        (name) => name.toLowerCase().includes(candidate) || candidate.includes(name.toLowerCase())
      );
      if (connectorName) {
        source = connectorName;
        break;
      }
    }
  }

  // Try to find destination
  for (const pattern of destPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].toLowerCase();
      // Check if it's a known connector
      const connectorName = Object.keys(connectorCatalog).find(
        (name) => name.toLowerCase().includes(candidate) || candidate.includes(name.toLowerCase())
      );
      if (connectorName) {
        destination = connectorName;
        break;
      }
    }
  }

  // Note: We don't automatically set a default transform anymore
  // The transform should remain "Dummy Transform" until explicitly mentioned

  let followUpQuestion = 'I can help you set up this data flow. ';
  if (!source && !destination) {
    followUpQuestion += 'What systems would you like to connect?';
  } else if (!source) {
    followUpQuestion += 'What system should we get the data from?';
  } else if (!destination) {
    followUpQuestion += 'Where should we send the data?';
  } else {
    followUpQuestion += 'What credentials do you have for these systems?';
  }

  return {
    success: true,
    data: {
      source,
      transform: null, // Don't assume default transform
      destination,
      credentials: {},
      followUpQuestion,
    },
  };
}

// SMART FALLBACK - Rule-based intent detection when API fails
function createSmartFallback(userMessage: string) {
  console.log('🚨 Using SMART FALLBACK intent detection');
  
  const userLower = userMessage.toLowerCase().trim();
  
  // 1. ROLE DETECTION
  if (userLower === 'source' || userLower === 'src' || userLower.includes('source')) {
    return {
      intent: 'role_clarification' as const,
      role: 'source' as const,
      confidence: 0.95,
      reasoning: 'Fallback: detected source'
    };
  }
  
  if (userLower === 'destination' || userLower === 'dest' || userLower.includes('destination')) {
    return {
      intent: 'role_clarification' as const, 
      role: 'destination' as const,
      confidence: 0.95,
      reasoning: 'Fallback: detected destination'
    };
  }
  
  // 2. CORRECTION DETECTION
  if (userLower.startsWith('no') && userLower.includes('its')) {
    const match = userLower.match(/no\s+it'?s\s+(.+)/);
    if (match && match[1] !== 'not') {
      return {
        intent: 'connector_correction' as const,
        connectorName: match[1].charAt(0).toUpperCase() + match[1].slice(1),
        confidence: 0.9,
        reasoning: 'Fallback: detected correction'
      };
    }
  }
  
  // 3. REJECTION DETECTION  
  if (userLower.includes('no') && (userLower.includes('not') || userLower.trim() === 'no')) {
    return {
      intent: 'connector_correction' as const,
      connectorName: undefined,
      confidence: 0.8,
      reasoning: 'Fallback: detected rejection'
    };
  }
  
  // 4. DEFAULT
  return {
    intent: 'new_flow_request' as const,
    confidence: 0.5,
    reasoning: 'Fallback: unclear intent'
  };
}
