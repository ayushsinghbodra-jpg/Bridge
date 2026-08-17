"use client";

import useAuth from "@/hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex h-16 w-full shrink-0 items-center justify-between border-b border-surface-700/80 bg-surface-900/75 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-semibold text-brand-400 ring-1 ring-brand-500/20">
          B
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-surface-500">
            Bridge
          </p>
          <p className="text-sm font-medium text-white">Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-surface-800 hover:text-white"
          aria-label="Notifications"
        >
          Inbox
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-surface-800 hover:text-white"
          aria-label="Help"
        >
          Help
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-full border border-surface-700 bg-surface-800/80 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-medium text-surface-200">
            {user?.username ?? "Guest"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;