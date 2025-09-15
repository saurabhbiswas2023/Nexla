# OpenAI Service

**AI Integration Service** - LLM communication and response processing

## Overview

The OpenAI service handles all communication with the OpenAI API for Large Language Model (LLM) interactions. It manages message formatting, API calls, error handling, and response processing for the conversational interface.

## API Interface

```typescript
interface OpenAIService {
  sendMessage(message: string, context?: ConversationContext): Promise<string>;
  sendWithContext(messages: ChatMessage[]): Promise<string>;
  validateApiKey(): Promise<boolean>;
  getModelInfo(): Promise<ModelInfo>;
}
```

## Usage Examples

### Basic Message
```typescript
import { openAIService } from '@/lib/openAIService';

const response = await openAIService.sendMessage(
  "Connect Salesforce to BigQuery"
);
```

### With Context
```typescript
const response = await openAIService.sendWithContext([
  { role: 'user', content: 'I need help with data integration' },
  { role: 'assistant', content: 'I can help you set up data flows...' },
  { role: 'user', content: 'Connect Salesforce to BigQuery' }
]);
```

### API Key Validation
```typescript
const isValid = await openAIService.validateApiKey();
if (!isValid) {
  throw new Error('Invalid API key');
}
```

## Configuration

### Environment Variables
```bash
VITE_OPENAI_API_KEY=your_api_key_here
```

### Model Settings
- **Model**: GPT-4o-mini (optimized for cost and performance)
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 1000 (sufficient for responses)
- **Top P**: 0.9 (focused but diverse responses)

## Message Processing

### Input Processing
1. **Sanitization**: Clean and validate user input
2. **Context Building**: Add conversation history
3. **Prompt Engineering**: Structure for optimal AI response
4. **Rate Limiting**: Manage API call frequency

### Response Processing
1. **Validation**: Ensure response quality
2. **Formatting**: Structure for UI display
3. **Error Handling**: Graceful failure management
4. **Caching**: Store responses for performance

## Error Handling

### Common Errors
- **API Key Invalid**: Authentication failure
- **Rate Limit**: Too many requests
- **Network Error**: Connection issues
- **Model Error**: AI processing failure

### Error Recovery
```typescript
try {
  const response = await openAIService.sendMessage(message);
  return response;
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Implement backoff strategy
    await delay(1000);
    return retry();
  }
  throw new ServiceError('AI service unavailable');
}
```

## Security

### API Key Protection
- Environment variable storage
- No client-side exposure
- Secure transmission only

### Input Validation
- XSS prevention
- Content filtering
- Length limitations
- Malicious prompt detection

## Performance

### Optimization Strategies
- **Request Batching**: Combine related requests
- **Response Caching**: Cache common responses
- **Streaming**: Real-time response streaming
- **Compression**: Minimize payload size

### Monitoring
- Response time tracking
- Error rate monitoring
- Usage analytics
- Cost optimization

## Implementation

Located at: `src/lib/openAIService.ts`

Implements comprehensive error handling, security measures, and performance optimizations for reliable AI integration.
