import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Function to check if access is allowed
   */
  canAccess: () => boolean;
  /**
   * Redirect path if access is denied
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute Atom Component
 *
 * Protects routes from direct access by checking access conditions.
 * This is an ATOM because it:
 * - Has a single responsibility (route protection)
 * - Contains minimal logic
 * - Is highly reusable
 * - No complex UI elements
 *
 * @example
 * ```tsx
 * <ProtectedRoute 
 *   canAccess={() => hasValidSession()}
 *   redirectTo="/"
 * >
 *   <ChatPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ 
  children, 
  canAccess, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!canAccess()) {
      // Clear any existing state that might cause confusion
      localStorage.removeItem('prefillPrompt');
      localStorage.removeItem('canvas-store');
      localStorage.removeItem('chat-store');
      localStorage.removeItem('progress-store');
      
      // Redirect to the specified route
      navigate(redirectTo, { replace: true });
    }
  }, [canAccess, navigate, redirectTo]);

  // Only render children if access is allowed
  if (!canAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
