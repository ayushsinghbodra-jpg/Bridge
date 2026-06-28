"use client";

import useAuthStore from "@/store/authStore";
import { login as loginServices } from "@/services/api/auth.service";
import { saveToken } from "@/services/storage/authStorage";


const useAuth = ()=>{
    const { user , login , logout , isAuthenticated } = useAuthStore();

    const handlerLogin = async (email: string , password : string )=>{
        const data = await loginServices(email,password);

        login(data.user);
        saveToken(data.token);

        return data;
    };

    return {
        user,
        login: handlerLogin,
        logout,
        isAuthenticated
    };
};



export default useAuth;