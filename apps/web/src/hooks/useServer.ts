"use client";

import { useCallback } from "react";
import useServerStore from "@/store/serverStore";
import * as serverService from "@/services/api/server.service";
import {
  CreateServerDto,
  UpdateServerDto,
  CreateInviteDto,
  UpdateNicknameDto,
  TransferOwnershipDto,
} from "@bridge/types";

const useServer = () => {
  const {
    servers,
    activeServer,
    members,
    invites,
    discoverServers,
    discoverHasMore,
    isLoading,
    error,
    setServers,
    addServer,
    updateServerInList,
    removeServer,
    setActiveServer,
    setMembers,
    addMember,
    updateMemberInList,
    removeMember,
    setInvites,
    addInvite,
    setDiscoverServers,
    appendDiscoverServers,
    setLoading,
    setError,
  } = useServerStore();

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const fetchServers = useCallback(
    () =>
      withLoading(async () => {
        const data = await serverService.getMyServers();
        setServers(data);
      }),
    [withLoading, setServers]
  );

  const createServer = useCallback(
    (data: CreateServerDto) =>
      withLoading(async () => {
        const server = await serverService.createServer(data);
        addServer(server);
        return server;
      }),
    [withLoading, addServer]
  );

  const updateServer = useCallback(
    (id: string, data: UpdateServerDto) =>
      withLoading(async () => {
        const server = await serverService.updateServer(id, data);
        updateServerInList(server);
        return server;
      }),
    [withLoading, updateServerInList]
  );

  const deleteServer = useCallback(
    (id: string) =>
      withLoading(async () => {
        await serverService.deleteServer(id);
        removeServer(id);
      }),
    [withLoading, removeServer]
  );

  const fetchMembers = useCallback(
    (serverId: string) =>
      withLoading(async () => {
        const data = await serverService.getMembers(serverId);
        setMembers(data);
      }),
    [withLoading, setMembers]
  );

  const joinServer = useCallback(
    (serverId: string) =>
      withLoading(async () => {
        const member = await serverService.joinServer(serverId);
        addMember(member);
        return member;
      }),
    [withLoading, addMember]
  );

  const leaveServer = useCallback(
    (serverId: string) =>
      withLoading(async () => {
        await serverService.leaveServer(serverId);
        removeServer(serverId);
      }),
    [withLoading, removeServer]
  );

  const updateNickname = useCallback(
    (serverId: string, data: UpdateNicknameDto) =>
      withLoading(async () => {
        const member = await serverService.updateNickname(serverId, data);
        updateMemberInList(member);
        return member;
      }),
    [withLoading, updateMemberInList]
  );

  const transferOwnership = useCallback(
    (serverId: string, data: TransferOwnershipDto) =>
      withLoading(async () => {
        const server = await serverService.transferOwnership(serverId, data);
        updateServerInList(server);
        return server;
      }),
    [withLoading, updateServerInList]
  );

  const createInvite = useCallback(
    (serverId: string, data: CreateInviteDto) =>
      withLoading(async () => {
        const invite = await serverService.createInvite(serverId, data);
        addInvite(invite);
        return invite;
      }),
    [withLoading, addInvite]
  );

  const getInviteByCode = useCallback(
    (code: string) => withLoading(() => serverService.getInviteByCode(code)),
    [withLoading]
  );

  const useInvite = useCallback(
    (code: string) =>
      withLoading(async () => {
        const member = await serverService.useInvite(code);
        addMember(member);
        return member;
      }),
    [withLoading, addMember]
  );

  const discoverMore = useCallback(
    (cursor?: string) =>
      withLoading(async () => {
        const page = await serverService.discoverServers(cursor);
        if (cursor) appendDiscoverServers(page.servers, page.nextCursor);
        else setDiscoverServers(page.servers, page.nextCursor);
      }),
    [withLoading, setDiscoverServers, appendDiscoverServers]
  );

  return {
    servers,
    activeServer,
    members,
    invites,
    discoverServers,
    discoverHasMore,
    isLoading,
    error,
    setActiveServer,
    fetchServers,
    createServer,
    updateServer,
    deleteServer,
    fetchMembers,
    joinServer,
    leaveServer,
    updateNickname,
    transferOwnership,
    createInvite,
    getInviteByCode,
    useInvite,
    discoverMore,
  };
};

export default useServer;