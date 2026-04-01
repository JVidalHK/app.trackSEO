"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const InvoiceView = dynamic(() => import("@/app/dashboard/invoice/[id]/invoice-view").then((m) => ({ default: m.InvoiceView })), { ssr: false });

/* eslint-disable @typescript-eslint/no-explicit-any */

const PKG_NAMES: Record<string, string> = { single_1: "Single", pack_5: "5 Pack", pack_10: "10 Pack", pack_20: "20 Pack" };

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any>(null);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/invoices?page=${page}&search=${search}&package=${pkgFilter}&sort=created_at&order=desc`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, pkgFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Invoices ({total})</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search customer..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 px-3 text-xs bg-surface border border-border rounded-lg w-40 focus:border-accent focus:outline-none" />
          <select value={pkgFilter} onChange={(e) => { setPkgFilter(e.target.value); setPage(1); }}
            className="h-8 px-2 text-xs bg-surface border border-border rounded-lg">
            <option value="">All packages</option>
            <option value="single_1">Single</option>
            <option value="pack_5">5 Pack</option>
            <option value="pack_10">10 Pack</option>
            <option value="pack_20">20 Pack</option>
          </select>
          <a href="/api/admin/export/invoices" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">Export CSV</a>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-text-secondary">
            <th className="text-left font-medium px-3 py-2">Invoice #</th>
            <th className="text-center font-medium px-3 py-2">Date</th>
            <th className="text-left font-medium px-3 py-2">Customer</th>
            <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Email</th>
            <th className="text-center font-medium px-3 py-2">Product</th>
            <th className="text-center font-medium px-3 py-2 hidden sm:table-cell">Tax</th>
            <th className="text-center font-medium px-3 py-2">Total</th>
            <th className="text-center font-medium px-3 py-2">Status</th>
            <th className="text-center font-medium px-3 py-2">Action</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-text-secondary">Loading...</td></tr>}
            {!loading && invoices.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-text-secondary">No invoices found</td></tr>}
            {invoices.map((inv) => {
              const invData = inv.invoice_data || {};
              return (
                <tr key={inv.id} className="border-b border-border last:border-b-0 hover:bg-surface-hover/50">
                  <td className="px-3 py-2 font-medium text-[#06B6D4]">{invData.invoice_number || "—"}</td>
                  <td className="px-3 py-2 text-center text-text-secondary">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{invData.billing_name || inv.user_name || "—"}</td>
                  <td className="px-3 py-2 text-text-secondary hidden sm:table-cell">{inv.user_email || "—"}</td>
                  <td className="px-3 py-2 text-center">{PKG_NAMES[inv.package] || inv.package}</td>
                  <td className="px-3 py-2 text-center hidden sm:table-cell">{invData.tax_amount ? `$${(invData.tax_amount / 100).toFixed(2)}` : "$0.00"}</td>
                  <td className="px-3 py-2 text-center font-medium">{inv.amount_cents > 0 ? `$${(inv.amount_cents / 100).toFixed(2)}` : "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "completed" ? "bg-success/10 text-success" : inv.status === "refunded" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>{inv.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setViewing(inv)} className="text-xs text-[#06B6D4] hover:text-[#2563EB] transition-colors">View</button>
                  </td>
                </tr>
              );
            })}
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

      {/* Invoice preview modal */}
      {viewing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative bg-bg border border-border rounded-xl w-[90vw] max-w-2xl h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-end mb-2">
              <button onClick={() => setViewing(null)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover">Close</button>
            </div>
            <InvoiceView purchase={viewing} />
          </div>
        </div>
      )}
    </div>
  );
}
