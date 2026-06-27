import { create } from "zustand";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
}

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