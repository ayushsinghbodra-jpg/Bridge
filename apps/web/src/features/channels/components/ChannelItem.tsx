"use client";

import type { Channel } from "@bridge/types";

interface ChannelItemProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

const ChannelItem = ({
  channel,
  onClick,
}: ChannelItemProps) => {
  return (
    <div
      onClick={() => onClick(channel)}
      className="p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer"
    >
      <span className="text-white">
        {channel.type === "text" ? "# " : "🔊 "}
        {channel.name}
      </span>
    </div>
  );
};

export default ChannelItem;