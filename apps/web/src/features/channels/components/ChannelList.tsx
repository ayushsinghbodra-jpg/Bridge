"use client";

import { useMemo } from "react";
import useChannels from "@/hooks/useChannels";
import ChannelItem from "./ChannelItem";

interface ChannelListProps {
  serverId?: string;
}

const ChannelList = ({ serverId }: ChannelListProps) => {
  const resolvedServerId = serverId ?? "";
  const { channels, setActiveChannel, activeChannel } = useChannels(resolvedServerId);

  const textChannels = useMemo(
    () => channels.filter((channel) => channel.type === "text"),
    [channels]
  );
  const voiceChannels = useMemo(
    () => channels.filter((channel) => channel.type === "voice"),
    [channels]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl border border-surface-700/70 bg-surface-950/60 px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-surface-500">
            Channels
          </p>
          <span className="text-xs text-surface-500">{channels.length}</span>
        </div>
        <div className="space-y-1">
          {textChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              onClick={setActiveChannel}
              active={activeChannel?.id === channel.id}
            />
          ))}
        </div>
      </div>

      {voiceChannels.length > 0 ? (
        <div className="rounded-2xl border border-surface-700/70 bg-surface-950/60 px-3 py-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-surface-500">
              Voice
            </p>
            <span className="text-xs text-surface-500">{voiceChannels.length}</span>
          </div>
          <div className="space-y-1">
            {voiceChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                onClick={setActiveChannel}
                active={activeChannel?.id === channel.id}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChannelList;