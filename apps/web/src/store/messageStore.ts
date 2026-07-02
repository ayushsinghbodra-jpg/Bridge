import { create } from "zustand";
import { Message } from "@bridge/types";


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