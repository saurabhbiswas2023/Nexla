import { connectorCatalog } from './connectorCatalog';

export interface FlowParseResult {
  success: boolean;
  data?: {
    source?: string | null;
    transform?: string | null;
    destination?: string | null;
    credentials?: Record<string, unknown>;
    followUpQuestion?: string | null;
  };
  error?: string;
}

const OPENROUTER_API_KEY =
  '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const systemPrompt = `You are an AI assistant that helps users build data integration flows. Your job is to parse user messages and extract:

1. Source system (where data comes from)
2. Transform operations (how to process data) 
3. Destination system (where data goes)
4. Credentials needed for each system
5. Follow-up questions to gather missing information

IMPORTANT RULES:
1. Only identify systems that are explicitly mentioned by the user
2. Don't assume default transforms - only set transform when explicitly mentioned
3. Ask follow-up questions for missing information
4. Be conversational and helpful
5. Focus on one missing piece at a time
6. Use the connector catalog to validate system names
7. Extract any credentials mentioned (API keys, URLs, usernames, etc.)
8. Only set transform when explicitly mentioned - do NOT assume default transforms

EXAMPLES:
- "Connect Shopify to BigQuery" → source: "Shopify", destination: "Google BigQuery", transform: null, ask for credentials
- "Sync Salesforce contacts to Mailchimp" → source: "Salesforce", destination: "Mailchimp", transform: null
- "Get PostgreSQL users and transform them, then send to webhook" → source: "PostgreSQL", destination: "Webhook", transform: "Map & Validate"

Respond with JSON in this exact format:
{
  "source": "system name or null",
  "transform": "transform type or null", 
  "destination": "system name or null",
  "credentials": {},
  "followUpQuestion": "What specific question to ask next"
}`;

export async function parseFlowWithLLM(
  userMessage: string,
  conversationHistory: string[] = []
): Promise<FlowParseResult> {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
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
        model: 'openai/gpt-4o-mini',
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
      console.warn('JSON parsing failed, using fallback regex parsing');
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
    console.error('OpenRouter service error:', error);

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
