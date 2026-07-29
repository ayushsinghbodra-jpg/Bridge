import { create } from "zustand";
import type { ChannelResponse } from "@bridge/types";

interface ChannelState {
  channels: ChannelResponse[];
  activeChannel: ChannelResponse | null;
  isLoading: boolean;
  error: string | null;

  setChannels: (channels: ChannelResponse[]) => void;
  addChannel: (channel: ChannelResponse) => void;
  removeChannel: (channelId: string) => void;
  setActiveChannel: (channel: ChannelResponse) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  activeChannel: null,
  isLoading: false,
  error: null,

  setChannels: (channels) => set({ channels }),

  addChannel: (channel) =>
    set((state) => ({ channels: [...state.channels, channel] })),

  removeChannel: (channelId) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
      activeChannel:
        state.activeChannel?.id === channelId ? null : state.activeChannel,
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useChannelStore;