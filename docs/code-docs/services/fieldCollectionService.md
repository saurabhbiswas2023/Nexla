# Field Collection Service

**Dynamic Configuration Service** - Intelligent field collection and validation

## Overview

The Field Collection Service orchestrates the dynamic collection of configuration fields for data flow nodes. It manages the step-by-step process of gathering required information from users through conversational interactions.

## API Interface

```typescript
interface FieldCollectionService {
  startCollection(nodeType: NodeType, nodeName: string): CollectionStep;
  processInput(field: string, value: string): Promise<CollectionResult>;
  validateField(field: string, value: string): ValidationResult;
  getNextField(): string | null;
  isCollectionComplete(): boolean;
}
```

## Usage Examples

### Start Collection
```typescript
import { fieldCollectionService } from '@/lib/fieldCollectionService';

const step = fieldCollectionService.startCollection('source', 'Salesforce');
// Returns: { field: 'baseUrl', question: 'What is your Salesforce instance URL?' }
```

### Process Field Input
```typescript
const result = await fieldCollectionService.processInput('baseUrl', 'https://mycompany.salesforce.com');
if (result.isValid) {
  const nextStep = fieldCollectionService.getNextField();
}
```

### Validation
```typescript
const validation = fieldCollectionService.validateField('email', 'user@example.com');
if (!validation.isValid) {
  console.log(validation.error); // "Invalid email format"
}
```

## Collection Flow

### State Machine
```
Idle → Node Selection → Field Collection → Validation → Complete
  ↓         ↓              ↓              ↓         ↓
Start    Choose Type   Gather Fields   Validate   Finish
```

### Field Types
- **Required Fields**: Must be provided for completion
- **Optional Fields**: Can be skipped or provided later
- **Conditional Fields**: Depend on other field values
- **Validation Fields**: Require specific format/content

## Node Type Configurations

### Source Nodes
```typescript
const sourceFields = {
  salesforce: ['baseUrl', 'clientId', 'clientSecret', 'username', 'password'],
  database: ['host', 'port', 'database', 'username', 'password'],
  api: ['endpoint', 'apiKey', 'headers']
};
```

### Transform Nodes
```typescript
const transformFields = {
  cleanse: ['rules', 'outputFormat'],
  validate: ['schema', 'errorHandling'],
  aggregate: ['groupBy', 'functions']
};
```

### Destination Nodes
```typescript
const destinationFields = {
  bigquery: ['projectId', 'dataset', 'table', 'credentials'],
  snowflake: ['account', 'warehouse', 'database', 'schema'],
  webhook: ['url', 'method', 'headers', 'authentication']
};
```

## Validation System

### Field Validators
```typescript
const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value: string) => /^https?:\/\/.+/.test(value),
  required: (value: string) => value.trim().length > 0,
  port: (value: string) => /^\d{1,5}$/.test(value) && parseInt(value) <= 65535
};
```

### Custom Validation
```typescript
const customValidators = {
  salesforceUrl: (url: string) => {
    return url.includes('.salesforce.com') || url.includes('.my.salesforce.com');
  },
  bigqueryProject: (projectId: string) => {
    return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(projectId);
  }
};
```

## Question Generation

### Smart Questions
The service generates contextual questions based on:
- Node type and connector
- Previously collected fields
- User's technical level
- Common configuration patterns

### Question Templates
```typescript
const questionTemplates = {
  baseUrl: "What is your {connector} instance URL?",
  credentials: "Please provide your {connector} credentials",
  database: "Which database would you like to connect to?",
  table: "What table should we use for {operation}?"
};
```

## Progress Tracking

### Collection Progress
```typescript
interface CollectionProgress {
  currentStep: number;
  totalSteps: number;
  completedFields: string[];
  remainingFields: string[];
  percentage: number;
}
```

### Status Updates
- Real-time progress indicators
- Field completion status
- Validation feedback
- Next step guidance

## Error Handling

### Validation Errors
- Format validation (email, URL, etc.)
- Business rule validation
- Dependency validation
- Security validation

### Recovery Strategies
- Clear error messages
- Correction guidance
- Example formats
- Alternative options

## Integration

### Canvas Store Integration
```typescript
// Update canvas when field is collected
const updateCanvasNode = (nodeId: string, field: string, value: string) => {
  canvasStore.updateNode(nodeId, {
    data: { ...existingData, [field]: value }
  });
};
```

### Chat Store Integration
```typescript
// Generate AI responses for field collection
const generateFieldQuestion = (field: string, context: CollectionContext) => {
  return `What is your ${context.connector} ${field}? ${getHelpText(field)}`;
};
```

## Implementation

Located at: `src/lib/fieldCollectionService.ts`

Implements intelligent field collection with validation, progress tracking, and seamless integration with the chat and canvas systems.
