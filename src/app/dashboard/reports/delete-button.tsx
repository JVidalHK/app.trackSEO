"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/delete`, { method: "DELETE" });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } catch {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="text-text-tertiary hover:text-danger transition-colors p-2 -m-1 rounded-lg hover:bg-danger/10"
        title="Delete report"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-bg border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <div className="text-sm font-medium mb-1">Delete this report?</div>
            <div className="text-xs text-text-secondary mb-5">This action cannot be undone. The report and all its data will be permanently removed.</div>
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-9 rounded-lg text-sm font-medium bg-surface border border-border hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-9 rounded-lg text-sm font-medium bg-danger text-white hover:brightness-110 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
