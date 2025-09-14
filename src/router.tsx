import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';


export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/chat', element: <ChatPage /> },
  
]);
