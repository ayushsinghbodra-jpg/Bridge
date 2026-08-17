"use client";

import { useCallback, useEffect } from "react";
import type { User } from "@bridge/types";
import useAuthStore from "@/store/authStore";
import * as authService from "@/services/api/auth.service";
import { getAccessToken, clearTokens } from "@/services/storage/authStorage";
import { reconnectSocket } from "@/services/websocket/socket";

const useAuth = () => {
  const { user, isAuthenticated, isInitialized, setUser, clearUser, setInitialized } =
    useAuthStore();

  // Restore session on first load: if a token exists, fetch the user it belongs to.
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = getAccessToken();
      if (!token) {
        setInitialized();
        return;
      }
      try {
        const me = await authService.getMe();
        if (!cancelled) setUser(me);
      } catch {
        // Token invalid/expired and refresh (if wired into the api client) already failed.
        clearTokens();
      } finally {
        if (!cancelled) setInitialized();
      }
    }

    if (!isInitialized) checkSession();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, setUser, setInitialized]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const data = await authService.login(input.email, input.password);
      setUser(data.user);
      reconnectSocket();
      return data;
    },
    [setUser]
  );

  const register = useCallback(
    async (input: { username: string; email: string; password: string; displayName?: string }) => {
      const data = await authService.register(input);
      setUser(data.user);
      reconnectSocket();
      return data;
    },
    [setUser]
  );

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