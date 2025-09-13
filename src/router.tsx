import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './routes/LandingPage';
import { ChatPage } from './routes/ChatPage';
import { CanvasTest } from './routes/CanvasTest';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/canvasTest', element: <CanvasTest /> },
]);
