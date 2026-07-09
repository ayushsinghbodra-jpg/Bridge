"use client";

import { useCallback, useEffect } from "react";
import useChannelStore from "@/store/channelStore";
import * as channelService from "@/services/api/channel.service";

const useChannels = (serverId: string) => {
  const {
    channels,
    activeChannel,
    isLoading,
    error,
    setChannels,
    addChannel,
    removeChannel,
    setActiveChannel,
    setLoading,
    setError,
  } = useChannelStore();

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await channelService.getChannels(serverId);
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, [serverId, setChannels, setLoading, setError]);

  // Refetch whenever the active server changes.
  useEffect(() => {
    if (serverId) fetchChannels();
  }, [serverId, fetchChannels]);

  const createChannel = useCallback(
    async (data: { name: string; type: "text" | "voice" }) => {
      const channel = await channelService.createChannel(serverId, data);
      addChannel(channel); // optimistic: no refetch needed
      return channel;
    },
    [serverId, addChannel]
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      await channelService.deleteChannel(serverId, channelId);
      removeChannel(channelId); // optimistic: no refetch needed
    },
    [serverId, removeChannel]
  );

  return {
    channels,
    activeChannel,
    isLoading,
    error,
    fetchChannels,
    createChannel,
    deleteChannel,
    setActiveChannel,
  };
};

export default useChannels;