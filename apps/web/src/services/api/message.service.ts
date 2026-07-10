import { api } from "@/lib/api";
import { Message ,  MessagePage}  from "@bridge/types";
export async function getMessagae(channelId : string , cursor?: string) : Promise<MessagePage>{
    const params = cursor ? `?cursor${cursor}` : null;
    return api.get<MessagePage>(`/channel/{channelId}/messages${params}`);
};

export async function sendMessage(channelId : string, content : string) : Promise<Message> {
    return api.post<Message>(`/channel/${channelId}/messages`,{content})
};