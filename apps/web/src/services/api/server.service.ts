import { api } from "@/lib/api";
import {
  Server,
  Member,
  Invite,
  CreateServerDto,
  UpdateServerDto,
  CreateInviteDto,
  UpdateNicknameDto,
  TransferOwnershipDto,
  ServerDiscoverPage,
} from "@bridge/types";

export async function getMyServers(): Promise<Server[]> {
  return api.get<Server[]>("/servers/mine");
}

export async function getServer(id: string): Promise<Server> {
  return api.get<Server>(`/servers/${id}`);
}

export async function createServer(data: CreateServerDto): Promise<Server> {
  return api.post<Server>("/servers", data);
}

export async function updateServer(id: string, data: UpdateServerDto): Promise<Server> {
  return api.patch<Server>(`/servers/${id}`, data);
}

export async function deleteServer(id: string): Promise<void> {
  await api.delete(`/servers/${id}`);
}

export async function getMembers(serverId: string): Promise<Member[]> {
  return api.get<Member[]>(`/servers/${serverId}/members`);
}

export async function joinServer(serverId: string): Promise<Member> {
  return api.post<Member>(`/servers/${serverId}/members/join`, {});
}

export async function leaveServer(serverId: string): Promise<void> {
  await api.post(`/servers/${serverId}/members/leave`, {});
}

export async function updateNickname(
  serverId: string,
  data: UpdateNicknameDto
): Promise<Member> {
  return api.patch<Member>(`/servers/${serverId}/members/me`, data);
}

export async function transferOwnership(
  serverId: string,
  data: TransferOwnershipDto
): Promise<Server> {
  return api.post<Server>(`/servers/${serverId}/transfer-ownership`, data);
}

export async function createInvite(serverId: string, data: CreateInviteDto): Promise<Invite> {
  return api.post<Invite>(`/servers/${serverId}/invites`, data);
}

export async function getInviteByCode(code: string): Promise<Invite> {
  return api.get<Invite>(`/invites/${code}`);
}

export async function useInvite(code: string): Promise<Member> {
  return api.post<Member>(`/invites/${code}/use`, {});
}

export async function discoverServers(cursor?: string): Promise<ServerDiscoverPage> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return api.get<ServerDiscoverPage>(`/servers/discover${params}`);
}