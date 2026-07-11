"use client";

import { useEffect, useState } from "react";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal = ({ isOpen, onClose }: UserSettingsModalProps) => {
  const [displayName, setDisplayName] = useState("Bridge User");

  useEffect(() => {
    if (!isOpen) {
      setDisplayName("Bridge User");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-surface-700/80 bg-surface-900/95 p-6 shadow-2xl shadow-surface-950/70">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">User settings</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Profile preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-surface-400 transition hover:bg-surface-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl border border-surface-700/70 bg-surface-950/70 p-4">
          <label className="block text-sm font-medium text-surface-300">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="input-field mt-2"
            />
          </label>
          <div className="mt-4 rounded-xl border border-surface-700/70 bg-surface-900/80 px-3 py-3 text-sm text-surface-400">
            These controls are visual placeholders for now. The existing hooks continue to own the real data flow.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-surface-800 hover:text-white">
            Close
          </button>
          <button onClick={onClose} className="btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
