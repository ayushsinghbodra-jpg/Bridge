"use client";

import MessageItem from "./MessageItem";
import useMessageStore from "@/store/messageStore";

const MessageList = () => {
  const { messages } = useMessageStore();

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
};

export default MessageList;