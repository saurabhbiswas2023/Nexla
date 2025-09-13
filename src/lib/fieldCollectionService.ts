import { connectorCatalog } from './connectorCatalog';
import type { CanvasState } from '../store/canvasStore';

export interface CollectionStep {
  stepType: 'node-name' | 'mandatory-fields' | 'optional-fields';
  nodeType: 'source' | 'transform' | 'destination';
  systemName?: string; // undefined if collecting node name
  fieldCategory: 'mandatory' | 'optional';
  currentField?: string; // undefined if collecting node name
  remainingFields: string[];
  completedFields: string[];
  allFields?: {
    mandatory: string[];
    optional: string[];
  };
  currentStepIndex: number;
  totalSteps: number;
  question: string;
  canSkip: boolean; // indicates if step can be skipped
  nodeProgress?: {
    mandatoryComplete: boolean;
    mandatoryProgress: { completed: number; total: number };
    optionalProgress: { completed: number; total: number };
  };
}

export interface CollectionState {
  currentStep: CollectionStep | null;
  completedSteps: CollectionStep[];
  nodeStates: {
    source: { name: string | null; isDummy: boolean; fieldsCollected: Record<string, string | undefined> };
    transform: { name: string | null; isDummy: boolean; fieldsCollected: Record<string, string | undefined> };
    destination: { name: string | null; isDummy: boolean; fieldsCollected: Record<string, string | undefined> };
  };
  isComplete: boolean;
}

export interface CanvasAnalysis {
  needsSourceName: boolean;
  needsTransformName: boolean;
  needsDestinationName: boolean;
  needsSourceFields: boolean;
  needsTransformFields: boolean;
  needsDestinationFields: boolean;
  totalStepsNeeded: number;
}

export interface ProcessResult {
  success: boolean;
  nextStep: CollectionStep | null;
  canvasUpdate?: {
    nodeType: 'source' | 'transform' | 'destination';
    updateType: 'node-name' | 'field-value';
    nodeName?: string;
    fieldName?: string;
    fieldValue?: string;
  };
  wasSkipped?: boolean; // indicates if the field was skipped
  error?: string;
}

// Skip command detection
const SKIP_COMMANDS = [
  'skip', 'no', 'none', 'pass', 'next', 'continue', 
  'not needed', 'not required', 'leave empty', 'ignore', 'n/a'
];

export function isSkipCommand(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  return SKIP_COMMANDS.some(cmd => normalized === cmd || normalized.includes(cmd));
}

/**
 * Analyzes canvas state to determine what collection steps are needed
 */
export function analyzeCanvasForCollection(canvasState: CanvasState): CanvasAnalysis {
  const isDummyNode = (nodeName: string): boolean => {
    return nodeName.toLowerCase().includes('dummy');
  };

  const hasEmptyMandatoryFields = (nodeType: 'source' | 'transform' | 'destination', nodeName: string): boolean => {
    if (isDummyNode(nodeName)) return false; // Can't check fields for dummy nodes
    
    const connector = connectorCatalog[nodeName];
    if (!connector) return false;

    const nodeValues = canvasState.nodeValues[nodeType] || {};
    return connector.credentials.mandatory.some(field => !nodeValues[field] || nodeValues[field].trim() === '');
  };

  const analysis: CanvasAnalysis = {
    needsSourceName: isDummyNode(canvasState.selectedSource),
    needsTransformName: isDummyNode(canvasState.selectedTransform),
    needsDestinationName: isDummyNode(canvasState.selectedDestination),
    needsSourceFields: hasEmptyMandatoryFields('source', canvasState.selectedSource),
    needsTransformFields: hasEmptyMandatoryFields('transform', canvasState.selectedTransform),
    needsDestinationFields: hasEmptyMandatoryFields('destination', canvasState.selectedDestination),
    totalStepsNeeded: 0
  };

  // Calculate total steps needed
  analysis.totalStepsNeeded = 
    (analysis.needsSourceName ? 1 : 0) +
    (analysis.needsSourceFields ? 1 : 0) +
    (analysis.needsTransformName ? 1 : 0) +
    (analysis.needsTransformFields ? 1 : 0) +
    (analysis.needsDestinationName ? 1 : 0) +
    (analysis.needsDestinationFields ? 1 : 0);

  return analysis;
}

