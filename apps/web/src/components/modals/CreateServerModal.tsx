"use client";

import { useEffect, useState } from "react";

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateServerModal = ({ isOpen, onClose, onCreated }: CreateServerModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition hover:bg-surface-800 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => {
              onCreated();
              onClose();
            }}
            className="btn-primary"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
