import type { Message as SharedMessage } from "@bridge/types";

export interface Message extends SharedMessage {
  username?: string;
}