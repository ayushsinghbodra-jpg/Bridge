import { api } from "@/lib/api";
import { Channel } from "@bridge/types";
import { CreateChannelDto } from "@bridge/contracts";

export async function getChannels(serverId: string): Promise<Channel[]> {
  return api.get<Channel[]>(`/servers/${serverId}/channels`);
}

export async function createChannel(
  serverId: string,
  data: CreateChannelDto
): Promise<Channel> {
  return api.post<Channel>(`/servers/${serverId}/channels`, data);
}

export async function deleteChannel(serverId: string, channelId: string): Promise<void> {
  await api.delete(`/servers/${serverId}/channels/${channelId}`);
}