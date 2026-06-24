import {z} from "zod";
export const CreateServerSchema = z.object({
    name: z.string().min(1).max(64),
    iconUrl: z.string().url().optional().nullable(),
});
export type CreateServerDto = z.infer<typeof CreateServerSchema>;