import { memo } from 'react';
import { useProgressStore } from '../../store/progressStore';

interface ProgressIndicatorProps {
  className?: string;
  showLabels?: boolean;
  showPercentage?: boolean;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  className = '',
  showLabels = true,
  showPercentage = true,
}: ProgressIndicatorProps) {
  const { 
    sourceProgress, 
    transformProgress, 
    destinationProgress, 
    totalProgress, 
    currentStep 
  } = useProgressStore();

  // Calculate segment widths (each segment is 33.33% of total width)
  const segmentWidth = 33.33;
  const sourceWidth = Math.min((sourceProgress / 33.33) * segmentWidth, segmentWidth);
  const transformWidth = Math.min((transformProgress / 33.33) * segmentWidth, segmentWidth);
  const destinationWidth = Math.min((destinationProgress / 33.33) * segmentWidth, segmentWidth);

  return (
    <div className={`progress-indicator ${className}`}>
      {/* Main Progress Bar */}
      <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {/* Source Segment */}
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${sourceWidth}%` }}
        />
        
        {/* Transform Segment */}
        <div 
          className="absolute top-0 h-full bg-purple-500 transition-all duration-500 ease-out"
          style={{ 
            left: `${segmentWidth}%`, 
            width: `${transformWidth}%` 
          }}
        />
        
        {/* Destination Segment */}
        <div 
          className="absolute top-0 h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ 
            left: `${segmentWidth * 2}%`, 
            width: `${destinationWidth}%` 
          }}
        />

        {/* Segment Dividers */}
        <div 
          className="absolute top-0 h-full w-px bg-gray-300"
          style={{ left: `${segmentWidth}%` }}
        />
        <div 
          className="absolute top-0 h-full w-px bg-gray-300"
          style={{ left: `${segmentWidth * 2}%` }}
        />

        {/* Labels */}
        {showLabels && (
          <>
            {/* Source Label */}
            <div 
              className="absolute top-0 h-full flex items-center justify-center text-xs font-medium text-white"
              style={{ left: '0%', width: `${segmentWidth}%` }}
            >
              <span className={`${currentStep === 'source' ? 'animate-pulse' : ''}`}>
                Source
              </span>
            </div>
            
            {/* Transform Label */}
            <div 
              className="absolute top-0 h-full flex items-center justify-center text-xs font-medium text-white"
              style={{ left: `${segmentWidth}%`, width: `${segmentWidth}%` }}
            >
              <span className={`${currentStep === 'transform' ? 'animate-pulse' : ''}`}>
                Transform
              </span>
            </div>
            
            {/* Destination Label */}
            <div 
              className="absolute top-0 h-full flex items-center justify-center text-xs font-medium text-white"
              style={{ left: `${segmentWidth * 2}%`, width: `${segmentWidth}%` }}
            >
              <span className={`${currentStep === 'destination' ? 'animate-pulse' : ''}`}>
                Destination
              </span>
            </div>
          </>
        )}
      </div>

      {/* Progress Percentage */}
      {showPercentage && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Source: {Math.round((sourceProgress / 33.33) * 100)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span>Transform: {Math.round((transformProgress / 33.33) * 100)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Destination: {Math.round((destinationProgress / 33.33) * 100)}%</span>
            </div>
          </div>
          <div className="font-semibold text-gray-800">
            {Math.round(totalProgress)}% Complete
          </div>
        </div>
      )}
    </div>
  );
});

export default ProgressIndicator;