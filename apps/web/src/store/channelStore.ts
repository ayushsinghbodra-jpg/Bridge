import { create } from "zustand";
import { Channel } from "@bridge/types";

interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;

  setChannels: (channels: Channel[]) => void;
  setActiveChannel: (channel: Channel) => void;
}

const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  activeChannel: null,

  setChannels: (channels) =>
    set({
      channels,
    }),

  setActiveChannel: (channel) =>
    set({
      activeChannel: channel,
    }),
}));

export default useChannelStore;