/**
 * Smart Field Collection Orchestrator
 */
export class FieldCollectionOrchestrator {
  /**
   * Analyzes canvas state and creates initial collection plan
   */
  static createCollectionPlan(canvasState: CanvasState): CollectionState {
    const analysis = analyzeCanvasForCollection(canvasState);
    
    if (analysis.totalStepsNeeded === 0) {
      return {
        currentStep: null,
        completedSteps: [],
        nodeStates: {
          source: { name: canvasState.selectedSource, isDummy: false, fieldsCollected: canvasState.nodeValues.source || {} },
          transform: { name: canvasState.selectedTransform, isDummy: false, fieldsCollected: canvasState.nodeValues.transform || {} },
          destination: { name: canvasState.selectedDestination, isDummy: false, fieldsCollected: canvasState.nodeValues.destination || {} }
        },
        isComplete: true
      };
    }

    const firstStep = this.determineFirstStep(analysis, canvasState);
    
    return {
      currentStep: firstStep,
      completedSteps: [],
      nodeStates: {
        source: { 
          name: analysis.needsSourceName ? null : canvasState.selectedSource, 
          isDummy: analysis.needsSourceName, 
          fieldsCollected: canvasState.nodeValues.source || {} 
        },
        transform: { 
          name: analysis.needsTransformName ? null : canvasState.selectedTransform, 
          isDummy: analysis.needsTransformName, 
          fieldsCollected: canvasState.nodeValues.transform || {} 
        },
        destination: { 
          name: analysis.needsDestinationName ? null : canvasState.selectedDestination, 
          isDummy: analysis.needsDestinationName, 
          fieldsCollected: canvasState.nodeValues.destination || {} 
        }
      },
      isComplete: false
    };
  }

  /**
   * Determines the first collection step based on analysis - Node-Complete Logic
   */
  private static determineFirstStep(analysis: CanvasAnalysis, canvasState: CanvasState): CollectionStep {
    let stepIndex = 1;

    // Priority: Complete Source Node → Complete Transform Node → Complete Destination Node
    
    // SOURCE NODE
    if (analysis.needsSourceName) {
      return this.createNodeNameStep('source', stepIndex, analysis.totalStepsNeeded);
    }
    
    if (analysis.needsSourceFields) {
      return this.createFieldStep('source', canvasState, stepIndex, analysis.totalStepsNeeded);
    }

    // TRANSFORM NODE (only after source is complete)
    if (analysis.needsTransformName) {
      return this.createNodeNameStep('transform', stepIndex, analysis.totalStepsNeeded);
    }
    
    if (analysis.needsTransformFields) {
      return this.createFieldStep('transform', canvasState, stepIndex, analysis.totalStepsNeeded);
    }

    // DESTINATION NODE (only after transform is complete)
    if (analysis.needsDestinationName) {
      return this.createNodeNameStep('destination', stepIndex, analysis.totalStepsNeeded);
    }
    
    if (analysis.needsDestinationFields) {
      return this.createFieldStep('destination', canvasState, stepIndex, analysis.totalStepsNeeded);
    }

    // Should not reach here if analysis is correct
    throw new Error('No collection step determined - this should not happen');
  }

  /**
   * Creates a node name collection step
   */
  private static createNodeNameStep(
    nodeType: 'source' | 'transform' | 'destination',
    stepIndex: number,
    totalSteps: number
  ): CollectionStep {
    return {
      stepType: 'node-name',
      nodeType,
      fieldCategory: 'mandatory',
      remainingFields: [],
      completedFields: [],
      currentStepIndex: stepIndex,
      totalSteps,
      canSkip: false,
      question: this.generateNodeNameQuestion(nodeType)
    };
  }

