"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import CreateServerModal from "@/components/modals/CreateServerModal";
import JoinServerModal from "@/components/modals/JoinServerModal";
import UserSettingsModal from "@/components/modals/UserSettingsModal";

export default function ServerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { servers, fetchServers, createServer, useInvite, isLoading, error } = useServer();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    void fetchServers();
  }, [fetchServers]);

  const activeServerId = useMemo(() => {
    const match = pathname?.match(/\/servers\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  return (
    <>
      <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-surface-700/80 bg-surface-900/95 px-3 py-3">
        <div className="mb-4 rounded-2xl border border-brand-500/20 bg-brand-500/10 px-3 py-3 shadow-lg shadow-brand-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-300">
                Bridge
              </p>
              <h2 className="text-base font-semibold text-white">Your workspace</h2>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700 bg-surface-800/80 text-lg text-surface-300 transition hover:border-brand-500 hover:text-white"
              aria-label="Create server"
            >
              +
            </button>
          </div>
        </div>

        <nav className="space-y-1 rounded-2xl border border-surface-700/70 bg-surface-950/60 p-2">
          <Link
            href="/dashboard"
            className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/dashboard"
                ? "bg-brand-500/10 text-brand-300"
                : "text-surface-300 hover:bg-surface-800 hover:text-white"
            }`}
          >
            <span className="mr-2 text-base">⌂</span>
            Dashboard
          </Link>
        </nav>

        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-surface-500">
            Servers
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-surface-800/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-300 transition hover:text-white"
            >
              Create
            </button>
            <button
              onClick={() => setJoinOpen(true)}
              className="rounded-md bg-surface-800/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-300 transition hover:text-white"
            >
              Join
            </button>
          </div>
        </div>

        <ul className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {servers.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-surface-700/80 bg-surface-950/60 px-3 py-4 text-sm text-surface-500">
              No servers yet. Create one or join one to get started.
            </li>
          ) : (
            servers.map((server) => {
              const isActive = activeServerId === server.id;
              const initial = server.name?.trim()?.[0]?.toUpperCase() ?? "S";

              return (
                <li key={server.id}>
                  <Link
                    href={`/servers/${server.id}`}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "border-brand-500/30 bg-brand-500/10 text-white"
                        : "border-transparent text-surface-300 hover:border-surface-700/70 hover:bg-surface-800/70 hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                        isActive ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-300"
                      }`}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{server.name}</span>
                        <span className="text-[11px] text-surface-500">{server.memberCount}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        <div className="mt-4 space-y-2 border-t border-surface-700/70 pt-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-surface-300 transition hover:bg-surface-800/70 hover:text-white"
          >
            <span>Settings</span>
            <span className="text-xs text-surface-500">Profile</span>
          </button>
          <button
            onClick={() => void logout().then(() => router.push("/login"))}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <span>Log out</span>
            <span className="text-xs text-surface-500">{user?.username}</span>
          </button>
        </div>
      </aside>

      <CreateServerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void fetchServers()}
        onCreate={(name) => createServer({ name, visibility: "private" })}
        isLoading={isLoading}
        error={error}
      />
      <JoinServerModal
        isOpen={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={() => void fetchServers()}
        onJoin={(inviteCode) => useInvite(inviteCode)}
        isLoading={isLoading}
        error={error}
      />
      <UserSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
