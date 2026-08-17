import { create } from "zustand";
import { Message } from "@bridge/types";

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;

  setMessages: (messages: Message[], nextCursor: string | null) => void;
  prependMessages: (messages: Message[], nextCursor: string | null) => void;
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingMore: (isLoadingMore: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  nextCursor: null,
  hasMore: true,

  setMessages: (messages, nextCursor) =>
    set({
      messages,
      nextCursor,
      hasMore: nextCursor !== null,
    }),

  prependMessages: (messages, nextCursor) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
      nextCursor,
      hasMore: nextCursor !== null,
    })),

  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: [...state.messages, message],
      };
    }),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setError: (error) => set({ error }),

  clearMessages: () =>
    set({
      messages: [],
      nextCursor: null,
      hasMore: true,
      error: null,
    }),
}));

export default useMessageStore;