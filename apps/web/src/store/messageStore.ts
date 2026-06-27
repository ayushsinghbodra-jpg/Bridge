import { create } from "zustand";

interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface MessageState {
  messages: Message[];

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const useMessageStore = create<MessageState>((set) => ({
  messages: [],

  setMessages: (messages) =>
    set({
      messages,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () =>
    set({
      messages: [],
    }),
}));

export default useMessageStore;