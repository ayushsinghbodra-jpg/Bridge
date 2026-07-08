import api from "@/lib/api";
import { Channel } from "@bridge/types";
export const getChannels = async (serverId : string): Promise<Channel[]>=>{
    const response = await  api.get<Channel[]>(`/servers/${serverId}/channels`);
    return response.data;
};
