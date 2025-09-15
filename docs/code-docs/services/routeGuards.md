# Route Guards Service

**Navigation Protection and Session Management**

## Overview

The Route Guards service provides navigation protection by controlling access to different routes based on user session state, flow completion, and application context. It ensures users follow proper navigation flows and maintains application security.

## API Interface

```typescript
interface RouteGuardsService {
  canAccessChat(): boolean;
  canAccessLanding(): boolean;
  createChatSession(prompt: string): void;
  clearAllSessionData(): void;
  hasValidSession(): boolean;
  getSessionData(): SessionData | null;
}
```

## Usage Examples

### Route Protection
```typescript
import { canAccessChat, canAccessLanding } from '@/lib/routeGuards';

// Check if user can access chat page
if (canAccessChat()) {
  // Allow access to chat
  navigate('/chat');
} else {
  // Redirect to landing page
  navigate('/');
}

// Check landing page access
if (canAccessLanding()) {
  // Show landing page
  renderLandingPage();
}
```

### Session Management
```typescript
import { createChatSession, clearAllSessionData } from '@/lib/routeGuards';

// Create new chat session from landing page
const handleSearchSubmit = (prompt: string) => {
  createChatSession(prompt);
  navigate('/chat');
};

// Clear session when returning home
const handleHomeClick = () => {
  clearAllSessionData();
  navigate('/');
};
```

## Access Control Logic

### Chat Page Access
```typescript
export const canAccessChat = (): boolean => {
  // Server-side rendering guard
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // Check for prefill prompt (from landing page)
    const hasPrefillPrompt = localStorage.getItem('prefillPrompt') !== null;
    
    // Check for active chat session
    const chatMessages = useChatStore.getState().messages;
    const hasActiveChatSession = chatMessages && chatMessages.length > 1;
    
    // Check for canvas state (indicates ongoing work)
    const canvasNodes = useCanvasStore.getState().nodes;
    const hasCanvasState = canvasNodes && canvasNodes.length > 0;
    
    // Allow access if any condition is met
    return hasPrefillPrompt || hasActiveChatSession || hasCanvasState;
  } catch (error) {
    console.warn('Error checking chat access:', error);
    return false;
  }
};
```

### Landing Page Access
```typescript
export const canAccessLanding = (): boolean => {
  // Landing page is always accessible
  return true;
};
```

### Admin Access (Future Extension)
```typescript
export const canAccessAdmin = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const userRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');
    
    return userRole === 'admin' && authToken !== null;
  } catch (error) {
    return false;
  }
};
```

## Session Management

### Session Creation
```typescript
export const createChatSession = (prompt: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Store the initial prompt
    localStorage.setItem('prefillPrompt', prompt);
    
    // Create session metadata
    const sessionData = {
      id: generateSessionId(),
      createdAt: Date.now(),
      initialPrompt: prompt,
      lastActivity: Date.now()
    };
    
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    
    // Initialize stores if needed
    const chatStore = useChatStore.getState();
    if (chatStore.messages.length === 0) {
      chatStore.addMessage({
        type: 'ai',
        content: 'Welcome! I\'m here to help you create data flows. What would you like to build?',
        status: 'sent'
      });
    }
  } catch (error) {
    console.error('Error creating chat session:', error);
  }
};
```

### Session Data Management
```typescript
interface SessionData {
  id: string;
  createdAt: number;
  initialPrompt: string;
  lastActivity: number;
  flowState?: 'started' | 'in_progress' | 'completed';
  nodeCount?: number;
}

export const getSessionData = (): SessionData | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const sessionDataStr = localStorage.getItem('sessionData');
    if (!sessionDataStr) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionDataStr) as SessionData;
    
    // Validate session data
    if (!sessionData.id || !sessionData.createdAt) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.warn('Error getting session data:', error);
    return null;
  }
};

export const updateSessionActivity = (): void => {
  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.lastActivity = Date.now();
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }
};
```

### Session Cleanup
```typescript
export const clearAllSessionData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Clear all Zustand stores
    useChatStore.getState().resetStore();
    useCanvasStore.getState().resetStore();
    useProgressStore.getState().resetStore();
    
    // Clear specific localStorage items
    const itemsToClear = [
      'prefillPrompt',
      'sessionData',
      'canvas-store',
      'chat-store',
      'progress-store',
      'flow-store'
    ];
    
    itemsToClear.forEach(item => {
      localStorage.removeItem(item);
    });
    
    // Keep theme preference and other user settings
    // localStorage.getItem('nexla-theme') - preserved
    // localStorage.getItem('userPreferences') - preserved
    
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
};
```

