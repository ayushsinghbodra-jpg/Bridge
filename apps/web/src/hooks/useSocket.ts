"use client";

import { useEffect, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/services/websocket/socket";
import { SOCKET_EVENTS } from "@/services/websocket/socketEvents";
import useSocketStore from "@/store/socketStore";
import useMessageStore from "@/store/messageStore";
import  useAuth  from "@/hooks/useAuth";
import type { Message } from "@bridge/types";

const useSocket = () => {
  const { isAuthenticated } = useAuth();
  const { socket, isConnected, setSocket, setConnected, reset } = useSocketStore();
  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(() => {
    if (!isAuthenticated) return;

    const s = getSocket();
    setSocket(s);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleReceiveMessage = (message: Message) => addMessage(message);

    s.on(SOCKET_EVENTS.CONNECT, handleConnect);
    s.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    s.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      s.off(SOCKET_EVENTS.CONNECT, handleConnect);
      s.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      s.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [isAuthenticated, setSocket, setConnected, addMessage]);

  // Full teardown on logout.
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      reset();
    }
  }, [isAuthenticated, reset]);

  const joinChannel = useCallback(
    (channelId: string) => socket?.emit(SOCKET_EVENTS.JOIN_CHANNEL, { channelId }),
    [socket]
  );

  const leaveChannel = useCallback(
    (channelId: string) => socket?.emit(SOCKET_EVENTS.LEAVE_CHANNEL, { channelId }),
    [socket]
  );

  return { isConnected, joinChannel, leaveChannel };
};

export default useSocket;