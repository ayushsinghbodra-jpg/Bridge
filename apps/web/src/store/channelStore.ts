import { create } from "zustand";
import { Channel } from "@bridge/types";

interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  isLoading: boolean;
  error: string | null;

  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  setActiveChannel: (channel: Channel) => void;
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
      // If the deleted channel was active, clear it so the UI doesn't
      // point at a channel that no longer exists.
      activeChannel:
        state.activeChannel?.id === channelId ? null : state.activeChannel,
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useChannelStore;