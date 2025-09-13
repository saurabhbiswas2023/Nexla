/**
 * Security utilities for input validation and sanitization
 */

// JSON Schema for flow configuration validation
export interface FlowConfigurationSchema {
  nodes: {
    source: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
    destination: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
    transform: {
      name: string;
      credentials: Record<string, string | undefined>;
    };
  };
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate API key format (alphanumeric with some special chars)
 */
export function validateApiKey(apiKey: string): boolean {
  const apiKeyRegex = /^[a-zA-Z0-9_\-.]+$/;
  return apiKeyRegex.test(apiKey) && apiKey.length >= 8 && apiKey.length <= 128;
}

/**
 * Validate field value based on field name
 */
export function validateFieldValue(
  fieldName: string,
  value: string
): { isValid: boolean; error?: string } {
  const sanitizedValue = sanitizeInput(value);

  if (sanitizedValue !== value) {
    return { isValid: false, error: 'Input contains potentially unsafe characters' };
  }

  const lowerFieldName = fieldName.toLowerCase();

  if (lowerFieldName.includes('email')) {
    if (!validateEmail(value)) {
      return { isValid: false, error: 'Invalid email format' };
    }
  }

  if (
    lowerFieldName.includes('url') ||
    lowerFieldName.includes('endpoint') ||
    lowerFieldName.includes('host')
  ) {
    if (
      value &&
      !validateUrl(value) &&
      !value.includes('localhost') &&
      !value.match(/^\d+\.\d+\.\d+\.\d+/)
    ) {
      // Allow localhost and IP addresses for development
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  if (lowerFieldName.includes('apikey') || lowerFieldName.includes('token')) {
    if (value && !validateApiKey(value)) {
      return {
        isValid: false,
        error: 'API key must be 8-128 characters, alphanumeric with _ - . allowed',
      };
    }
  }

  // Check for minimum length requirements
  if (value.length > 0 && value.length < 2) {
    return { isValid: false, error: 'Value must be at least 2 characters long' };
  }

  // Check for maximum length
  if (value.length > 500) {
    return { isValid: false, error: 'Value must be less than 500 characters' };
  }

  return { isValid: true };
}

/**
 * Validate and sanitize flow configuration JSON
 */
export function validateFlowConfiguration(config: unknown): {
  isValid: boolean;
  sanitized?: FlowConfigurationSchema;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['Configuration must be a valid object'] };
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.nodes || typeof cfg.nodes !== 'object') {
    return { isValid: false, errors: ['Configuration must have a "nodes" object'] };
  }

  const nodes = cfg.nodes as Record<string, Record<string, unknown>>;
  const requiredNodes = ['source', 'destination', 'transform'];
  for (const nodeType of requiredNodes) {
    if (!nodes[nodeType] || typeof nodes[nodeType] !== 'object') {
      errors.push(`Missing or invalid "${nodeType}" node`);
      continue;
    }

    const node = nodes[nodeType] as Record<string, unknown>;
    if (!node.name || typeof node.name !== 'string') {
      errors.push(`${nodeType} node must have a valid "name" string`);
    }

    if (!node.credentials || typeof node.credentials !== 'object') {
      errors.push(`${nodeType} node must have a "credentials" object`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize the configuration
  const sanitized: FlowConfigurationSchema = {
    nodes: {
      source: {
        name: sanitizeInput((nodes.source as Record<string, unknown>).name as string),
        credentials: {},
      },
      destination: {
        name: sanitizeInput((nodes.destination as Record<string, unknown>).name as string),
        credentials: {},
      },
      transform: {
        name: sanitizeInput((nodes.transform as Record<string, unknown>).name as string),
        credentials: {},
      },
    },
  };

  // Sanitize credentials
  for (const nodeType of requiredNodes) {
    const node = nodes[nodeType] as Record<string, unknown>;
    if (node.credentials) {
      for (const [key, value] of Object.entries(node.credentials)) {
        if (typeof value === 'string') {
          const validation = validateFieldValue(key, value);
          if (validation.isValid) {
            sanitized.nodes[nodeType as keyof typeof sanitized.nodes].credentials[
              sanitizeInput(key)
            ] = sanitizeInput(value);
          } else {
            errors.push(`${nodeType}.${key}: ${validation.error}`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized: errors.length === 0 ? sanitized : undefined,
    errors,
  };
}

/**
 * Mask sensitive credential values for display
 */
export function maskCredentialValue(key: string, value: string): string {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'apikey'];
  const isSensitive = sensitiveFields.some((field) => key.toLowerCase().includes(field));

  if (isSensitive && value) {
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    return (
      value.substring(0, 2) +
      '*'.repeat(Math.min(value.length - 4, 8)) +
      value.substring(value.length - 2)
    );
  }

  return value;
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Allow inline scripts for React
    "style-src 'self' 'unsafe-inline'", // Allow inline styles for Tailwind
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}
