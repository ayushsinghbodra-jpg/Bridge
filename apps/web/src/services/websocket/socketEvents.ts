export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  JOIN_CHANNEL: "join_channel",
  LEAVE_CHANNEL: "leave_channel",

  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message", // fixed typo: "recive" → "receive"

  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
} as const;