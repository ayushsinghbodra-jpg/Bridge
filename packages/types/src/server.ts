// @bridge/types

export interface ServerMember {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "moderator" | "member";
}

export interface Server {
  id: string;
  name: string;
  iconUrl: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface CreateServerInput {
  name: string;
  iconUrl?: string;
}

export interface UpdateServerInput {
  name?: string;
  iconUrl?: string | null;
}

export interface Invite {
  code: string;
  serverId: string;
  createdBy: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
}

export interface CreateInviteInput {
  expiresAt?: string | null;
  maxUses?: number | null;
}

export interface ServerDiscoverPage {
  servers: Server[];
  nextCursor: string | null;
}