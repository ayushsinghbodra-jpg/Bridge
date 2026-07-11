"use client";
import { useParams } from "next/navigation";
import ChannelList from "@/features/channels/components/ChannelList";

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const serverId = params.serverId as string;

  return (
    <div className="flex h-full flex-1 overflow-hidden rounded-[28px] border border-surface-700/60 bg-surface-950/40 shadow-2xl shadow-surface-950/40">
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-surface-700/70 bg-surface-900/85 p-3">
        <ChannelList serverId={serverId} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
