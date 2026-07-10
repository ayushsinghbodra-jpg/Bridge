export interface ServerMemberSummary {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Server {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  ownerId: string;
  visibility: "public" | "private";
  memberCount: number;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  serverId: string;
  nickname: string | null;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: string;
  user: ServerMemberSummary;
}

export interface Invite {
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

export interface ServerDiscoverPage {
  servers: Server[];
  nextCursor: string | null;
}

// --- DTOs: match the Zod schemas on the backend exactly ---

export interface CreateServerDto {
  name: string;
  description?: string;
  iconUrl?: string | null;
  visibility?: "public" | "private";
}

export interface UpdateServerDto {
  name?: string;
  description?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  visibility?: "public" | "private";
}

export interface CreateInviteDto {
  maxUses?: number | null;
  expiresInHours?: number | null;
}

export interface UpdateNicknameDto {
  nickname?: string | null;
}

export interface TransferOwnershipDto {
  newOwnerId: string;
}