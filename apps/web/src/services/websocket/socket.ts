import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/constants";
import { getAccessToken } from "@/services/storage/authStorage";

const socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const token = getAccessToken();

  socket = io(`${socketBaseUrl}/chat`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Call after login/token refresh, so a fresh connection picks up the new token
// instead of an existing connection silently carrying a stale one.
export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}