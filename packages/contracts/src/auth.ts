import { z } from "zod";
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: z.string().min(3).max(32),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine((data)=> data.password === data.confirmPassword,{
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export type RegisterDto = z.infer<typeof registerSchema>;