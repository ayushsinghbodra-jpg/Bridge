import api from "@/lib/api";


export const getServers= async ()=>{
    const response =await api.get("/servers");
    return response.data;
}