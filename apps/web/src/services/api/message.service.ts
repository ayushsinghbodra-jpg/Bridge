import api from "@/lib/axios";

export const getMessage = async (channelId : string)=>{
    const response =  await api.get(`/channels/${channelId}/messages`);
    return response.data;
};


export const sendmessage = async (
    channelId : string,
    content : string,
)=>{
    const response = await api.post(`/channels/${channelId}/messages`,{
        content,
    });
     
    return response.data;
}

