export interface PinnedByUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface PinnedMessageContent {
  id: string;
  content: string;
  createdAt: string;
  author: PinnedByUser;
}

export interface PinnedMessageResponse {
  id: string;
  channelId: string;
  messageId: string;
  pinnedBy: PinnedByUser;
  createdAt: string;
  message: PinnedMessageContent;
}

export interface PinnedMessagesPage {
  messages: PinnedMessageResponse[];
  nextCursor: string | null;
}
