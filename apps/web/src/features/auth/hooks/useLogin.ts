"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";

const useLogin = () =>{
    const  { login } = useAuth();

    const [loading , setLoading ] = useState(false );
    const [ error , setError] = useState("");
    
    const handleLogin = async (
        email : string ,
        password : string 
    )=>{
        try{
            setLoading ( true );
            setError ("");
            await login(email,password);
        } catch (err) {
            setError("Login failed 🤦‍♂️");
        }finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        handleLogin,
    };
};


export default useLogin;