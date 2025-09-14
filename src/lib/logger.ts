/**
 * Professional logging service for Nexla application
 * Handles development debugging and production error reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log debug information (development only)
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (this.isDevelopment) {
      console.log(`🐛 [DEBUG] ${message}`, data ? data : '');
    }
    // Context parameter available for future use
    void context;
  }

  /**
   * Log general information
   */
  info(message: string, data?: unknown, context?: string): void {
    if (this.isDevelopment) {
      console.info(`ℹ️ [INFO] ${message}`, data ? data : '');
    }
    // Context parameter available for future use
    void context;
  }

  /**
   * Log warnings (always logged)
   */
  warn(message: string, data?: unknown, context?: string): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ [WARN] ${message}`, data ? data : '');
    }
    
    // In production, you might want to send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoringService('warn', message, data, context);
    }
  }

  /**
   * Log errors (always logged)
   */
  error(message: string, error?: unknown, context?: string): void {
    if (this.isDevelopment) {
      console.error(`❌ [ERROR] ${message}`, error ? error : '');
    }

    // In production, send to error reporting service
    if (this.isProduction) {
      this.sendToMonitoringService('error', message, error, context);
    }
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number): void {
    if (this.isDevelopment) {
      console.log(`⚡ [PERF] ${operation}: ${duration}ms`);
    }
  }

  /**
   * Send logs to external monitoring service in production
   * Replace with your preferred service (Sentry, LogRocket, etc.)
   */
  private sendToMonitoringService(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: string
  ): void {
    // Example: Send to Sentry, LogRocket, or custom API
    // Sentry.captureException(new Error(message), { extra: data, tags: { context } });
    
    // For now, we'll just prepare the log entry for future use
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };

    // In a real app, you'd send this to your monitoring service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    
    // Prevent unused variable warning - remove this when implementing real service
    void logEntry;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };
