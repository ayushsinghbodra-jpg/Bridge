import { api } from "@/lib/api";
import { Message, MessagePage } from "@bridge/types";

export async function getMessages(channelId: string, cursor?: string): Promise<MessagePage> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return api.get<MessagePage>(`/channels/${channelId}/messages${params}`);
}

export async function sendMessage(channelId: string, content: string): Promise<Message> {
  return api.post<Message>(`/channels/${channelId}/messages`, { content });
}
