"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useMessageStore from "@/store/messageStore";

const MessageInput = () => {
  const [content, setContent] = useState("");
  const { addMessage } = useMessageStore();

  const handleSend = () => {
    if (!content.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: "temp-user",
      username: "Ayush",
      content,
      createdAt: new Date().toISOString(),
    };

    addMessage(newMessage);
    setContent("");
  };

  return (
    <div className="flex gap-2 p-4 border-t border-gray-700">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
      />

      <Button onClick={handleSend}>
        Send
      </Button>
    </div>
  );
};

export default MessageInput;