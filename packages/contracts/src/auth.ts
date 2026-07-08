import { z } from "zod";
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
    username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may contain only letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(8, "Please confirm your password").max(128, "Password must be at most 128 characters"),
    displayName: z.string()
    .min(1, "Display name must be at least 1 character")
    .max(64, "Display name must be at most 64 characters")
    .optional(),
}).refine((data)=> data.password === data.confirmPassword,{
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const refreshTokenSchema = z.object({
    refreshToken : z.string()
    .min(1, "Refresh token is required "),
});

export const requestPasswordResetSchema = z.object ({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    token : z.string().min(1, "Reset token is required"),
    newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
})

export type LoginDto = z.infer<typeof loginSchema>;

export type RegisterDto = z.infer<typeof registerSchema>;

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export type RequestPasswordResetDto = z.infer<typeof requestPasswordResetSchema>;   

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export interface AuthTokens {
    acessTokens : string,
    refreshTokens : string,
    expiresIn : number,
}

export interface UserResponse {
    id:string,
    userName : string,
    email : string ,
    displayName : string | null,
    avatarUrl : string | null,
    crateAt : Date,
}

export interface AuthResponse {
    user: UserResponse,
    tokens : AuthTokens,
}