"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useDm from "@/hooks/useDm";

export default function DMChatPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { conversations, selectConversation, sendMessage } = useDm();
  const [draft, setDraft] = useState("");

  const conversation = useMemo(
    () => conversations.find((entry) => entry.id === userId) ?? null,
    [conversations, userId]
  );

  useEffect(() => {
    if (userId) {
      selectConversation(userId);
    }
  }, [selectConversation, userId]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-surface-700 bg-surface-900/60 p-6 text-center text-surface-400">
        This conversation is unavailable right now.
      </div>
    );
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    sendMessage(userId, trimmed);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-surface-700/70 bg-surface-900/60 shadow-2xl shadow-surface-950/40">
      <div className="border-b border-surface-700/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {conversation.username[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{conversation.username}</p>
            <p className="text-sm text-surface-400">{conversation.isOnline ? "Online" : "Away"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-950/40 px-4 py-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-surface-700 bg-surface-950/60 px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-xl text-brand-400">
              ✉
            </div>
            <p className="text-sm font-medium text-white">Start the conversation</p>
            <p className="mt-1 max-w-xs text-sm text-surface-400">Send a friendly message to get the thread going.</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${message.sender === "me" ? "bg-brand-500 text-white" : "bg-surface-800 text-surface-200"}`}>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-surface-700/70 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-surface-700/80 bg-surface-900/80 px-3 py-2 shadow-lg shadow-surface-950/30">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${conversation.username}`}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-surface-500"
          />
          <button type="button" onClick={handleSend} className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}