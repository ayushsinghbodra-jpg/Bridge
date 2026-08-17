export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  JOIN_CHANNEL: "channel:join",
  LEAVE_CHANNEL: "channel:leave",

  SEND_MESSAGE: "message:send",
  RECEIVE_MESSAGE: "message:new",

  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;