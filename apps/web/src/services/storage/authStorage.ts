const TOKEN_KEY ="bridge_token";

export const saveToken = (token : string )=>{
    if(typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY,token);
};

export const getToken=()=>{
    if(typeof window === "undefined") return;
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken =() =>{
    if(typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
};

