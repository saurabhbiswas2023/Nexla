import type { CanvasState } from '../store/canvasStore';
import type { Message } from '../store/chat';
import { connectorCatalog } from './connectorCatalog';

// Types for functional composition
export type AcknowledmentContext = {
  readonly fieldType: 'node-name' | 'mandatory-field' | 'optional-field';
  readonly nodeType: 'source' | 'transform' | 'destination';
  readonly fieldName?: string;
  readonly fieldValue: string;
  readonly nodeProgress: {
    readonly completed: number;
    readonly total: number;
    readonly percentage: number;
  };
  readonly overallProgress: {
    readonly source: number;
    readonly transform: number; 
    readonly destination: number;
    readonly total: number;
  };
  readonly userBehavior: UserBehavior;
};

export type AcknowledmentType = 
  | 'field-accepted'
  | 'node-completed'
  | 'progress-milestone'
  | 'smart-suggestion'
  | 'flexible-guidance'
  | 'completion-celebration';

export type UserBehavior = {
  readonly isSequential: boolean;
  readonly isSkippingOptional: boolean;
  readonly prefersBriefResponses: boolean;
  readonly interactionCount: number;
  readonly skipCount: number;
};

export type CanvasChangeEvent = {
  readonly type: 'node-selected' | 'field-updated' | 'node-completed';
  readonly nodeType: 'source' | 'transform' | 'destination';
  readonly changes: {
    readonly nodeName?: string;
    readonly fieldName?: string;
    readonly fieldValue?: string;
  };
  readonly completionStatus: 'pending' | 'partial' | 'complete';
};

export type CompletionGap = {
  readonly nodeType: 'source' | 'transform' | 'destination';
  readonly gapType: 'missing-node' | 'missing-fields';
  readonly priority: 'high' | 'medium' | 'low';
  readonly missingFields?: readonly string[];
};

// Pure functions for acknowledgment generation
const generateFieldAcceptedMessage = (context: AcknowledmentContext): string => {
  const { nodeType, fieldName, fieldValue, userBehavior } = context;
  
  if (context.fieldType === 'node-name') {
    const nodeTypeNames = {
      source: 'source system',
      transform: 'transformation',
      destination: 'destination system'
    };
    return `Perfect! I've set ${fieldValue} as your ${nodeTypeNames[nodeType]}.`;
  }
  
  // Brief responses for users who prefer them
  if (userBehavior.prefersBriefResponses) {
    return `✓ ${fieldName}: ${fieldValue}`;
  }
  
  return `Got it! ${fieldName} set to ${fieldValue}.`;
};

const generateNodeCompletedMessage = (context: AcknowledmentContext): string => {
  const { nodeType, nodeProgress, userBehavior } = context;
  const nodeTypeNames = {
    source: 'source system',
    transform: 'transformation',
    destination: 'destination system'
  };
  
  if (userBehavior.prefersBriefResponses) {
    return `✅ ${nodeTypeNames[nodeType]} complete!`;
  }
  
  return `Excellent! Your ${nodeTypeNames[nodeType]} is fully configured with ${nodeProgress.completed}/${nodeProgress.total} fields completed.`;
};

const generateProgressMilestone = (context: AcknowledmentContext): string => {
  const { overallProgress, userBehavior } = context;
  
  if (userBehavior.prefersBriefResponses) {
    return `Progress: ${Math.round(overallProgress.total)}%`;
  }
  
  if (overallProgress.source >= 33.33 && overallProgress.transform < 33.33) {
    return "Great progress! Your source is complete. Now let's set up the transformation.";
  }
  
  if (overallProgress.transform >= 33.33 && overallProgress.destination < 33.33) {
    return "Awesome! Source and transformation are ready. Let's configure the destination.";
  }
  
  return `You're making great progress! ${Math.round(overallProgress.total)}% complete.`;
};

const generateSmartSuggestion = (context: AcknowledmentContext): string => {
  const { fieldValue, nodeType } = context;
  
  // Smart suggestions based on connector type
  if (nodeType === 'source' && fieldValue.toLowerCase().includes('stripe')) {
    return "Since you're using Stripe, I can help set up payment data analysis. Would you like me to configure that?";
  }
  
  if (nodeType === 'source' && fieldValue.toLowerCase().includes('shopify')) {
    return "Great choice with Shopify! I can help analyze your e-commerce data. Shall I set up product or order analysis?";
  }
  
  if (nodeType === 'destination' && fieldValue.toLowerCase().includes('bigquery')) {
    return "BigQuery is perfect for analytics! I can suggest optimal data transformations for your use case.";
  }
  
  return `Since you're using ${fieldValue}, would you like me to suggest optimal configurations?`;
};

