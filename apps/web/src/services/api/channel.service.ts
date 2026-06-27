import api from "@/lib/axios";

export const getChannels = async (serverId : string)=>{
    const response = await  api.get(`/servers/${serverId}/channels`);
    return response.data;
};
