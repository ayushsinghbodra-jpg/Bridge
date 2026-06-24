import { z } from "zod";
export const createChannelSchema = z.object({
    name: z.string().min(1).max(64),
    type: z.enum(["text", "voice"]),
});
export type CreateChannelDto = z.infer<typeof createChannelSchema>;