import { z } from "zod";

export const CHANNEL_TYPES = ["text", "voice", "announcements"] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const createChannelSchema = z.object({
    name: z.string()
    .min(1,"Channel name is required ")
    .max(64, " Channel name is too long "),
    type: z.enum(CHANNEL_TYPES),
    topic : z.string().max(1024, "Topic is too long").optional(),
});

export const updateChannelSchemma = z.object({
    name : z.string().min(1).max(64).optional(),
    topic : z.string().max(1024).optional().nullable(),
})

export type UpdateChannelDto = z.infer<typeof updateChannelSchemma>;
export type CreateChannelDto = z.infer<typeof createChannelSchema>;