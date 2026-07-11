"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@bridge/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const MessageList = ({ messages, hasMore, isLoadingMore, onLoadMore }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    const isNearTop = el.scrollTop < 100;
    if (isNearTop && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-surface-700/80 bg-surface-900/50 p-8 text-center text-surface-400">
        <div>
          <p className="text-base font-medium text-white">No messages yet</p>
          <p className="mt-1 text-sm">Say hello and start the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-1 overflow-y-auto rounded-2xl border border-surface-700/60 bg-surface-950/70 px-4 py-4"
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;