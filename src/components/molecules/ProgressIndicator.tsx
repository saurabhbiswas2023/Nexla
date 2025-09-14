import { Status } from '../../lib/status';

interface ProgressIndicatorProps {
  completionStatus: {
    source: Status;
    transform: Status;
    destination: Status;
  };
  missingCredentials: {
    source: string[];
    transform: string[];
    destination: string[];
  };
  className?: string;
}

export function ProgressIndicator({
  completionStatus,
  missingCredentials,
  className = '',
}: ProgressIndicatorProps) {
  // Calculate overall progress
  const statusValues: Record<Status, number> = { pending: 0, partial: 0.5, complete: 1, error: 0 };
  const totalProgress = Object.values(completionStatus).reduce(
    (sum, status) => sum + statusValues[status],
    0
  );
  const overallProgress = {
    percentage: Math.round((totalProgress / 3) * 100),
    status: totalProgress === 3 ? 'complete' : totalProgress > 0 ? 'partial' : 'pending',
  };

  // Status configuration for styling
  const statusConfig: Record<
    Status,
    {
      bgColor: string;
      borderColor: string;
      textColor: string;
      icon: string;
      label: string;
    }
  > = {
    pending: {
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-600',
      icon: '⏳',
      label: 'Pending',
    },
    partial: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: '🔄',
      label: 'In Progress',
    },
    complete: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: '✅',
      label: 'Complete',
    },
    error: {
      bgColor: 'bg-red-ultra-light',
      borderColor: 'border-red-ultra-light',
      textColor: 'text-red-700',
      icon: '❌',
      label: 'Error',
    },
  };

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-3 ${className}`}
      data-testid="progress-indicator"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800">Configuration Progress</h3>
        <span className="text-xs text-slate-500">{overallProgress.percentage}% Complete</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${overallProgress.percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {(['source', 'transform', 'destination'] as const).map((nodeType) => {
          const status = completionStatus[nodeType];
          const config = statusConfig[status];
          const missing = missingCredentials[nodeType];

          return (
            <div
              key={nodeType}
              className={`p-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs">{config.icon}</span>
                <span className="text-xs font-medium capitalize text-slate-700">{nodeType}</span>
              </div>
              <div className={`text-xs ${config.textColor} font-medium`}>{config.label}</div>
              {missing.length > 0 && (
                <div className="text-xs text-slate-500 mt-1">{missing.length} missing</div>
              )}
              {missing.length > 0 && (
                <div className="text-xs text-amber-700 mt-1 font-medium">{missing.join(', ')}</div>
              )}
            </div>
          );
        })}
      </div>
      {overallProgress.percentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🎉</span>
            <span className="text-sm font-medium text-green-800">Configuration Complete!</span>
          </div>
          <div className="text-xs text-green-700 mt-1">
            All nodes are configured and ready to deploy.
          </div>
        </div>
      )}
    </div>
  );
}