const generateFlexibleGuidance = (context: AcknowledmentContext): string => {
  const { overallProgress, userBehavior } = context;
  
  if (userBehavior.prefersBriefResponses) {
    return "What's next?";
  }
  
  const remaining = [];
  if (overallProgress.source < 33.33) remaining.push("source");
  if (overallProgress.transform < 33.33) remaining.push("transformation");
  if (overallProgress.destination < 33.33) remaining.push("destination");
  
  if (remaining.length === 0) {
    return "🎉 Everything looks complete! Is there anything you'd like to adjust?";
  }
  
  if (remaining.length === 1) {
    return `Almost done! Just need to configure your ${remaining[0]}.`;
  }
  
  return `What would you like to configure next? You can set up your ${remaining.join(' or ')} in any order.`;
};

const generateCompletionCelebration = (): string => {
  return "🎉 Perfect! Your data flow is now fully configured and ready to go!";
};

// Function composition for acknowledgment generation
const acknowledgmentGenerators = {
  'field-accepted': generateFieldAcceptedMessage,
  'node-completed': generateNodeCompletedMessage,
  'progress-milestone': generateProgressMilestone,
  'smart-suggestion': generateSmartSuggestion,
  'flexible-guidance': generateFlexibleGuidance,
  'completion-celebration': generateCompletionCelebration
} as const;

// Main acknowledgment function using composition
export const generateAcknowledgment = (
  type: AcknowledmentType,
  context: AcknowledmentContext
): string => acknowledgmentGenerators[type](context);

// Pure function to determine acknowledgment type from canvas change
export const determineAcknowledmentType = (event: CanvasChangeEvent): AcknowledmentType => {
  if (event.completionStatus === 'complete') return 'node-completed';
  if (event.type === 'field-updated') return 'field-accepted';
  if (event.type === 'node-selected') return 'smart-suggestion';
  return 'flexible-guidance';
};

// Pure function to calculate node progress
const calculateNodeProgress = (
  nodeType: 'source' | 'transform' | 'destination',
  canvasState: CanvasState
): { completed: number; total: number; percentage: number } => {
  const nodeName = nodeType === 'source' ? canvasState.selectedSource :
                   nodeType === 'transform' ? canvasState.selectedTransform :
                   canvasState.selectedDestination;
  
  // Handle dummy nodes
  if (nodeName.toLowerCase().includes('dummy')) {
    return { completed: 0, total: 1, percentage: 0 };
  }
  
  // Handle special transforms
  if (nodeType === 'transform' && ['Map & Validate', 'Cleanse', 'Data Analysis'].includes(nodeName)) {
    return { completed: 1, total: 1, percentage: 100 };
  }
  
  const connector = connectorCatalog[nodeName];
  if (!connector) {
    return { completed: 1, total: 1, percentage: 100 }; // Unknown connector, assume complete
  }
  
  const nodeValues = canvasState.nodeValues[nodeType] || {};
  const mandatoryFields = connector.credentials.mandatory;
  const completedFields = mandatoryFields.filter(field => 
    nodeValues[field] && nodeValues[field]!.trim() !== ''
  );
  
  return {
    completed: completedFields.length,
    total: mandatoryFields.length,
    percentage: mandatoryFields.length > 0 ? (completedFields.length / mandatoryFields.length) * 100 : 100
  };
};

// Pure function to calculate overall progress
const calculateOverallProgress = (canvasState: CanvasState) => {
  const sourceProgress = calculateNodeProgress('source', canvasState);
  const transformProgress = calculateNodeProgress('transform', canvasState);
  const destinationProgress = calculateNodeProgress('destination', canvasState);
  
  return {
    source: sourceProgress.percentage / 3, // Each node is worth 33.33%
    transform: transformProgress.percentage / 3,
    destination: destinationProgress.percentage / 3,
    total: (sourceProgress.percentage + transformProgress.percentage + destinationProgress.percentage) / 3
  };
};

// Pure function to create acknowledgment context from canvas state
export const createAcknowledmentContext = (
  event: CanvasChangeEvent,
  canvasState: CanvasState,
  userBehavior: UserBehavior
): AcknowledmentContext => ({
  fieldType: event.changes.fieldName ? 'mandatory-field' : 'node-name',
  nodeType: event.nodeType,
  fieldName: event.changes.fieldName,
  fieldValue: event.changes.fieldValue || event.changes.nodeName || '',
  nodeProgress: calculateNodeProgress(event.nodeType, canvasState),
  overallProgress: calculateOverallProgress(canvasState),
  userBehavior
});

