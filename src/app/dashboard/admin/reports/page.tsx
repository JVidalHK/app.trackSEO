"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const ReportViewer = dynamic(() => import("@/components/report/report-viewer").then((m) => ({ default: m.ReportViewer })), { ssr: false });

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inspecting, setInspecting] = useState<any>(null);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?page=${page}&search=${search}&status=${statusFilter}&sort=created_at&order=desc`);
    const data = await res.json();
    setReports(data.reports || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Reports ({total})</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search domain..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 px-3 text-xs bg-surface border border-border rounded-lg w-40 focus:border-accent focus:outline-none" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-8 px-2 text-xs bg-surface border border-border rounded-lg">
            <option value="">All status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
          <a href="/api/admin/export/reports" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">Export CSV</a>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-text-secondary">
            <th className="text-left font-medium px-3 py-2">Domain</th>
            <th className="text-left font-medium px-3 py-2">User</th>
            <th className="text-center font-medium px-3 py-2">Date</th>
            <th className="text-center font-medium px-3 py-2">Status</th>
            <th className="text-center font-medium px-3 py-2">Score</th>
            <th className="text-center font-medium px-3 py-2">COGS</th>
            <th className="text-center font-medium px-3 py-2">Action</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">Loading...</td></tr>}
            {!loading && reports.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">No reports found</td></tr>}
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface-hover/50">
                <td className="px-3 py-2 font-medium">{r.domain}</td>
                <td className="px-3 py-2 text-text-secondary">{r.user_email || "—"}</td>
                <td className="px-3 py-2 text-center text-text-secondary">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "completed" ? "bg-success/10 text-success" : r.status === "failed" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2 text-center">{r.scores?.overall ?? "—"}</td>
                <td className="px-3 py-2 text-center">{r.cogs_cents ? `$${(r.cogs_cents / 100).toFixed(2)}` : "—"}</td>
                <td className="px-3 py-2 text-center">
                  {r.status === "completed" && r.report_data && (
                    <button onClick={() => setInspecting(r)}
                      className="text-xs text-[#06B6D4] hover:text-[#2563EB] transition-colors">
                      Inspect
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-2 py-1 rounded bg-surface border border-border disabled:opacity-30">Prev</button>
            <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page >= pages} className="px-2 py-1 rounded bg-surface border border-border disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {/* Inspect modal */}
      {inspecting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInspecting(null)} />
          <div className="relative bg-bg border border-border rounded-xl w-[85vw] h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium">{inspecting.domain}</div>
                <div className="text-xs text-text-secondary">{inspecting.user_email} · {new Date(inspecting.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => setInspecting(null)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover">Close</button>
            </div>
            <ReportViewer data={inspecting.report_data} domain={inspecting.domain} date={new Date(inspecting.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} market={inspecting.report_data?.market} />
          </div>
        </div>
      )}
    </div>
  );
}
