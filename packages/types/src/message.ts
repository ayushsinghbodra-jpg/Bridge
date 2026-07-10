export interface MessageAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "moderator" | "member";
}

export interface Message {
  id: string;
  channelId: string;
  author: MessageAuthor;
  content: string;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}