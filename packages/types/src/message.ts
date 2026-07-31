import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content should be at least 1 character").max(4000, "Message content should be at most 4000 characters"),
  replyToId: z.string().cuid("Invalid replyToId").optional(),
});

export const editMessageSchema = z.object({
  content: z.string().min(1, "Message content should be at least 1 character").max(4000, "Message content should be at most 4000 characters"),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type EditMessageDto = z.infer<typeof editMessageSchema>;

export interface MessageAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role?: "owner" | "admin" | "moderator" | "member";
}

export interface ReplyToMessage {
  id: string;
  content: string;
  author: MessageAuthor;
}

export interface MessageResponse {
  id: string;
  channelId: string;
  content: string;
  author: MessageAuthor;
  replyTo: ReplyToMessage | null;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  mentionedUserIds : string[];
}

export interface Message {
  id: string;
  channelId: string;
  author: MessageAuthor;
  content: string;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  pending?: boolean;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}
