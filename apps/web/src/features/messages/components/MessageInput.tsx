"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => Promise<unknown>;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setContent("");
    setSending(true);
    try {
      await onSend(trimmed);
    } catch {
      // useMessages' send() already rolls back the optimistic message on failure.
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="shrink-0 px-1 pb-2 pt-3">
      <div className="flex items-center gap-2 rounded-2xl border border-surface-700/80 bg-surface-900/80 px-3 py-2.5 shadow-lg shadow-surface-950/30">
        <input
          type="text"
          className="flex-1 bg-transparent text-sm text-white placeholder-surface-500 outline-none"
          placeholder="Message this channel"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;