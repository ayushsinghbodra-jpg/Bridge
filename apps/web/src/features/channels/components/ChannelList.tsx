"use client";

import ChannelItem from "./ChannelItem";
import useChannelStore from "@/store/channelStore";

const ChannelList = () => {
  const {
    channels,
    setActiveChannel,
  } = useChannelStore();

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <ChannelItem
          key={channel.id}
          channel={channel}
          onClick={setActiveChannel}
        />
      ))}
    </div>
  );
};

export default ChannelList;