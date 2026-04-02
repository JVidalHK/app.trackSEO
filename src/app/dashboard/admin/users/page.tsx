"use client";

import { useState, useEffect, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${page}&search=${search}&sort=${sort}&order=${order}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, sort, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  function toggleSort(col: string) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("desc"); }
  }

  async function updateCredits(userId: string, credits: number) {
    await fetch("/api/admin/users/credits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, credits }),
    });
    fetchUsers();
  }

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    await fetch("/api/admin/users/ban", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, banned: !currentlyBanned }),
    });
    fetchUsers();
  }

  async function deleteUser(userId: string) {
    const res = await fetch("/api/admin/users/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) fetchUsers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Users ({total})</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search name or email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 px-3 text-xs bg-surface border border-border rounded-lg w-48 focus:border-accent focus:outline-none" />
          <a href="/api/admin/export/users" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">Export CSV</a>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr className="border-b border-border text-text-secondary">
              <SortHeader label="Name" col="full_name" sort={sort} order={order} onSort={toggleSort} width="18%" />
              <SortHeader label="Email" col="email" sort={sort} order={order} onSort={toggleSort} width="22%" />
              <SortHeader label="Signup" col="created_at" sort={sort} order={order} onSort={toggleSort} width="11%" />
              <SortHeader label="Credits" col="credits_remaining" sort={sort} order={order} onSort={toggleSort} width="10%" />
              <SortHeader label="Reports" col="total_reports_run" sort={sort} order={order} onSort={toggleSort} width="10%" />
              <th className="text-center font-medium px-3 py-2" style={{ width: "10%" }}>Revenue</th>
              <th className="text-center font-medium px-3 py-2" style={{ width: "11%" }}>Last Active</th>
              <th className="text-center font-medium px-3 py-2" style={{ width: "8%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-text-secondary">Loading...</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-text-secondary">No users found</td></tr>}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-surface-hover/50">
                <td className="px-3 py-2 font-medium text-center truncate">
                  {u.full_name || "—"}
                  {u.is_banned && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger font-medium">Banned</span>}
                </td>
                <td className="px-3 py-2 text-text-secondary text-center truncate">{u.email}</td>
                <td className="px-3 py-2 text-text-secondary text-center">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-center">
                  <InlineEdit value={u.credits_remaining} onSave={(v) => updateCredits(u.id, v)} />
                </td>
                <td className="px-3 py-2 text-center">{u.total_reports_run}</td>
                <td className="px-3 py-2 text-center">{u.revenue > 0 ? `$${(u.revenue / 100).toFixed(2)}` : "—"}</td>
                <td className="px-3 py-2 text-center text-text-secondary">{u.last_active ? new Date(u.last_active).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2 text-center">
                  {u.is_admin ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">Admin</span>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <BanButton banned={u.is_banned} onToggle={() => toggleBan(u.id, u.is_banned)} />
                      <DeleteUserButton onDelete={() => deleteUser(u.id)} />
                    </div>
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
    </div>
  );
}

function SortHeader({ label, col, sort, order, onSort, width }: { label: string; col: string; sort: string; order: string; onSort: (col: string) => void; width: string }) {
  return (
    <th className="text-center font-medium px-3 py-2 cursor-pointer hover:text-text-primary transition-colors" onClick={() => onSort(col)} style={{ width }}>
      {label} {sort === col && (order === "asc" ? "↑" : "↓")}
    </th>
  );
}

function InlineEdit({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));

  if (!editing) {
    return (
      <span onClick={() => { setEditing(true); setVal(String(value)); }}
        className="cursor-pointer text-[#06B6D4] hover:underline font-medium" title="Click to edit">
        {value}
      </span>
    );
  }

  return (
    <input type="number" value={val} onChange={(e) => setVal(e.target.value)} autoFocus
      className="w-14 h-6 px-1 text-center text-xs bg-bg border border-accent rounded focus:outline-none"
      onBlur={() => { onSave(parseInt(val) || 0); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === "Enter") { onSave(parseInt(val) || 0); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
    />
  );
}

function BanButton({ banned, onToggle }: { banned: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`p-1 rounded transition-colors ${banned ? "text-danger bg-danger/10 hover:bg-danger/20" : "text-text-tertiary hover:text-danger hover:bg-danger/10"}`}
      title={banned ? "Unban user" : "Ban user"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    </button>
  );
}

function DeleteUserButton({ onDelete }: { onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => { onDelete(); setConfirming(false); }} className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors">Yes</button>
        <button onClick={() => setConfirming(false)} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-text-secondary hover:text-text transition-colors">No</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1 rounded text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
      title="Delete user permanently"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
