import type { AuthResponse } from "@bridge/types";
import type { User } from "@bridge/types";
import { api } from "@/lib/api";
import { saveTokens, getRefreshToken, clearTokens } from "@/services/storage/authStorage";

export async function register(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  saveTokens(res.tokens.accessToken, res.tokens.refreshToken);
  return res;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  saveTokens(res.tokens.accessToken, res.tokens.refreshToken);
  return res;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    // Best-effort: invalidate server-side session, but never block local logout on it.
    await api.post("/auth/logout", { refreshToken }).catch(() => {});
  }
  clearTokens();
}

export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await api.post<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    { refreshToken }
  );
  saveTokens(res.accessToken, res.refreshToken);
  return res;
}

export async function getMe(): Promise<User> {
  return api.get<User>("/auth/me");
}

export async function updateProfile(data: {
  displayName?: string;
  avatarUrl?: string | null;
}): Promise<User> {
  return api.patch<User>("/auth/me", data);
}