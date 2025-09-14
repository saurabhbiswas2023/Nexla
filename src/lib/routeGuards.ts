/**
 * Route Guard Functions
 * 
 * Contains logic for determining route access permissions
 */

/**
 * Check if user can access the chat page
 * 
 * Current logic: User must have come from landing page with a prefill prompt
 * OR have an active chat session
 */
export function canAccessChat(): boolean {
  // Check if user came from landing page with a prompt
  const hasPrefillPrompt = localStorage.getItem('prefillPrompt') !== null;
  
  // Check if user has an active chat session (existing messages)
  const chatStore = localStorage.getItem('chat-store');
  let hasActiveSession = false;
  
  if (chatStore) {
    try {
      const parsed = JSON.parse(chatStore);
      // Check if there are messages beyond the initial welcome message
      hasActiveSession = parsed.state?.messages?.length > 1;
    } catch {
      // Invalid chat store, treat as no session
      hasActiveSession = false;
    }
  }
  
  return hasPrefillPrompt || hasActiveSession;
}

/**
 * Check if user can access landing page
 * 
 * Landing page is always accessible
 */
export function canAccessLanding(): boolean {
  return true;
}

/**
 * Clear all session data for fresh start
 */
export function clearAllSessionData(): void {
  localStorage.removeItem('prefillPrompt');
  localStorage.removeItem('canvas-store');
  localStorage.removeItem('chat-store');
  localStorage.removeItem('progress-store');
}

/**
 * Create a session token when user starts from landing page
 */
export function createChatSession(prompt: string): void {
  localStorage.setItem('prefillPrompt', prompt);
  // Could add timestamp, session ID, etc. for more sophisticated tracking
}
