
import { z } from "zod";

export const createServerSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().max(512).optional(),
  iconUrl: z.string().url().optional().nullable(),
  visibility: z.enum(["public", "private"]).default("private"),
});

export const updateServerSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  description: z.string().max(512).optional(),
  iconUrl: z.string().url().optional().nullable(),
  visibility: z.enum(["public", "private"]).default("private"),
});

export const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(1000).optional().nullable(),
  expiresInHours: z.number().int().min(1).max(720).optional().nullable(),
});

export const updateNicknameSchema = z.object({
  nickname: z.string().min(1).max(64).optional().nullable(),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1, "Invalid user ID"),
});

export type CreateServerDto = z.infer<typeof createServerSchema>;
export type UpdateServerDto = z.infer<typeof updateServerSchema>;
export type CreateInviteDto = z.infer<typeof createInviteSchema>;
export type UpdateNicknameDto = z.infer<typeof updateNicknameSchema>;
export type TransferOwnershipDto = z.infer<typeof transferOwnershipSchema>;

export interface Server {
  id: string;
  name: string;
  iconUrl: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface ServerResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  ownerId: string;
  visibility: "PUBLIC" | "PRIVATE";
  memberCount: number;
  createdAt: string;
}

export interface InviteResponse {
  id: string;
  code: string;
  serverId: string;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
  server: {
    id: string;
    name: string;
    iconUrl: string | null;
    memberCount: number;
  };
}

export interface MemberResponse {
  id: string;
  userId: string;
  serverId: string;
  nickname: string | null;
  role: "MEMBER" | "ADMIN" | "MODERATOR" | "OWNER";
  joinedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface ServerDiscoverPage {
  servers: ServerResponse[];
  nextCursor: string | null;
}
