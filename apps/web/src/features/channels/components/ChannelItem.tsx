"use client";

import { useParams, useRouter } from "next/navigation";
import type { Channel } from "@bridge/types";

interface ChannelItemProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  active?: boolean;
}

const ChannelItem = ({ channel, onClick, active = false }: ChannelItemProps) => {
  const router = useRouter();
  const params = useParams();
  const serverId = params.serverId as string | undefined;

  const handleClick = () => {
    onClick(channel);
    if (serverId) {
      router.push(`/servers/${serverId}/channels/${channel.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
        active
          ? "border-brand-500/20 bg-brand-500/10 text-white shadow-sm shadow-brand-500/10"
          : "border-transparent bg-surface-800/70 text-surface-300 hover:border-surface-700 hover:bg-surface-700 hover:text-white"
      }`}
    >
      <span className={`text-base ${active ? "text-brand-400" : "text-surface-500"}`}>
        {channel.type === "text" ? "#" : "🔊"}
      </span>
      <span className="truncate font-medium">{channel.name}</span>
    </button>
  );
};

export default ChannelItem;