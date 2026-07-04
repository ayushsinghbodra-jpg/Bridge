"use client";

import { Message } from "../types/message.types";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({
  message,
}: MessageItemProps) => {
  const createdAtLabel = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString()
    : "—";

  return (
    <div className="p-3 border-b border-gray-700">
      <div className="flex gap-2 items-center">
        <span className="font-bold text-white">
          {message.username}
        </span>

        <span className="text-xs text-gray-400">
          {createdAtLabel}
        </span>
      </div>

      <p className="text-gray-200 mt-1">
        {message.content}
      </p>
    </div>
  );
};

export default MessageItem;