# ProtectedRoute Component

**Atom Component** - Route protection wrapper with access control

## Overview

The ProtectedRoute component provides route-level access control by wrapping protected components and checking access permissions before rendering. It integrates with the route guard system to ensure users follow proper navigation flows.

## Props Interface

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  canAccess: () => boolean;
  redirectTo?: string;
}
```

## Usage Examples

### Basic Protection
```tsx
import { ProtectedRoute } from '@/components/atoms/ProtectedRoute';
import { canAccessChat } from '@/lib/routeGuards';

<ProtectedRoute canAccess={canAccessChat} redirectTo="/">
  <ChatPage />
</ProtectedRoute>
```

### Custom Access Logic
```tsx
<ProtectedRoute 
  canAccess={() => hasValidSession() && isAuthenticated()}
  redirectTo="/login"
>
  <AdminPanel />
</ProtectedRoute>
```

### Multiple Conditions
```tsx
<ProtectedRoute 
  canAccess={() => {
    return hasPermission('chat') && 
           hasValidToken() && 
           !isBlocked();
  }}
>
  <ProtectedContent />
</ProtectedRoute>
```

## Access Control Logic

### Route Guards Integration
```typescript
import { canAccessChat, canAccessLanding } from '@/lib/routeGuards';

// Chat page protection
<ProtectedRoute canAccess={canAccessChat} redirectTo="/">
  <ChatPage />
</ProtectedRoute>

// Admin protection
<ProtectedRoute canAccess={canAccessAdmin} redirectTo="/unauthorized">
  <AdminDashboard />
</ProtectedRoute>
```

### Session Validation
The component works with various access control strategies:
- **Session-based**: Check for valid user sessions
- **Token-based**: Validate authentication tokens
- **Permission-based**: Check user permissions
- **Flow-based**: Ensure proper navigation flow

## Redirect Behavior

### Automatic Redirection
```typescript
useEffect(() => {
  if (!canAccess()) {
    // Clean up state
    clearSessionData();
    
    // Redirect to specified route
    navigate(redirectTo, { replace: true });
  }
}, [canAccess, navigate, redirectTo]);
```

### State Cleanup
Before redirecting, the component:
- Clears relevant localStorage items
- Resets application state
- Prevents state leakage
- Ensures clean navigation

## Loading States

### Access Check Loading
```tsx
if (!canAccess()) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
```

### Seamless Transitions
- **Loading Indicators**: Show loading state during access check
- **Smooth Redirects**: Prevent flash of protected content
- **Error Handling**: Graceful handling of access check failures

## Security Features

### Access Validation
- **Real-time Checks**: Continuous access validation
- **State Monitoring**: Monitor authentication state changes
- **Session Expiry**: Handle session timeout gracefully
- **Permission Changes**: React to permission updates

### Data Protection
```typescript
const clearSessionData = () => {
  // Remove sensitive data
  localStorage.removeItem('authToken');
  localStorage.removeItem('userSession');
  localStorage.removeItem('permissions');
  
  // Clear application state
  resetAllStores();
};
```

## Integration Examples

### Router Integration
```tsx
// In router.tsx
import { ProtectedRoute } from '@/components/atoms/ProtectedRoute';
import { canAccessChat } from '@/lib/routeGuards';

export const router = createBrowserRouter([
  {
    path: '/chat',
    element: (
      <ProtectedRoute canAccess={canAccessChat} redirectTo="/">
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      </ProtectedRoute>
    )
  }
]);
```

### Nested Protection
```tsx
<ProtectedRoute canAccess={canAccessApp}>
  <AppLayout>
    <ProtectedRoute canAccess={canAccessChat}>
      <ChatInterface />
    </ProtectedRoute>
  </AppLayout>
</ProtectedRoute>
```

## Performance Considerations

### Optimization Strategies
- **Memoized Access Checks**: Cache access validation results
- **Lazy Evaluation**: Only check access when needed
- **Efficient Redirects**: Minimize redirect chain length
- **State Cleanup**: Prevent memory leaks

### Error Boundaries
```tsx
<ErrorBoundary fallback={<AccessErrorFallback />}>
  <ProtectedRoute canAccess={canAccess}>
    <ProtectedContent />
  </ProtectedRoute>
</ErrorBoundary>
```

## Accessibility

### Screen Reader Support
- **Loading States**: Announce loading and redirect states
- **Error Messages**: Clear error communication
- **Navigation**: Logical navigation flow
- **Focus Management**: Proper focus handling during redirects

## Implementation

Located at: `src/components/atoms/ProtectedRoute.tsx`

Implements comprehensive access control with security features, performance optimization, and accessibility compliance for reliable route protection.
