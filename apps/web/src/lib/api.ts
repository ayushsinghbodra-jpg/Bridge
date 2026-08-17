import { API_BASE_URL } from "./constants";
import { getAccessToken } from "@/services/storage/authStorage";

class ApiError extends Error{
    constructor (
      public status : number ,
      message : string,
      public errors ?: Array<{
        field : string , message : string
      }>,
    ) {
      super(message);
      this.name= "ApiError";
    }
};

function sanitizePath(path: string): string {
  if (!path) return "/";

  let clean = String(path).trim();

  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Ignore malformed encoding and keep the original string.
  }

  clean = clean.replace(/[“”‘’]/g, "");
  clean = clean.replace(/^\s+|\s+$/g, "");

  if (!clean) return "/";

  if (clean === "/api") return "/";
  if (clean.startsWith("/api/")) {
    clean = clean.slice("/api".length);
  }

  if (!clean.startsWith("/")) {
    clean = `/${clean}`;
  }

  clean = clean.replace(/\/{2,}/g, "/");
  return clean;
}

async function request<T>(path : string , options : RequestInit = {}) : Promise<T> {
  const normalizedPath = sanitizePath(path);
  const url = `${API_BASE_URL}${normalizedPath}`;

  const token = getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers : {
      "Content-Type" : "application/json",
      ...(token ? {Authorization : `Bearer ${token}`} : {}),
      ...options.headers,
    },
  });

  if(!response.ok){
    const body = await response.json().catch(()=>({
      message : "Request Failed"
    }));
    throw new ApiError(response.status, body.message ?? "Request Failed", body.errors);
  }

  return response.json() as Promise<T>;
};


export const api = {
  get :<T>(path : string ) => request<T>(path),
  post : <T>(path : string , data : unknown) =>{
    return request<T>(path , { method : "POST" ,body : JSON.stringify(data)});
  },
  put : <T>(path: string , data:unknown)=>{
    return request<T>(path , { method : "PUT" ,body : JSON.stringify(data)});
  },
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError };