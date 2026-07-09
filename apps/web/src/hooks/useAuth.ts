"use client";

import { use, useCallback , useEffect} from "react";
import useAuthStore from "@/store/authStore";
import * as authService from "@/services/api/auth.service";
import { AuthResponse } from "@bridge/contracts";
import { User } from "@bridge/types";
import {getAccessToken ,removeTokens } from "@/services/storage/authStorage"

const useAuth = ()=>{
    const { user, isInitialized , setUser , setInitialized, clearUser , isAuthenticated } = useAuthStore();

    useEffect(()=>{
        let cancelled = false ;
        
        async function checkSession() {
            const token = getAccessToken();
            if(!token){
                setInitialized();
                return;
            }
            try {
                const me = await authService.getMe();
                if(!cancelled){
                    setUser(me);
                }
            }catch {
                removeTokens();
            }finally{
                if(!cancelled){
                    setInitialized();
                }
            }
        }
        if(!isInitialized){
            checkSession();
        }
        return () => {
            cancelled = true;
        };
    },[isInitialized , setUser , setInitialized]);
  const login = useCallback(
    async ({email, password}: {email: string, password: string}) => {
      const data = await authService.login(email, password);
      const mapped: User = mapUserResponse(data.user);
      setUser(mapped);
      return data;
    },
    [setUser]
  );

  const register = useCallback(
    async (input: { username: string; email: string; password: string; displayName?: string }) => {
      const data = await authService.register(input);
      const mapped: User = mapUserResponse(data.user);
      setUser(mapped);
      return data;
    },
    [setUser]
  );

function mapUserResponse(user: AuthResponse["user"]): User {
  return {
    id: user.id,
    username: (user as any).userName ?? (user as any).username ?? "",
    email: user.email,
    avatar: (user as any).avatarUrl ?? (user as any).avatar ?? undefined,
  };
}

  const logout = useCallback(async () => {
    await authService.logout();
    clearUser();
  }, [clearUser]);

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
  };
};

export default useAuth;