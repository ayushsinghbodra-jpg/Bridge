import {z} from "zod";
export const createServerSchema = z.object({
    name: z.string().min(1).max(64),
    iconUrl: z.string().url().optional().nullable(),
});
export type CreateServerDto = z.infer<typeof createServerSchema>;