// Pure function to analyze user behavior from message history
export const analyzeUserBehavior = (messages: readonly Message[]): UserBehavior => {
  const userMessages = messages.filter(m => m.type === 'user');
  const skipCommands = userMessages.filter(m => 
    ['skip', 'next', 'later', 'pass'].some(cmd => 
      m.content.toLowerCase().includes(cmd)
    )
  );
  
  return {
    isSequential: checkSequentialPattern(userMessages),
    isSkippingOptional: skipCommands.length > 0,
    prefersBriefResponses: checkBriefResponsePreference(userMessages),
    interactionCount: userMessages.length,
    skipCount: skipCommands.length
  };
};

// Helper pure functions
const checkSequentialPattern = (messages: readonly Message[]): boolean => {
  // Analyze if user follows suggested order
  return messages.length < 3 || true; // Default to sequential for new users
};

const checkBriefResponsePreference = (messages: readonly Message[]): boolean => {
  if (messages.length === 0) return false;
  const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  return avgLength < 15; // Short responses indicate preference for brevity
};

// Compose canvas change handling
export const handleCanvasChange = (
  event: CanvasChangeEvent,
  canvasState: CanvasState,
  userBehavior: UserBehavior
): string => {
  const acknowledgmentType = determineAcknowledmentType(event);
  const context = createAcknowledmentContext(event, canvasState, userBehavior);
  return generateAcknowledgment(acknowledgmentType, context);
};

// Pure functions for completion analysis
export const analyzeCompletionGaps = (canvasState: CanvasState): readonly CompletionGap[] => {
  const gaps: CompletionGap[] = [];
  
  // Check for missing nodes
  if (canvasState.selectedSource.includes('Dummy')) {
    gaps.push({
      nodeType: 'source',
      gapType: 'missing-node',
      priority: 'high'
    });
  }
  
  if (canvasState.selectedTransform.includes('Dummy')) {
    gaps.push({
      nodeType: 'transform',
      gapType: 'missing-node',
      priority: 'high'
    });
  }
  
  if (canvasState.selectedDestination.includes('Dummy')) {
    gaps.push({
      nodeType: 'destination',
      gapType: 'missing-node',
      priority: 'high'
    });
  }
  
  // Check for missing fields
  const sourceMissingFields = getMissingMandatoryFields('source', canvasState);
  if (sourceMissingFields.length > 0) {
    gaps.push({
      nodeType: 'source',
      gapType: 'missing-fields',
      priority: 'high',
      missingFields: sourceMissingFields
    });
  }
  
  const transformMissingFields = getMissingMandatoryFields('transform', canvasState);
  if (transformMissingFields.length > 0) {
    gaps.push({
      nodeType: 'transform',
      gapType: 'missing-fields',
      priority: 'medium',
      missingFields: transformMissingFields
    });
  }
  
  const destinationMissingFields = getMissingMandatoryFields('destination', canvasState);
  if (destinationMissingFields.length > 0) {
    gaps.push({
      nodeType: 'destination',
      gapType: 'missing-fields',
      priority: 'high',
      missingFields: destinationMissingFields
    });
  }
  
  return gaps;
};

// Helper function to get missing mandatory fields
const getMissingMandatoryFields = (
  nodeType: 'source' | 'transform' | 'destination',
  canvasState: CanvasState
): string[] => {
  const nodeName = nodeType === 'source' ? canvasState.selectedSource :
                   nodeType === 'transform' ? canvasState.selectedTransform :
                   canvasState.selectedDestination;
  
  if (nodeName.includes('Dummy')) return [];
  
  // Special handling for auto-complete transforms
  if (nodeType === 'transform' && ['Map & Validate', 'Cleanse', 'Data Analysis'].includes(nodeName)) {
    return [];
  }
  
  const connector = connectorCatalog[nodeName];
  if (!connector) return [];
  
  const nodeValues = canvasState.nodeValues[nodeType] || {};
  return connector.credentials.mandatory.filter(field => 
    !nodeValues[field] || nodeValues[field]!.trim() === ''
  );
};

// Pure function to prioritize actions
export const prioritizeActions = (
  gaps: readonly CompletionGap[],
  userBehavior: UserBehavior
): readonly CompletionGap[] => {
  return [...gaps].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    // Primary sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Secondary sort by user behavior (prefer sequential if user is sequential)
    if (userBehavior.isSequential) {
      const nodeOrder = { source: 3, transform: 2, destination: 1 };
      return nodeOrder[b.nodeType] - nodeOrder[a.nodeType];
    }
    
    return 0;
  });
};