## Session Validation

### Session Expiry
```typescript
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const hasValidSession = (): boolean => {
  const sessionData = getSessionData();
  if (!sessionData) {
    return false;
  }
  
  const now = Date.now();
  const sessionAge = now - sessionData.createdAt;
  const timeSinceActivity = now - sessionData.lastActivity;
  
  // Session expires after 24 hours or 2 hours of inactivity
  const isExpired = sessionAge > SESSION_TIMEOUT || timeSinceActivity > (2 * 60 * 60 * 1000);
  
  if (isExpired) {
    clearAllSessionData();
    return false;
  }
  
  return true;
};
```

### Session Recovery
```typescript
export const recoverSession = (): boolean => {
  if (!hasValidSession()) {
    return false;
  }
  
  try {
    const sessionData = getSessionData();
    const prefillPrompt = localStorage.getItem('prefillPrompt');
    
    if (sessionData && prefillPrompt) {
      // Session is recoverable
      updateSessionActivity();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error recovering session:', error);
    return false;
  }
};
```

## Navigation Hooks

### React Router Integration
```typescript
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useRouteGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check access for protected routes
    if (currentPath === '/chat' && !canAccessChat()) {
      clearAllSessionData();
      navigate('/', { replace: true });
      return;
    }
    
    // Update session activity for valid sessions
    if (hasValidSession()) {
      updateSessionActivity();
    }
  }, [location.pathname, navigate]);
  
  return {
    canAccessChat: canAccessChat(),
    canAccessLanding: canAccessLanding(),
    hasValidSession: hasValidSession()
  };
};
```

### Navigation Utilities
```typescript
export const navigateWithGuard = (path: string, navigate: NavigateFunction): boolean => {
  switch (path) {
    case '/chat':
      if (canAccessChat()) {
        navigate('/chat');
        return true;
      } else {
        navigate('/');
        return false;
      }
    
    case '/':
      navigate('/');
      return true;
    
    default:
      // For unknown routes, redirect to landing
      navigate('/');
      return false;
  }
};
```

## Security Features

### CSRF Protection
```typescript
const generateSessionId = (): string => {
  // Generate cryptographically secure session ID
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateSessionId = (sessionId: string): boolean => {
  // Validate session ID format
  return /^[a-f0-9]{32}$/.test(sessionId);
};
```

### XSS Prevention
```typescript
export const sanitizePrompt = (prompt: string): string => {
  if (typeof prompt !== 'string') {
    return '';
  }
  
  return prompt
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
};
```

## Error Handling

### Route Guard Errors
```typescript
export class RouteGuardError extends Error {
  constructor(
    message: string,
    public code: string,
    public redirectTo: string = '/'
  ) {
    super(message);
    this.name = 'RouteGuardError';
  }
}

export const RouteGuardErrors = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  INVALID_SESSION: 'INVALID_SESSION',
  STORAGE_ERROR: 'STORAGE_ERROR'
} as const;
```

### Error Recovery
```typescript
export const handleRouteGuardError = (error: RouteGuardError, navigate: NavigateFunction): void => {
  console.warn('Route guard error:', error.message);
  
  switch (error.code) {
    case RouteGuardErrors.SESSION_EXPIRED:
      clearAllSessionData();
      navigate('/', { replace: true });
      break;
    
    case RouteGuardErrors.ACCESS_DENIED:
      navigate(error.redirectTo, { replace: true });
      break;
    
    case RouteGuardErrors.INVALID_SESSION:
      clearAllSessionData();
      navigate('/', { replace: true });
      break;
    
    default:
      navigate('/', { replace: true });
  }
};
```

## Testing Support

### Mock Functions
```typescript
export const mockRouteGuards = {
  canAccessChat: vi.fn(() => true),
  canAccessLanding: vi.fn(() => true),
  createChatSession: vi.fn(),
  clearAllSessionData: vi.fn(),
  hasValidSession: vi.fn(() => true)
};

export const resetRouteGuardMocks = (): void => {
  Object.values(mockRouteGuards).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
};
```

## Implementation

Located at: `src/lib/routeGuards.ts`

Provides comprehensive route protection with session management, security features, and error handling for reliable navigation control and user flow management.
