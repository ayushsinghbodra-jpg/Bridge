import {z} from "zod";
export const createServerSchema = z.object({
    name: z.string()
    .min(1,"Server name should be at least 1 character")
    .max(64,"Server name should be at most 64 characters"),
    description:z.string()
    .max(512)
    .optional(),
    iconUrl: z.string().url().optional().nullable(),
    visibility: z.enum(["public","private"])
    .default("private"),
});

export const updateServerSchema = z.object({
    name: z.string()
    .min(1,"Server name should be at least 1 character")
    .max(64,"Server name should be at most 64 characters"),
    description:z.string()
    .max(512)
    .optional(),
    iconUrl: z.string().url().optional().nullable(),
    visibility: z.enum(["public","private"])
    .default("private"),
});

export const createInviteSchema = z.object ({
    maxUses : z.number().int().min(1).max(1000).optional().nullable(),
    expiresInHours :z.number().int().min(1).max(720).optional().nullable(),
});

export const updateNicknameSchema = z.object ({
    nickname: z.string().min(1).max(64).optional().nullable(),
});


export const transferOwnershipSchema = z.object({
    newOwnerId : z.string().uuid("Invalid user ID"),
})
export type CreateServerDto = z.infer<typeof createServerSchema>;
export type UpdateServerDto = z.infer<typeof updateServerSchema>;
export type CreateInviteDto = z.infer<typeof createInviteSchema>;
export type UpdateNicknameDto = z.infer<typeof updateNicknameSchema>;
export type TransferOwnershipDto = z.infer<typeof transferOwnershipSchema>;