// Pure function to generate next question based on gaps
export const generateNextQuestion = (
  gaps: readonly CompletionGap[],
  userBehavior: UserBehavior,
  canvasState: CanvasState
): string => {
  if (gaps.length === 0) {
    return "🎉 Perfect! Your data flow is complete. Is there anything else you'd like to adjust?";
  }
  
  const nextGap = gaps[0];
  
  if (nextGap.gapType === 'missing-node') {
    return generateNodeNameQuestion(nextGap.nodeType, userBehavior);
  }
  
  if (nextGap.missingFields && nextGap.missingFields.length > 0) {
    return generateFieldQuestionWithContext(nextGap.nodeType, nextGap.missingFields[0], canvasState, userBehavior);
  }
  
  return userBehavior.prefersBriefResponses ? "What's next?" : "What would you like to configure next?";
};

// Helper functions for question generation
const generateNodeNameQuestion = (
  nodeType: 'source' | 'transform' | 'destination',
  userBehavior: UserBehavior
): string => {
  const examples = getExamplesForNodeType(nodeType);
  
  if (userBehavior.prefersBriefResponses) {
    switch (nodeType) {
      case 'source':
        return `Source system? (e.g., ${examples.slice(0, 2).join(', ')})`;
      case 'transform':
        return "Transformation type? (e.g., Map & Validate, Cleanse)";
      case 'destination':
        return `Destination? (e.g., ${examples.slice(0, 2).join(', ')})`;
    }
  }
  
  switch (nodeType) {
    case 'source':
      return `What system do you want to get data from? For example: ${examples.slice(0, 3).join(', ')}, etc.`;
    case 'transform':
      return "What type of data transformation do you need? For example: Map & Validate, Cleanse, Enrich & Map, etc.";
    case 'destination':
      return `Where do you want to send the data? For example: ${examples.slice(0, 3).join(', ')}, etc.`;
  }
};

const generateFieldQuestionWithContext = (
  nodeType: 'source' | 'transform' | 'destination',
  fieldName: string,
  canvasState: CanvasState,
  userBehavior: UserBehavior
): string => {
  // Get the specific connector name for better context
  const getConnectorName = (nodeType: 'source' | 'transform' | 'destination'): string => {
    switch (nodeType) {
      case 'source':
        return canvasState.selectedSource || 'source';
      case 'destination':
        return canvasState.selectedDestination || 'destination';
      case 'transform':
        return canvasState.selectedTransform || 'transform';
    }
  };
  
  const connectorName = getConnectorName(nodeType);
  const examples = getFieldExamples(fieldName);
  const exampleText = examples ? ` (e.g., ${examples})` : '';
  
  if (userBehavior.prefersBriefResponses) {
    return `${connectorName} ${fieldName}?${exampleText}`;
  }
  
  return `What's your ${connectorName} ${fieldName}?${exampleText}`;
};

// Helper function to get examples for node type (simplified version)
const getExamplesForNodeType = (nodeType: 'source' | 'transform' | 'destination'): string[] => {
  if (nodeType === 'transform') {
    return ['Map & Validate', 'Cleanse', 'Enrich & Map'];
  }
  
  // Popular connectors for examples
  const popularConnectors = [
    'PostgreSQL', 'MySQL', 'Salesforce', 'Shopify', 'Stripe', 
    'Google BigQuery', 'Snowflake', 'Amazon S3', 'Hubspot', 'Mailchimp'
  ];
  
  return popularConnectors;
};

// Helper function to get field examples
const getFieldExamples = (fieldName: string): string | null => {
  const examples: Record<string, string> = {
    host: 'localhost, db.company.com',
    port: '5432, 3306, 1433',
    database: 'users_db, analytics, production',
    username: 'admin, dbuser, readonly',
    apikey: 'sk_live_..., pk_test_...',
    token: 'your-api-token',
    url: 'https://api.company.com',
    endpoint: 'https://webhook.site/...'
  };
  
  return examples[fieldName.toLowerCase()] || null;
};

// Compose intelligent questioning
export const getNextBestQuestion = (
  canvasState: CanvasState,
  userBehavior: UserBehavior
): string => {
  const gaps = analyzeCompletionGaps(canvasState);
  const prioritizedGaps = prioritizeActions(gaps, userBehavior);
  return generateNextQuestion(prioritizedGaps, userBehavior, canvasState);
};
