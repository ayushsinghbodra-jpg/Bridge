"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import useMessages from "@/hooks/useMessages";
import useSocket from "@/hooks/useSocket";
import MessageList from "@/features/messages/components/MessageList";
import MessageInput from "@/features/messages/components/MessageInput";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const { messages, isLoading, isLoadingMore, error, hasMore, loadMore, send } =
    useMessages(channelId);
  const { joinChannel, leaveChannel } = useSocket();

  useEffect(() => {
    joinChannel(channelId);
    return () => {
      leaveChannel(channelId);
    };
  }, [channelId, joinChannel, leaveChannel]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">{error}</div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
      <MessageInput onSend={send} />
    </div>
  );
}