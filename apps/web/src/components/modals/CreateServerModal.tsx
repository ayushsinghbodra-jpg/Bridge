"use client";

import { useEffect, useState } from "react";

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  onCreate: (name: string) => Promise<unknown>;
  isLoading?: boolean;
  error?: string | null;
}

const CreateServerModal = ({
  isOpen,
  onClose,
  onCreated,
  onCreate,
  isLoading = false,
  error = null,
}: CreateServerModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || isLoading) return;

    const server = await onCreate(trimmed);
    if (server) {
      onCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-surface-700/80 bg-surface-900/95 p-6 shadow-2xl shadow-surface-950/70">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">Create server</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Bring your community together</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-surface-400 transition hover:bg-surface-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 block text-sm font-medium text-surface-300">
          Server name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My server"
            className="input-field mt-2"
            disabled={isLoading}
          />
        </label>

        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-surface-800 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => void handleCreate()}
            disabled={isLoading || !name.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
