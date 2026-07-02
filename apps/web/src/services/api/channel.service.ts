import api from "@/lib/axios";
import { Channel } from "@bridge/types";
export const getChannels = async (serverId : string): Promise<Channel[]>=>{
    const response = await  api.get<Channel[]>(`/servers/${serverId}/channels`);
    return response.data;
};
