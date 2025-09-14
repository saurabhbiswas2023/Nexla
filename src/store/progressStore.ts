import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { connectorCatalog } from '../lib/connectorCatalog';
import { computeNodeStatus } from '../lib/status';

export interface ProgressState {
  // Individual progress for each step (0-33.33 each)
  sourceProgress: number;
  transformProgress: number;
  destinationProgress: number;
  
  // Total progress (0-100)
  totalProgress: number;
  
  // Current active step
  currentStep: 'source' | 'transform' | 'destination' | 'complete';
  
  // Completion status
  isComplete: boolean;
  
  // Actions
  updateProgress: (progress: {
    source?: number;
    transform?: number;
    destination?: number;
  }) => void;
  
  setCurrentStep: (step: 'source' | 'transform' | 'destination' | 'complete') => void;
  
  calculateFromCanvasState: (canvasState: {
    selectedSource: string;
    selectedTransform: string;
    selectedDestination: string;
    nodeValues: {
      source: Record<string, string | undefined>;
      transform: Record<string, string | undefined>;
      destination: Record<string, string | undefined>;
    };
    transformByType: Record<string, Record<string, string | undefined>>;
  }) => void;
  
  // Reset all progress to initial state
  resetStore: () => void;
}

export const useProgressStore = create<ProgressState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sourceProgress: 0,
      transformProgress: 0,
      destinationProgress: 0,
      totalProgress: 0,
      currentStep: 'source',
      isComplete: false,

      // Update individual progress values
      updateProgress: (progress) => {
        const current = get();
        const newSourceProgress = progress.source ?? current.sourceProgress;
        const newTransformProgress = progress.transform ?? current.transformProgress;
        const newDestinationProgress = progress.destination ?? current.destinationProgress;
        
        const newTotalProgress = newSourceProgress + newTransformProgress + newDestinationProgress;
        const isComplete = newTotalProgress >= 100;
        
        // Determine current step based on progress
        let currentStep: 'source' | 'transform' | 'destination' | 'complete' = 'source';
        if (isComplete) {
          currentStep = 'complete';
        } else if (newSourceProgress < 33.33) {
          currentStep = 'source';
        } else if (newTransformProgress < 33.33) {
          currentStep = 'transform';
        } else {
          currentStep = 'destination';
        }

        set({
          sourceProgress: newSourceProgress,
          transformProgress: newTransformProgress,
          destinationProgress: newDestinationProgress,
          totalProgress: Math.min(newTotalProgress, 100),
          currentStep,
          isComplete,
        });
      },

      // Set current active step
      setCurrentStep: (step) => set({ currentStep: step }),

      // Calculate progress from canvas state
      calculateFromCanvasState: (canvasState) => {
        const sourceProgress = calculateSourceProgress(
          canvasState.selectedSource,
          canvasState.nodeValues.source
        );
        
        const transformProgress = calculateTransformProgress(
          canvasState.selectedTransform,
          canvasState.nodeValues.transform,
          canvasState.transformByType[canvasState.selectedTransform] || {}
        );
        
        const destinationProgress = calculateDestinationProgress(
          canvasState.selectedDestination,
          canvasState.nodeValues.destination
        );

        get().updateProgress({
          source: sourceProgress,
          transform: transformProgress,
          destination: destinationProgress,
        });
      },
      
      // Reset all progress to initial state (for landing page navigation)
      resetStore: () => {
        set({
          sourceProgress: 0,
          transformProgress: 0,
          destinationProgress: 0,
          totalProgress: 0,
          currentStep: 'source',
          isComplete: false,
        }, false, 'resetStore');
      },
    }),
    {
      name: 'progress-store',
    }
  )
);

// Helper functions to calculate progress for each step based on mandatory field completion
function calculateSourceProgress(selectedSource: string, nodeValues: Record<string, string | undefined>): number {
  // DUMMY NODES MUST ALWAYS BE 0% - NEVER PROGRESS
  if (selectedSource === 'Dummy Source') return 0;
  
  const connector = connectorCatalog[selectedSource];
  if (!connector) {
    // Non-catalog connector selected but no fields to check = 50% (selected but unknown requirements)
    return 16.65;
  }
  
  // Calculate based on mandatory fields completion ratio
  const mandatory = connector.credentials.mandatory;
  if (mandatory.length === 0) {
    // No mandatory fields required = 100% complete when selected
    return 33.33;
  }
  
  const filledFields = mandatory.filter(field => 
    nodeValues[field] && nodeValues[field]!.trim() !== ''
  );
  
  // Calculate percentage: (filled / total) * 33.33%
  const completionRatio = filledFields.length / mandatory.length;
  return completionRatio * 33.33;
}

function calculateTransformProgress(
  selectedTransform: string, 
  nodeValues: Record<string, string | undefined>,
  transformByType: Record<string, string | undefined>
): number {
  // DUMMY NODES MUST ALWAYS BE 0% - NEVER PROGRESS
  if (selectedTransform === 'Dummy Transform') return 0;
  
  // For transforms, use the actual values (prefer transformByType)
  const actualValues = Object.keys(transformByType).length > 0 ? transformByType : nodeValues;
  
  // Use the same logic as computeNodeStatus for transforms
  const status = computeNodeStatus('transform', selectedTransform, [], actualValues as Record<string, string>);
  
  // Convert status to progress
  switch (status) {
    case 'pending': return 16.65; // Selected but needs configuration
    case 'partial': return 24.99; // Partially configured
    case 'complete': return 33.33; // Fully configured
    case 'error': return 0;
    default: return 16.65;
  }
}

function calculateDestinationProgress(selectedDestination: string, nodeValues: Record<string, string | undefined>): number {
  // DUMMY NODES MUST ALWAYS BE 0% - NEVER PROGRESS
  if (selectedDestination === 'Dummy Destination') return 0;
  
  const connector = connectorCatalog[selectedDestination];
  if (!connector) {
    // Non-catalog connector selected but no fields to check = 50% (selected but unknown requirements)
    return 16.65;
  }
  
  // Calculate based on mandatory fields completion ratio
  const mandatory = connector.credentials.mandatory;
  if (mandatory.length === 0) {
    // No mandatory fields required = 100% complete when selected
    return 33.33;
  }
  
  const filledFields = mandatory.filter(field => 
    nodeValues[field] && nodeValues[field]!.trim() !== ''
  );
  
  // Calculate percentage: (filled / total) * 33.33%
  const completionRatio = filledFields.length / mandatory.length;
  return completionRatio * 33.33;
}