  /**
   * Creates a field collection step (mandatory or optional)
   */
  private static createFieldStep(
    nodeType: 'source' | 'transform' | 'destination',
    canvasState: CanvasState,
    stepIndex: number,
    totalSteps: number
  ): CollectionStep {
    const systemName = this.getSystemName(nodeType, canvasState);
    const currentValues = canvasState.nodeValues[nodeType] || {};
    const allFields = this.getFieldsForConnector(systemName);
    
    // Check if we need to collect mandatory fields first
    const missingMandatory = this.getMissingFields(allFields.mandatory, currentValues);
    
    if (missingMandatory.length > 0) {
      // Collect mandatory fields
      const completedMandatory = allFields.mandatory.filter(field => 
        currentValues[field] && currentValues[field]?.trim() !== ''
      );
      
      return {
        stepType: 'mandatory-fields',
        nodeType,
        systemName,
        fieldCategory: 'mandatory',
        currentField: missingMandatory[0],
        remainingFields: missingMandatory.slice(1),
        completedFields: completedMandatory,
        allFields,
        currentStepIndex: stepIndex,
        totalSteps,
        canSkip: false,
        question: this.generateMandatoryFieldQuestion(systemName, missingMandatory[0], completedMandatory.length + 1, allFields.mandatory.length),
        nodeProgress: this.calculateNodeProgress(allFields, currentValues)
      };
    } else {
      // Collect optional fields
      const askedOptional = this.getAskedOptionalFields(nodeType, canvasState);
      const unaskedOptional = allFields.optional.filter(field => !askedOptional.includes(field));
      
      if (unaskedOptional.length > 0) {
        const completedOptional = allFields.optional.filter(field => 
          currentValues[field] && currentValues[field]?.trim() !== ''
        );
        
        return {
          stepType: 'optional-fields',
          nodeType,
          systemName,
          fieldCategory: 'optional',
          currentField: unaskedOptional[0],
          remainingFields: unaskedOptional.slice(1),
          completedFields: completedOptional,
          allFields,
          currentStepIndex: stepIndex,
          totalSteps,
          canSkip: true,
          question: this.generateOptionalFieldQuestion(systemName, unaskedOptional[0]),
          nodeProgress: this.calculateNodeProgress(allFields, currentValues)
        };
      }
    }

    // This node is complete, should move to next node
    throw new Error(`Node ${nodeType} appears complete but was marked as needing fields`);
  }

  /**
   * Helper method to get system name for a node type
   */
  private static getSystemName(nodeType: 'source' | 'transform' | 'destination', canvasState: CanvasState): string {
    switch (nodeType) {
      case 'source': return canvasState.selectedSource;
      case 'transform': return canvasState.selectedTransform;
      case 'destination': return canvasState.selectedDestination;
    }
  }

  /**
   * Gets missing fields from a list of required fields
   */
  private static getMissingFields(requiredFields: string[], currentValues: Record<string, string | undefined>): string[] {
    return requiredFields.filter(field => !currentValues[field] || currentValues[field]?.trim() === '');
  }

  /**
   * Gets list of optional fields that have already been asked (including skipped ones)
   * For now, we'll track this in the collection state or use a simple heuristic
   */
  private static getAskedOptionalFields(nodeType: 'source' | 'transform' | 'destination', canvasState: CanvasState): string[] {
    // For now, return empty array - we'll implement proper tracking later
    // This means we'll ask all optional fields each time, but with skip option
    return [];
  }

  /**
   * Calculates node progress for display
   */
  private static calculateNodeProgress(allFields: { mandatory: string[]; optional: string[] }, currentValues: Record<string, string | undefined>) {
    const completedMandatory = allFields.mandatory.filter(field => 
      currentValues[field] && currentValues[field]?.trim() !== ''
    ).length;
    
    const completedOptional = allFields.optional.filter(field => 
      currentValues[field] && currentValues[field]?.trim() !== ''
    ).length;

    return {
      mandatoryComplete: completedMandatory === allFields.mandatory.length,
      mandatoryProgress: { completed: completedMandatory, total: allFields.mandatory.length },
      optionalProgress: { completed: completedOptional, total: allFields.optional.length }
    };
  }

