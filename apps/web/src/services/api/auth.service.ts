import {api} from "@/lib/api";
import { User} from "@bridge/types";
import {AuthResponse } from "@bridge/contracts";
import { saveTokens, getRefreshToken, removeTokens } from "@/services/storage/authStorage";

export async function register (data : {
    username : string ;
    email : string;
    password : string;
    displayName ?: string;
}) : Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register",data);
    saveTokens(response.tokens.accessTokens, response.tokens.refreshTokens);
    return response;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  saveTokens(res.tokens.accessTokens, res.tokens.refreshTokens);
  return res;
}


export async function logout() : Promise<void> {
    const refreshToken = getRefreshToken();
    if(refreshToken)
        await api.post("/auth/logout",{refreshToken}).catch(() => {});
    removeTokens();
};


export async function refreshAccessToken() : Promise<{accessToken : string , refreshToken : string} > {
    const refreshToken = getRefreshToken();

    if(!refreshToken) throw new Error("No refresh token found");
    const response = await api.post<{accessToken : string , refreshToken : string}>("/auth/refresh",{refreshToken});
    saveTokens(response.accessToken, response.refreshToken);
    return response;
};

export async function getMe() : Promise<User> {
    return api.get<User>("/auth/me");
}

export async function updateProfile(data: {
  displayName?: string;
  avatarUrl?: string | null;
}): Promise<User> {
  return api.patch<User>("/auth/me", data);
}
