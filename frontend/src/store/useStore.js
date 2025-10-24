import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      messages: [],
      currentConversationId: null,
      
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      clearMessages: () => set({ messages: [], currentConversationId: null }),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
    }),
    {
      name: 'adventis-storage',
    }
  )
);

export default useStore;