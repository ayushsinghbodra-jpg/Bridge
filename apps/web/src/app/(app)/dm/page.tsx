"use client";

import Link from "next/link";
import useDm from "@/hooks/useDm";

export default function DMPage() {
  const { conversations } = useDm();

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-surface-700/70 bg-surface-900/60 p-6 shadow-2xl shadow-surface-950/40">
      <div className="mb-5 flex items-center justify-between border-b border-surface-700/70 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Direct Messages</h1>
          <p className="mt-1 text-sm text-surface-400">Pick a conversation to keep chatting.</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-surface-700 bg-surface-800/80 px-3 py-2 text-sm font-medium text-surface-300 transition hover:border-brand-500 hover:text-white"
        >
          New DM
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-surface-700 bg-surface-950/60 p-8 text-center text-surface-400">
          No conversations yet. Start a friendly chat to get things moving.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dm/${conversation.id}`}
              className="flex items-center gap-3 rounded-2xl border border-surface-700/70 bg-surface-950/70 px-3 py-3 transition hover:border-brand-500 hover:bg-surface-800"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {conversation.username[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-white">{conversation.username}</span>
                  {conversation.isOnline && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                </div>
                <p className="truncate text-sm text-surface-400">
                  {conversation.messages.at(-1)?.content ?? "Start a conversation"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}