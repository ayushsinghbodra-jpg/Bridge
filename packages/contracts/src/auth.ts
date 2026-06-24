import { z } from "zod";
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
});
export type RegisterDto = z.infer<typeof registerSchema>;