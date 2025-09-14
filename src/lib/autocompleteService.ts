import { connectorCatalog } from './connectorCatalog';

// Types for autocomplete system
export interface AutocompleteSuggestion {
  id: string;
  type: 'completion' | 'connector' | 'flow-pattern' | 'category';
  text: string;
  description?: string;
  category?: string;
  confidence: number;
  metadata?: {
    sourceConnector?: string;
    destinationConnector?: string;
    transformType?: string;
  };
}

export interface AutocompleteRequest {
  query: string;
  cursorPosition: number;
  maxSuggestions?: number;
}

interface LLMAutocompleteResponse {
  suggestions: Array<{
    text: string;
    type: 'completion' | 'flow-pattern' | 'connector';
    confidence: number;
    explanation?: string;
  }>;
}

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = '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';

class AutocompleteService {
  private queryCache = new Map<string, AutocompleteSuggestion[]>();
  private connectorCache = new Map<string, AutocompleteSuggestion[]>();
  private requestInProgress = new Set<string>();

  constructor() {
    this.precomputeConnectorCache();
  }

  /**
   * Main autocomplete method - LLM first, then fallbacks
   */
  async getSuggestions(request: AutocompleteRequest): Promise<AutocompleteSuggestion[]> {
    const { query, maxSuggestions = 5 } = request;
    const trimmedQuery = query.trim().toLowerCase();

    // Return empty for very short queries
    if (trimmedQuery.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `${trimmedQuery}:${maxSuggestions}`;
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    // Prevent duplicate requests
    if (this.requestInProgress.has(cacheKey)) {
      return [];
    }

    this.requestInProgress.add(cacheKey);

    try {
      // Primary: LLM-powered suggestions
      const llmSuggestions = await this.getLLMSuggestions(request);
      
      if (llmSuggestions.length > 0) {
        this.cacheResults(cacheKey, llmSuggestions);
        return llmSuggestions.slice(0, maxSuggestions);
      }

      // Fallback: Local pattern matching + connector search
      const fallbackSuggestions = await this.getFallbackSuggestions(request);
      this.cacheResults(cacheKey, fallbackSuggestions);
      return fallbackSuggestions.slice(0, maxSuggestions);

    } catch (error) {
      console.warn('Autocomplete error, using fallback:', error);
      
      // Emergency fallback: Local suggestions only
      const fallbackSuggestions = await this.getFallbackSuggestions(request);
      return fallbackSuggestions.slice(0, maxSuggestions);
      
    } finally {
      this.requestInProgress.delete(cacheKey);
    }
  }

  /**
   * Primary method: LLM-powered intelligent suggestions
   */
  private async getLLMSuggestions(request: AutocompleteRequest): Promise<AutocompleteSuggestion[]> {
    const { query } = request;
    
    // Get connector names for context
    const connectorNames = Object.keys(connectorCatalog);
    const popularConnectors = this.getPopularConnectors();
    const commonPatterns = this.getCommonFlowPatterns();

    const systemPrompt = `You are an intelligent autocomplete assistant for data integration flows.

CONTEXT:
- User is typing: "${query}"
- Available connectors: ${connectorNames.slice(0, 50).join(', ')}... (800+ total)
- Popular connectors: ${popularConnectors.join(', ')}
- Common patterns: ${commonPatterns.join(', ')}

TASK: Provide 3-5 intelligent autocomplete suggestions that:
1. Complete the user's current thought naturally
2. Suggest realistic data flow patterns using actual connector names
3. Prioritize popular and well-known connectors
4. Make suggestions that sound natural and actionable

RULES:
- Use actual connector names from the catalog
- Focus on complete, actionable flow descriptions
- Prioritize common use cases (e-commerce, CRM, analytics, etc.)
- Keep suggestions concise but descriptive
- Include variety: completions, flow patterns, and connector suggestions

RESPONSE FORMAT (JSON only):
{
  "suggestions": [
    {
      "text": "Complete flow description that extends the user's input",
      "type": "completion",
      "confidence": 0.95,
      "explanation": "Brief reason why this suggestion makes sense"
    }
  ]
}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nexla-data-flow.com',
          'X-Title': 'Nexla Data Flow Architect - Autocomplete',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Complete this data flow query: "${query}"` }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      // Parse LLM response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const llmResponse: LLMAutocompleteResponse = JSON.parse(jsonMatch[0]);
      
      // Convert LLM suggestions to our format
      return llmResponse.suggestions.map((suggestion, index) => ({
        id: `llm-${Date.now()}-${index}`,
        type: suggestion.type,
        text: suggestion.text,
        description: suggestion.explanation,
        confidence: suggestion.confidence,
        category: 'AI Suggestion',
      }));

    } catch (error) {
      console.warn('LLM autocomplete failed:', error);
      throw error; // Re-throw to trigger fallback
    }
  }

  /**
   * Fallback method: Local pattern matching and fuzzy search
   */
  private async getFallbackSuggestions(request: AutocompleteRequest): Promise<AutocompleteSuggestion[]> {
    const { query } = request;
    const suggestions: AutocompleteSuggestion[] = [];

    // 1. Pattern-based completions
    const patternSuggestions = this.getPatternSuggestions(query);
    suggestions.push(...patternSuggestions);

    // 2. Fuzzy connector matching
    const connectorSuggestions = this.getConnectorSuggestions(query);
    suggestions.push(...connectorSuggestions);

    // 3. Popular flow patterns
    const flowSuggestions = this.getFlowPatternSuggestions(query);
    suggestions.push(...flowSuggestions);

    // Sort by confidence and remove duplicates
    return this.deduplicateAndSort(suggestions);
  }

  /**
   * Pattern-based suggestion matching
   */
  private getPatternSuggestions(query: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    const patterns = [
      {
        pattern: /^connect\s+(\w+)/i,
        completions: ['to Snowflake', 'to BigQuery', 'to Google Sheets', 'to Webhook']
      },
      {
        pattern: /^sync\s+(\w+)/i,
        completions: ['with Salesforce', 'to Mailchimp', 'with HubSpot', 'to Google Sheets']
      },
      {
        pattern: /^get\s+(\w+)/i,
        completions: ['data to Snowflake', 'users to CRM', 'orders to analytics', 'data and transform']
      },
      {
        pattern: /(\w+)\s+to$/i,
        completions: ['Snowflake', 'BigQuery', 'Google Sheets', 'Webhook', 'Salesforce']
      }
    ];

    patterns.forEach(({ pattern, completions }) => {
      const match = lowerQuery.match(pattern);
      if (match) {
        completions.forEach((completion, index) => {
          suggestions.push({
            id: `pattern-${Date.now()}-${index}`,
            type: 'completion',
            text: `${query} ${completion}`,
            confidence: 0.8 - (index * 0.1),
            category: 'Pattern Match'
          });
        });
      }
    });

    return suggestions;
  }

  /**
   * Fuzzy connector matching
   */
  private getConnectorSuggestions(query: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through connectors
    Object.values(connectorCatalog).forEach(connector => {
      const similarity = this.calculateSimilarity(lowerQuery, connector.name.toLowerCase());
      
      if (similarity > 0.3) {
        suggestions.push({
          id: `connector-${connector.name}`,
          type: 'connector',
          text: `Connect ${connector.name}`,
          description: `${connector.category} connector`,
          confidence: similarity,
          category: connector.category,
          metadata: {
            sourceConnector: connector.name
          }
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * Popular flow pattern suggestions
   */
  private getFlowPatternSuggestions(query: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    const popularFlows = [
      'Connect Shopify orders to Snowflake',
      'Sync Salesforce contacts to Mailchimp',
      'Get PostgreSQL users and send to webhook',
      'Analyze Stripe payments in Google Sheets',
      'Connect HubSpot deals to BigQuery',
      'Sync Airtable records to Salesforce',
      'Get MongoDB data to Elasticsearch',
      'Connect Google Analytics to Data Studio'
    ];

    popularFlows.forEach((flow, index) => {
      if (flow.toLowerCase().includes(lowerQuery) || lowerQuery.length < 3) {
        suggestions.push({
          id: `flow-${index}`,
          type: 'flow-pattern',
          text: flow,
          description: 'Popular flow pattern',
          confidence: 0.7 - (index * 0.05),
          category: 'Popular Flows'
        });
      }
    });

    return suggestions.slice(0, 2);
  }

  /**
   * Utility methods
   */
  private calculateSimilarity(query: string, target: string): number {
    // Simple fuzzy matching algorithm
    if (target.includes(query)) return 0.9;
    if (target.startsWith(query)) return 0.8;
    
    // Levenshtein distance based similarity
    const distance = this.levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);
    return Math.max(0, 1 - (distance / maxLength));
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private deduplicateAndSort(suggestions: AutocompleteSuggestion[]): AutocompleteSuggestion[] {
    const seen = new Set<string>();
    const unique = suggestions.filter(suggestion => {
      if (seen.has(suggestion.text)) return false;
      seen.add(suggestion.text);
      return true;
    });

    return unique.sort((a, b) => b.confidence - a.confidence);
  }

  private cacheResults(key: string, suggestions: AutocompleteSuggestion[]): void {
    // Limit cache size
    if (this.queryCache.size > 100) {
      const firstKey = this.queryCache.keys().next().value;
      if (firstKey) {
        this.queryCache.delete(firstKey);
      }
    }
    this.queryCache.set(key, suggestions);
  }

  private precomputeConnectorCache(): void {
    // Pre-compute popular connector searches
    const popularQueries = ['shop', 'sales', 'google', 'amazon', 'microsoft', 'data'];
    
    popularQueries.forEach(query => {
      const suggestions = this.getConnectorSuggestions(query);
      this.connectorCache.set(query, suggestions);
    });
  }

  private getPopularConnectors(): string[] {
    return [
      'Shopify', 'Salesforce', 'Google BigQuery', 'Snowflake', 'Amazon S3',
      'HubSpot', 'Mailchimp', 'PostgreSQL', 'MySQL', 'Google Sheets',
      'Stripe', 'Webhook', 'Airtable', 'MongoDB', 'Elasticsearch'
    ];
  }

  private getCommonFlowPatterns(): string[] {
    return [
      'E-commerce to Data Warehouse',
      'CRM to Email Marketing',
      'Database to Analytics',
      'API to Storage',
      'Files to Database'
    ];
  }
}

// Export singleton instance
export const autocompleteService = new AutocompleteService();
