import {z} from "zod";

export const sharedEnvSchema = z.object({
    NODE_ENV : z.enum(["development","test","production"])
    .default("development"),  
})