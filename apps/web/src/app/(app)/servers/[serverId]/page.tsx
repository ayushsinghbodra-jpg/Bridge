"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useChannels from "@/hooks/useChannels";

export default function ServerRootPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.serverId as string;
  const { channels, isLoading, error } = useChannels(serverId);

  const firstTextChannel = useMemo(
    () => channels.find((channel) => channel.type === "text"),
    [channels]
  );

  useEffect(() => {
    if (!serverId || isLoading) return;
    if (firstTextChannel) {
      router.replace(`/servers/${serverId}/channels/${firstTextChannel.id}`);
    }
  }, [firstTextChannel, isLoading, router, serverId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-surface-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!firstTextChannel) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-lg rounded-[28px] border border-surface-700/80 bg-surface-900/70 p-8 text-center shadow-2xl shadow-surface-950/40">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-2xl text-brand-400">
            #
          </div>
          <h2 className="text-xl font-semibold text-white">No channels yet</h2>
          <p className="mt-2 text-sm leading-6 text-surface-400">
            This server is ready to use, but it does not have any text channels yet.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
