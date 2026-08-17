import {z} from "zod";
import {sharedEnvSchema} from "./shared";

export const serverEnvSchema = sharedEnvSchema.extend({
    PORT : z.coerce.number().default(3000),

    DATABASE_URL : z.string().min(1),

    REDIS_URL : z.string().url().optional(),

    JWT_SECRET : z.string().min(1),

    JWT_REFRESH_SECRET : z.string().min(32),
    
    JWT_ACESS_EXPRESS_IN : z.string().default("15m"),

    JWT_REFRESH_EXPIRES_IN : z.string().default("7d"),
});


