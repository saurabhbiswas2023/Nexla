import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './components/atoms/ProtectedRoute';
import { canAccessChat } from './lib/routeGuards';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));

// Loading component for suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  { 
    path: '/', 
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    )
  },
  { 
    path: '/chat', 
    element: (
      <ProtectedRoute canAccess={canAccessChat} redirectTo="/">
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
]);
