import { create } from 'zustand';
import { useFlowStore } from './flow';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  status?: 'sending' | 'sent' | 'error' | 'thinking';
  createdAt?: number;
};

type ChatState = {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: () => void;
  aiThinking: boolean;
  highlightId: string | null;
};

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [
    {
      id: 'm1',
      type: 'ai',
      content: 'Welcome! I can help you build pipelines. What would you like to connect?',
      status: 'sent',
      createdAt: Date.now(),
    },
  ],
  input: '',
  setInput: (v) => set({ input: v }),
  aiThinking: false,
  highlightId: null,
  send: () => {
    const { input, messages } = get();
    if (!input.trim()) return;
    const userId = crypto.randomUUID();
    const aiId = crypto.randomUUID();
    const userMsg: Message = {
      id: userId,
      type: 'user',
      content: input.trim(),
      status: 'sent',
      createdAt: Date.now(),
    };
    const thinking: Message = {
      id: aiId,
      type: 'ai',
      content: '',
      status: 'thinking',
      createdAt: Date.now(),
    };
    set({
      messages: [...messages, userMsg, thinking],
      input: '',
      aiThinking: true,
      highlightId: userId,
    });
    // Clear highlight shortly after to create a flash effect
    setTimeout(() => set({ highlightId: null }), 900);
    // Build flow immediately from user input
    useFlowStore.getState().buildFromText(input.trim());
    // Simulate AI completion
    setTimeout(() => {
      const finalText =
        'Got it. I will start a draft flow: [Source] → [Transform] → [Destination].';
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === aiId ? { ...m, content: finalText, status: 'sent' } : m
        ),
        aiThinking: false,
      }));
    }, 600);
  },
}));

// Prefill from landing examples on load
if (typeof window !== 'undefined') {
  const prefill = localStorage.getItem('prefillPrompt');
  if (prefill) {
    const userId = crypto.randomUUID();
    const aiId = crypto.randomUUID();
    useChatStore.setState((s) => ({
      messages: [
        ...s.messages,
        { id: userId, type: 'user', content: prefill, status: 'sent', createdAt: Date.now() },
        {
          id: aiId,
          type: 'ai',
          content: 'Great example. I will draft a flow and ask clarifying questions.',
          status: 'sent',
          createdAt: Date.now(),
        },
      ],
    }));
    useFlowStore.getState().buildFromText(prefill);
    localStorage.removeItem('prefillPrompt');
  }
}
