import { io, Socket } from 'socket.io-client';

export function createSocketClient(
  baseUrl: string,
  namespace: string,
  token: string,
): Socket {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanNamespace = namespace.startsWith('/') ? namespace : `/${namespace}`;
  const url = `${cleanBase}${cleanNamespace}`;

  const socket = io(url, {
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ['websocket'],
    autoConnect: true,
    forceNew: true,
  });

  return socket;
}

export function waitForEvent<T = any>(
  socket: Socket,
  event: string,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timeout of ${timeoutMs}ms waiting for socket event: "${event}"`));
    }, timeoutMs);

    function handler(data: T) {
      clearTimeout(timer);
      resolve(data);
    }

    socket.once(event, handler);
  });
}