  /**
   * Gets the next collection step after completing current step - Enhanced Node-Complete Logic
   */
  static getNextStep(currentState: CollectionState, canvasState: CanvasState): CollectionStep | null {
    if (!currentState.currentStep) return null;

    const currentStep = currentState.currentStep;
    const currentNodeType = currentStep.nodeType;
    
    // Node-Complete Logic: Finish current node completely before moving to next
    
    // If we just completed a node name, check if we need to collect fields for this node
    if (currentStep.stepType === 'node-name') {
      return this.getNextStepForNode(currentNodeType, canvasState, currentStep.currentStepIndex + 1, currentStep.totalSteps);
    }
    
    // If we just completed a mandatory field, check if there are more mandatory fields for this node
    if (currentStep.stepType === 'mandatory-fields') {
      const systemName = this.getSystemName(currentNodeType, canvasState);
      const currentValues = canvasState.nodeValues[currentNodeType] || {};
      const allFields = this.getFieldsForConnector(systemName);
      const missingMandatory = this.getMissingFields(allFields.mandatory, currentValues);
      
      if (missingMandatory.length > 0) {
        // More mandatory fields to collect for this node
        const completedMandatory = allFields.mandatory.filter(field => 
          currentValues[field] && currentValues[field]?.trim() !== ''
        );
        
        return {
          stepType: 'mandatory-fields',
          nodeType: currentNodeType,
          systemName,
          fieldCategory: 'mandatory',
          currentField: missingMandatory[0],
          remainingFields: missingMandatory.slice(1),
          completedFields: completedMandatory,
          allFields,
          currentStepIndex: currentStep.currentStepIndex + 1,
          totalSteps: currentStep.totalSteps,
          canSkip: false,
          question: this.generateMandatoryFieldQuestion(systemName, missingMandatory[0], completedMandatory.length + 1, allFields.mandatory.length),
          nodeProgress: this.calculateNodeProgress(allFields, currentValues)
        };
      } else {
        // All mandatory fields complete, move to optional fields for this node
        const unaskedOptional = allFields.optional.filter(field => 
          !currentValues[field] || currentValues[field]?.trim() === ''
        );
        
        if (unaskedOptional.length > 0) {
          const completedOptional = allFields.optional.filter(field => 
            currentValues[field] && currentValues[field]?.trim() !== ''
          );
          
          return {
            stepType: 'optional-fields',
            nodeType: currentNodeType,
            systemName,
            fieldCategory: 'optional',
            currentField: unaskedOptional[0],
            remainingFields: unaskedOptional.slice(1),
            completedFields: completedOptional,
            allFields,
            currentStepIndex: currentStep.currentStepIndex + 1,
            totalSteps: currentStep.totalSteps,
            canSkip: true,
            question: this.generateOptionalFieldQuestion(systemName, unaskedOptional[0]),
            nodeProgress: this.calculateNodeProgress(allFields, currentValues)
          };
        }
      }
    }
    
    // If we just completed an optional field, check if there are more optional fields for this node
    if (currentStep.stepType === 'optional-fields' && currentStep.remainingFields.length > 0) {
      const systemName = currentStep.systemName!;
      const currentValues = canvasState.nodeValues[currentNodeType] || {};
      const allFields = currentStep.allFields!;
      
      return {
        stepType: 'optional-fields',
        nodeType: currentNodeType,
        systemName,
        fieldCategory: 'optional',
        currentField: currentStep.remainingFields[0],
        remainingFields: currentStep.remainingFields.slice(1),
        completedFields: currentStep.completedFields,
        allFields,
        currentStepIndex: currentStep.currentStepIndex + 1,
        totalSteps: currentStep.totalSteps,
        canSkip: true,
        question: this.generateOptionalFieldQuestion(systemName, currentStep.remainingFields[0]),
        nodeProgress: this.calculateNodeProgress(allFields, currentValues)
      };
    }
    
    // Current node is complete, move to next node
    return this.getNextIncompleteNode(currentNodeType, canvasState, currentStep.currentStepIndex + 1, currentStep.totalSteps);
  }

