import api from "@/lib/axios";


export const getServers= async ()=>{
    const response =await api.get("/servers");
    return response.data;
}