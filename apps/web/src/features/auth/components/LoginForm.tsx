"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useLogin from "../hooks/useLogin";

const LoginForm = ()=>{
    const { loading , error , handleLogin} = useLogin();

    const [email,setEmail]= useState("");
    const [password , setPassword] = useState("");

    const onSubmit = async (
        e: React.FormEvent
    )=>{
        e.preventDefault();
        await handleLogin(email,password);
    };

    return (
        <form onSubmit={onSubmit} className = "space -y-4">
            <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}
            <Button type = "submit" disabled={loading}>
                {loading ? "Loading..." : " Login "}
            </Button>
        </form>
    );
};

export default LoginForm;