  /**
   * Gets the next step for a specific node (after node name is set)
   */
  private static getNextStepForNode(
    nodeType: 'source' | 'transform' | 'destination',
    canvasState: CanvasState,
    stepIndex: number,
    totalSteps: number
  ): CollectionStep | null {
    const systemName = this.getSystemName(nodeType, canvasState);
    const currentValues = canvasState.nodeValues[nodeType] || {};
    const allFields = this.getFieldsForConnector(systemName);
    
    // Check for missing mandatory fields first
    const missingMandatory = this.getMissingFields(allFields.mandatory, currentValues);
    
    if (missingMandatory.length > 0) {
      const completedMandatory = allFields.mandatory.filter(field => 
        currentValues[field] && currentValues[field]?.trim() !== ''
      );
      
      return {
        stepType: 'mandatory-fields',
        nodeType,
        systemName,
        fieldCategory: 'mandatory',
        currentField: missingMandatory[0],
        remainingFields: missingMandatory.slice(1),
        completedFields: completedMandatory,
        allFields,
        currentStepIndex: stepIndex,
        totalSteps,
        canSkip: false,
        question: this.generateMandatoryFieldQuestion(systemName, missingMandatory[0], completedMandatory.length + 1, allFields.mandatory.length),
        nodeProgress: this.calculateNodeProgress(allFields, currentValues)
      };
    }
    
    // No mandatory fields missing, check for optional fields
    const unaskedOptional = allFields.optional.filter(field => 
      !currentValues[field] || currentValues[field]?.trim() === ''
    );
    
    if (unaskedOptional.length > 0) {
      const completedOptional = allFields.optional.filter(field => 
        currentValues[field] && currentValues[field]?.trim() !== ''
      );
      
      return {
        stepType: 'optional-fields',
        nodeType,
        systemName,
        fieldCategory: 'optional',
        currentField: unaskedOptional[0],
        remainingFields: unaskedOptional.slice(1),
        completedFields: completedOptional,
        allFields,
        currentStepIndex: stepIndex,
        totalSteps,
        canSkip: true,
        question: this.generateOptionalFieldQuestion(systemName, unaskedOptional[0]),
        nodeProgress: this.calculateNodeProgress(allFields, currentValues)
      };
    }
    
    // This node is complete, move to next node
    return this.getNextIncompleteNode(nodeType, canvasState, stepIndex, totalSteps);
  }

  /**
   * Gets the next incomplete node after the current one
   */
  private static getNextIncompleteNode(
    currentNodeType: 'source' | 'transform' | 'destination',
    canvasState: CanvasState,
    stepIndex: number,
    totalSteps: number
  ): CollectionStep | null {
    const analysis = analyzeCanvasForCollection(canvasState);
    
    // Move to next node in order: source → transform → destination
    if (currentNodeType === 'source') {
      if (analysis.needsTransformName) {
        return this.createNodeNameStep('transform', stepIndex, totalSteps);
      }
      if (analysis.needsTransformFields) {
        return this.getNextStepForNode('transform', canvasState, stepIndex, totalSteps);
      }
      // Transform complete, check destination
      if (analysis.needsDestinationName) {
        return this.createNodeNameStep('destination', stepIndex, totalSteps);
      }
      if (analysis.needsDestinationFields) {
        return this.getNextStepForNode('destination', canvasState, stepIndex, totalSteps);
      }
    }
    
    if (currentNodeType === 'transform') {
      if (analysis.needsDestinationName) {
        return this.createNodeNameStep('destination', stepIndex, totalSteps);
      }
      if (analysis.needsDestinationFields) {
        return this.getNextStepForNode('destination', canvasState, stepIndex, totalSteps);
      }
    }
    
    // All nodes complete
    return null;
  }

  /**
   * Processes user input for current collection step
   */
  static processInput(input: string, currentStep: CollectionStep): ProcessResult {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      return {
        success: false,
        nextStep: null,
        error: 'Please provide a valid input.'
      };
    }

    // Handle skip commands for optional fields
    if (currentStep.canSkip && isSkipCommand(trimmedInput)) {
      return {
        success: true,
        nextStep: null, // Will be determined by caller
        wasSkipped: true
        // No canvas update for skipped fields
      };
    }

