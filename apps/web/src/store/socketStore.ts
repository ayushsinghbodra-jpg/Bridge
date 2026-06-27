import { create } from "zustand";

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;

  connect: (socket: WebSocket) => void;
  disconnect: () => void;
}

const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,

  connect: (socket) =>
    set({
      socket,
      isConnected: true,
    }),

  disconnect: () =>
    set({
      socket: null,
      isConnected: false,
    }),
}));

export default useSocketStore;