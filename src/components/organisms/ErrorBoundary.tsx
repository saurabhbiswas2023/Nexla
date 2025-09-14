import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { logger } from '../../lib/logger';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-ultra-light border-red-ultra-light rounded-xl">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-sm text-red-600 text-center mb-4">
        The flow canvas encountered an error. Please try refreshing the page.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 p-3 bg-red-ultra-light rounded border-red-ultra-light text-xs">
          <summary className="cursor-pointer font-mono">Error Details</summary>
          <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('Flow Canvas Error', { error, errorInfo }, 'error-boundary');

        // In production, you might want to log to an error reporting service
        if (process.env.NODE_ENV === 'production') {
          // logErrorToService(error, errorInfo);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
