"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ reportId }: { reportId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/delete`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-2 py-0.5 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-0.5 rounded bg-surface-hover text-text-secondary hover:text-text transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-text-tertiary hover:text-danger transition-colors p-1 rounded hover:bg-danger/10"
      title="Delete report"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
