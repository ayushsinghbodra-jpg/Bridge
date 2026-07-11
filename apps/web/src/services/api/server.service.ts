import { api } from "@/lib/api";
import type { CreateServerDto as CreateServerInput, UpdateServerDto as UpdateServerInput, CreateInviteDto as CreateInviteInput } from "@bridge/contracts";
import type { Server, Invite, ServerDiscoverPage } from "@bridge/types";

interface ServerMember {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "moderator" | "member";
}

export async function getMyServers(): Promise<Server[]> {
  return api.get<Server[]>("/servers/mine");
}

export async function getServer(id: string): Promise<Server> {
  return api.get<Server>(`/servers/${id}`);
}

export async function createServer(data: CreateServerInput): Promise<Server> {
  return api.post<Server>("/servers", data);
}

export async function updateServer(id: string, data: UpdateServerInput): Promise<Server> {
  return api.patch<Server>(`/servers/${id}`, data);
}

export async function deleteServer(id: string): Promise<void> {
  await api.delete(`/servers/${id}`);
}

export async function getMembers(serverId: string): Promise<ServerMember[]> {
  return api.get<ServerMember[]>(`/servers/${serverId}/members`);
}

export async function joinServer(serverId: string): Promise<ServerMember> {
  return api.post<ServerMember>(`/servers/${serverId}/members/join`, {});
}

export async function leaveServer(serverId: string): Promise<void> {
  await api.post(`/servers/${serverId}/members/leave`, {});
}

export async function createInvite(serverId: string, data: CreateInviteInput): Promise<Invite> {
  return api.post<Invite>(`/servers/${serverId}/invites`, data);
}

export async function getInviteByCode(code: string): Promise<Invite> {
  return api.get<Invite>(`/invites/${code}`);
}

export async function useInvite(code: string): Promise<ServerMember> {
  return api.post<ServerMember>(`/invites/${code}/use`, {});
}

export async function discoverServers(cursor?: string): Promise<ServerDiscoverPage> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return api.get<ServerDiscoverPage>(`/servers/discover${params}`);
}