import api from "@/lib/api";

export const login = async (email:string , password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (
    userName : string,
    email: string,
    password: string,
)=>{
    const response =await api.post("/auth/register",{
        userName,
        email,
        password,
    });
    
    return response.data;
};
