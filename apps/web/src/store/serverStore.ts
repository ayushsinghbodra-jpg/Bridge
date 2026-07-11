import { create } from "zustand";
import type { Server, Invite } from "@bridge/types";
import type { AsyncState } from "../types/state";

interface ServerMember {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "moderator" | "member";
}

interface ServerState extends AsyncState {
  servers: Server[];
  activeServer: Server | null;
  members: ServerMember[];
  invites: Invite[];
  discoverServers: Server[];
  discoverCursor: string | null;
  discoverHasMore: boolean;

  setServers: (servers: Server[]) => void;
  addServer: (server: Server) => void;
  updateServerInList: (server: Server) => void;
  removeServer: (serverId: string) => void;
  setActiveServer: (server: Server | null) => void;

  setMembers: (members: ServerMember[]) => void;
  addMember: (member: ServerMember) => void;
  removeMember: (memberId: string) => void;

  setInvites: (invites: Invite[]) => void;
  addInvite: (invite: Invite) => void;

  setDiscoverServers: (servers: Server[], nextCursor: string | null) => void;
  appendDiscoverServers: (servers: Server[], nextCursor: string | null) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServer: null,
  members: [],
  invites: [],
  discoverServers: [],
  discoverCursor: null,
  discoverHasMore: true,
  isLoading: false,
  error: null,

  setServers: (servers) => set({ servers }),
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  updateServerInList: (server) =>
    set((state) => ({
      servers: state.servers.map((s) => (s.id === server.id ? server : s)),
      activeServer: state.activeServer?.id === server.id ? server : state.activeServer,
    })),
  removeServer: (serverId) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      activeServer: state.activeServer?.id === serverId ? null : state.activeServer,
    })),
  setActiveServer: (server) => set({ activeServer: server }),

  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  removeMember: (memberId) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== memberId) })),

  setInvites: (invites) => set({ invites }),
  addInvite: (invite) => set((state) => ({ invites: [...state.invites, invite] })),

  setDiscoverServers: (servers, nextCursor) =>
    set({ discoverServers: servers, discoverCursor: nextCursor, discoverHasMore: nextCursor !== null }),
  appendDiscoverServers: (servers, nextCursor) =>
    set((state) => ({
      discoverServers: [...state.discoverServers, ...servers],
      discoverCursor: nextCursor,
      discoverHasMore: nextCursor !== null,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useServerStore;