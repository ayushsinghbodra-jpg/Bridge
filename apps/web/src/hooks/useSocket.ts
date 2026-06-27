import useSocketStore from "@/store/socketStore";
import { createSocketConnection } from "@/services/websocket/socket";

const useSocket = () => {
  const { socket, connect, disconnect, isConnected } =
    useSocketStore();

  const initializeSocket = () => {
    const ws = createSocketConnection();

    ws.onopen = () => {
      connect(ws);
    };

    ws.onclose = () => {
      disconnect();
    };
  };

  return {
    socket,
    isConnected,
    initializeSocket,
  };
};

export default useSocket;