"use client";

import type { Message } from "@bridge/types";

interface MessageItemProps {
  message: Message;
}

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MessageItem = ({ message }: MessageItemProps) => {
  const displayName = message.author.displayName ?? message.author.username;

  return (
    <div className="group flex gap-3 rounded-2xl px-2 py-2 transition hover:bg-surface-800/40">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(
          message.author.id
        )}`}
      >
        {displayName[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="text-[11px] text-surface-500">{formatTime(message.createdAt)}</span>
          {message.editedAt && <span className="text-[11px] text-surface-600">(edited)</span>}
        </div>
        <p className="mt-0.5 break-words text-sm leading-6 text-surface-200">
          {message.deleted ? <em className="text-surface-500">Message deleted</em> : message.content}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;