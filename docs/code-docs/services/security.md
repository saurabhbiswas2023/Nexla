# Security Service

**Input Validation and Security Utilities**

## Overview

The Security Service provides comprehensive input validation, sanitization, and security utilities to protect against common web vulnerabilities including XSS, injection attacks, and data exposure.

## API Interface

```typescript
interface SecurityService {
  sanitizeInput(input: string): string;
  validateInput(key: string, value: string): boolean;
  maskCredential(value: string, visibleChars?: number): string;
  sanitizeQuery(query: string): string;
  validateUrl(url: string): boolean;
  validateEmail(email: string): boolean;
  hashSensitiveData(data: string): string;
}
```

## Usage Examples

### Input Sanitization
```typescript
import { SecurityService } from '@/lib/security';

// Basic input sanitization
const userInput = '<script>alert("xss")</script>Hello World';
const sanitized = SecurityService.sanitizeInput(userInput);
// Result: 'Hello World'

// Field-specific validation
const isValidEmail = SecurityService.validateInput('email', 'user@example.com');
const isValidUrl = SecurityService.validateInput('url', 'https://api.example.com');
```

### Credential Masking
```typescript
// Mask sensitive credentials
const apiKey = 'sk-1234567890abcdef1234567890abcdef';
const masked = SecurityService.maskCredential(apiKey, 4);
// Result: '********************************cdef'

// Mask passwords
const password = 'mySecretPassword123';
const maskedPassword = SecurityService.maskCredential(password, 0);
// Result: '*******************'
```

### URL Validation
```typescript
// Validate URLs for safety
const urls = [
  'https://api.salesforce.com',      // Valid
  'http://localhost:3000',           // Valid (development)
  'javascript:alert("xss")',         // Invalid (XSS)
  'ftp://files.example.com',         // Invalid (not HTTP/HTTPS)
];

urls.forEach(url => {
  const isValid = SecurityService.validateUrl(url);
  console.log(`${url}: ${isValid ? 'SAFE' : 'BLOCKED'}`);
});
```

## Input Sanitization

### XSS Prevention
```typescript
class SecurityService {
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove script tags specifically
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove data: URLs
      .replace(/data:/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  static sanitizeHtml(html: string): string {
    // Allow only safe HTML tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'];
    const tagRegex = /<(\/?)([\w]+)([^>]*)>/g;
    
    return html.replace(tagRegex, (match, closing, tagName, attributes) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        // Remove all attributes for safety
        return `<${closing}${tagName}>`;
      }
      return ''; // Remove disallowed tags
    });
  }
}
```

### SQL Injection Prevention
```typescript
static sanitizeQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }
  
  // List of dangerous SQL keywords
  const dangerousKeywords = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'SCRIPT', 'UNION', 'SELECT', 'TRUNCATE',
    'GRANT', 'REVOKE', 'DECLARE', 'CAST', 'CONVERT'
  ];
  
  let sanitized = query;
  
  // Remove dangerous keywords (case-insensitive)
  dangerousKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove SQL comment patterns
  sanitized = sanitized
    .replace(/--.*$/gm, '')     // Single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
    .replace(/;/g, '')          // Statement terminators
    .trim();
  
  return sanitized;
}
```

## Input Validation

### Field-Specific Validators
```typescript
static validateInput(key: string, value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  const validators: Record<string, (val: string) => boolean> = {
    // Email validation
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && val.length <= 254,
    
    // URL validation
    url: (val) => {
      try {
        const url = new URL(val);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    
    // API key validation
    apiKey: (val) => /^[a-zA-Z0-9_-]{20,}$/.test(val),
    
    // Database connection string validation
    connectionString: (val) => {
      // Basic format validation
      return /^[a-zA-Z]+:\/\//.test(val) && !val.includes('<') && !val.includes('>');
    },
    
    // Port number validation
    port: (val) => {
      const port = parseInt(val, 10);
      return !isNaN(port) && port > 0 && port <= 65535;
    },
    
    // Username validation
    username: (val) => /^[a-zA-Z0-9_.-]{3,50}$/.test(val),
    
    // Required field validation
    required: (val) => val.trim().length > 0,
    
    // Alphanumeric validation
    alphanumeric: (val) => /^[a-zA-Z0-9]+$/.test(val),
    
    // Safe string validation (no special characters)
    safeString: (val) => /^[a-zA-Z0-9\s._-]+$/.test(val)
  };
  
  // Check for field-specific validator
  for (const [pattern, validator] of Object.entries(validators)) {
    if (key.toLowerCase().includes(pattern)) {
      return validator(value);
    }
  }
  
  // Default to required validation
  return validators.required(value);
}
```