    if (currentStep.stepType === 'node-name') {
      // Validate node name against connector catalog
      const matchingConnector = this.findMatchingConnector(trimmedInput, currentStep.nodeType);
      
      if (!matchingConnector) {
        return {
          success: false,
          nextStep: null,
          error: `I couldn't find a connector matching "${trimmedInput}". Please try a different system name.`
        };
      }

      return {
        success: true,
        nextStep: null, // Will be determined by caller
        canvasUpdate: {
          nodeType: currentStep.nodeType,
          updateType: 'node-name',
          nodeName: matchingConnector
        }
      };
    } else if (currentStep.stepType === 'mandatory-fields' || currentStep.stepType === 'optional-fields') {
      // Field value collection (both mandatory and optional)
      const validationResult = this.validateFieldValue(currentStep.currentField!, trimmedInput);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          nextStep: null,
          error: validationResult.error
        };
      }

      return {
        success: true,
        nextStep: null, // Will be determined by caller
        canvasUpdate: {
          nodeType: currentStep.nodeType,
          updateType: 'field-value',
          fieldName: currentStep.currentField!,
          fieldValue: trimmedInput
        }
      };
    } else {
      // Legacy support for old 'node-fields' stepType
      const validationResult = this.validateFieldValue(currentStep.currentField!, trimmedInput);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          nextStep: null,
          error: validationResult.error
        };
      }

      return {
        success: true,
        nextStep: null, // Will be determined by caller
        canvasUpdate: {
          nodeType: currentStep.nodeType,
          updateType: 'field-value',
          fieldName: currentStep.currentField!,
          fieldValue: trimmedInput
        }
      };
    }
  }

  /**
   * Generates question for node name collection
   */
  private static generateNodeNameQuestion(nodeType: 'source' | 'transform' | 'destination'): string {
    const examples = this.getExamplesForNodeType(nodeType);
    
    switch (nodeType) {
      case 'source':
        return `What system do you want to get data from? For example: ${examples.slice(0, 3).join(', ')}, etc.`;
      case 'transform':
        return `What type of data transformation do you need? For example: Map & Validate, Cleanse, Enrich & Map, etc.`;
      case 'destination':
        return `Where do you want to send the data? For example: ${examples.slice(0, 3).join(', ')}, etc.`;
      default:
        return `Please specify the ${nodeType} system.`;
    }
  }

  /**
   * Generates question for field collection
   */
  private static generateFieldQuestion(nodeType: string, systemName: string, fieldName: string): string {
    const fieldExamples = this.getFieldExamples(fieldName);
    const fieldDescription = this.getFieldDescription(fieldName);
    
    return `What's your ${systemName} ${fieldDescription}?${fieldExamples ? ` (e.g., ${fieldExamples})` : ''}`;
  }

  /**
   * Generates question for mandatory field collection with progress
   */
  private static generateMandatoryFieldQuestion(
    systemName: string, 
    fieldName: string, 
    currentFieldNumber: number, 
    totalMandatoryFields: number
  ): string {
    const fieldExamples = this.getFieldExamples(fieldName);
    const fieldDescription = this.getFieldDescription(fieldName);
    
    return `What's your ${systemName} ${fieldDescription}? (${currentFieldNumber}/${totalMandatoryFields} required fields)${fieldExamples ? ` (e.g., ${fieldExamples})` : ''}`;
  }

  /**
   * Generates question for optional field collection with skip option
   */
  private static generateOptionalFieldQuestion(systemName: string, fieldName: string): string {
    const fieldExamples = this.getFieldExamples(fieldName);
    const fieldDescription = this.getFieldDescription(fieldName);
    
    return `What's your ${systemName} ${fieldDescription}? (Optional - you can type 'skip' to continue)${fieldExamples ? ` (e.g., ${fieldExamples})` : ''}`;
  }

  /**
   * Gets connector fields for a system
   */
  private static getFieldsForConnector(systemName: string): { mandatory: string[]; optional: string[] } {
    const connector = connectorCatalog[systemName];
    return connector ? { 
      mandatory: connector.credentials.mandatory, 
      optional: connector.credentials.optional || [] 
    } : { mandatory: [], optional: [] };
  }

  /**
   * Gets next missing mandatory field for a node
   */
  private static getNextMissingField(nodeType: string, systemName: string, currentValues: Record<string, string | undefined>): string {
    const connector = connectorCatalog[systemName];
    if (!connector) return '';

    return connector.credentials.mandatory.find(field => 
      !currentValues[field] || currentValues[field]?.trim() === ''
    ) || '';
  }

  /**
   * Finds matching connector name from user input
   */
  private static findMatchingConnector(input: string, nodeType: 'source' | 'transform' | 'destination'): string | null {
    const lowerInput = input.toLowerCase();
    
    // Handle transform types specially
    if (nodeType === 'transform') {
      const transformTypes = ['Map & Validate', 'Cleanse', 'Enrich & Map'];
      const match = transformTypes.find(type => 
        type.toLowerCase().includes(lowerInput) || lowerInput.includes(type.toLowerCase())
      );
      return match || null;
    }

    // For source/destination, search connector catalog
    const connectorNames = Object.keys(connectorCatalog);
    
    // Exact match first
    let match = connectorNames.find(name => name.toLowerCase() === lowerInput);
    if (match) return match;

    // Partial match
    match = connectorNames.find(name => 
      name.toLowerCase().includes(lowerInput) || lowerInput.includes(name.toLowerCase())
    );
    if (match) return match;

    // Fuzzy match for common variations
    const commonVariations: Record<string, string> = {
      'sf': 'Salesforce',
      'salesforce': 'Salesforce',
      'bigquery': 'Google BigQuery',
      'bq': 'Google BigQuery',
      'mailchimp': 'Mailchimp',
      'shopify': 'Shopify',
      'postgres': 'PostgreSQL',
      'postgresql': 'PostgreSQL',
      's3': 'Amazon S3',
      'aws s3': 'Amazon S3'
    };

    return commonVariations[lowerInput] || null;
  }

  /**
   * Validates field value
   */
  private static validateFieldValue(fieldName: string, value: string): { isValid: boolean; error?: string } {
    // Basic validation rules
    if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('endpoint')) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return { isValid: false, error: 'URL should start with http:// or https://' };
      }
    }

    if (fieldName.toLowerCase().includes('email')) {
      if (!value.includes('@')) {
        return { isValid: false, error: 'Please provide a valid email address' };
      }
    }

    return { isValid: true };
  }

  /**
   * Gets examples for node type
   */
  private static getExamplesForNodeType(nodeType: 'source' | 'transform' | 'destination'): string[] {
    if (nodeType === 'transform') {
      return ['Map & Validate', 'Cleanse', 'Enrich & Map'];
    }

    const connectorNames = Object.keys(connectorCatalog);
    const filtered = connectorNames.filter(name => {
      const connector = connectorCatalog[name];
      return nodeType === 'source' ? connector.roles.source : connector.roles.destination;
    });

    return filtered.slice(0, 10); // Return first 10 examples
  }

  /**
   * Gets field examples
   */
  private static getFieldExamples(fieldName: string): string | null {
    const examples: Record<string, string> = {
      'baseUrl': 'https://yourcompany.salesforce.com',
      'loginUrl': 'https://yourcompany.salesforce.com',
      'host': 'database.example.com',
      'endpoint': 'https://api.example.com',
      'user': 'john@company.com',
      'username': 'john@company.com',
      'email': 'john@company.com',
      'apiKey': 'sk-1234567890abcdef',
      'token': 'abc123def456',
      'clientId': '3MVG9...',
      'storeDomain': 'mystore.myshopify.com'
    };

    return examples[fieldName] || null;
  }

  /**
   * Gets field description
   */
  private static getFieldDescription(fieldName: string): string {
    const descriptions: Record<string, string> = {
      'baseUrl': 'base URL',
      'loginUrl': 'login URL',
      'host': 'host address',
      'endpoint': 'API endpoint',
      'user': 'username',
      'username': 'username',
      'password': 'password',
      'apiKey': 'API key',
      'token': 'access token',
      'clientId': 'client ID',
      'clientSecret': 'client secret',
      'storeDomain': 'store domain'
    };

    return descriptions[fieldName] || fieldName;
  }
}
