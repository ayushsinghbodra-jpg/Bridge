import MainLayout from "@/components/layout/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex h-full flex-col rounded-[28px] border border-surface-700/70 bg-surface-900/60 p-8 shadow-2xl shadow-surface-950/40">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Welcome back</h1>
          </div>
          <div className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-300">
            Online • 4 members
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-surface-700/70 bg-surface-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-surface-500">Today</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Stay connected with your community</h2>
            <p className="mt-3 text-sm leading-6 text-surface-400">
              Jump into your latest server, check your channels, and keep the conversation moving.
            </p>
          </div>
          <div className="rounded-2xl border border-surface-700/70 bg-surface-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-surface-500">Quick actions</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-surface-700 bg-surface-800 px-3 py-1.5 text-sm text-surface-300">
                Browse servers
              </span>
              <span className="rounded-full border border-surface-700 bg-surface-800 px-3 py-1.5 text-sm text-surface-300">
                Join a room
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}