### Custom Validation Rules
```typescript
static validateConnectorField(connector: string, field: string, value: string): ValidationResult {
  const rules: Record<string, Record<string, (val: string) => ValidationResult>> = {
    salesforce: {
      baseUrl: (val) => ({
        isValid: val.includes('.salesforce.com') || val.includes('.my.salesforce.com'),
        error: val.includes('.salesforce.com') ? null : 'Must be a valid Salesforce URL'
      }),
      clientId: (val) => ({
        isValid: /^[a-zA-Z0-9._]{15,}$/.test(val),
        error: /^[a-zA-Z0-9._]{15,}$/.test(val) ? null : 'Invalid Salesforce Client ID format'
      })
    },
    
    bigquery: {
      projectId: (val) => ({
        isValid: /^[a-z][a-z0-9-]*[a-z0-9]$/.test(val) && val.length <= 30,
        error: /^[a-z][a-z0-9-]*[a-z0-9]$/.test(val) ? null : 'Invalid BigQuery project ID format'
      }),
      dataset: (val) => ({
        isValid: /^[a-zA-Z0-9_]+$/.test(val) && val.length <= 1024,
        error: /^[a-zA-Z0-9_]+$/.test(val) ? null : 'Dataset name can only contain letters, numbers, and underscores'
      })
    }
  };
  
  const connectorRules = rules[connector.toLowerCase()];
  if (connectorRules && connectorRules[field]) {
    return connectorRules[field](value);
  }
  
  // Default validation
  return {
    isValid: this.validateInput(field, value),
    error: this.validateInput(field, value) ? null : `Invalid ${field} format`
  };
}
```

## Credential Protection

### Masking Sensitive Data
```typescript
static maskCredential(value: string, visibleChars: number = 4): string {
  if (!value || typeof value !== 'string') {
    return '';
  }
  
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  
  const masked = '*'.repeat(value.length - visibleChars);
  const visible = value.slice(-visibleChars);
  return masked + visible;
}

static displayValue(key: string, value: string): string {
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'credential',
    'auth', 'bearer', 'api_key', 'apikey', 'private'
  ];
  
  const isSensitive = sensitiveKeys.some(sensitiveKey => 
    key.toLowerCase().includes(sensitiveKey)
  );
  
  if (isSensitive) {
    return this.maskCredential(value);
  }
  
  return value;
}
```

### Secure Storage Patterns
```typescript
static hashSensitiveData(data: string): string {
  // Simple hash for client-side (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

static generateSecureId(): string {
  // Generate cryptographically secure random ID
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

## Content Security Policy

### CSP Headers
```typescript
static getCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://openrouter.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  };
}
```

## Rate Limiting

### Request Throttling
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();
```

## Error Handling

### Security Error Types
```typescript
export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const SecurityErrors = {
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION: 'SQL_INJECTION',
  INVALID_INPUT: 'INVALID_INPUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNSAFE_URL: 'UNSAFE_URL'
} as const;
```

### Security Logging
```typescript
static logSecurityEvent(event: string, details: Record<string, any>, severity: string = 'medium') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details: {
      ...details,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry);
  }
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    this.sendToSecurityMonitoring(logEntry);
  }
}
```

## Best Practices

### Implementation Guidelines
1. **Defense in Depth**: Multiple layers of security validation
2. **Fail Secure**: Default to denying access when in doubt
3. **Input Validation**: Validate all user inputs at multiple points
4. **Output Encoding**: Encode data when displaying to users
5. **Principle of Least Privilege**: Minimal necessary permissions

### Security Checklist
- [ ] All user inputs sanitized and validated
- [ ] Sensitive data properly masked in UI
- [ ] XSS prevention measures implemented
- [ ] SQL injection protection in place
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive information
- [ ] Logging captures security events

## Implementation

Located at: `src/lib/security.ts`

Provides comprehensive security utilities with input validation, sanitization, credential protection, and security monitoring for robust application security.
