const TOKEN_KEY ="bridgr_token";

export const saveToken = (token : string )=>{
    localStorage.stemItem(TOKEN_KEY,token);
};

export const getToken=()=>{
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken =() =>{
    localStorage.remove(TOKEN_KEY);
};

