"use client";

import { useState, useEffect } from "react";
import { Line, CHART_COLORS, DARK_CHART_OPTIONS } from "@/components/report/chart-wrapper";

/* eslint-disable @typescript-eslint/no-explicit-any */

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "3mo", label: "3 months" },
  { key: "1yr", label: "1 year" },
  { key: "lifetime", label: "Lifetime" },
];

export default function AdminDashboard() {
  const [range, setRange] = useState("lifetime");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/metrics?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading && !data) return <div className="text-sm text-text-secondary p-8">Loading metrics...</div>;
  if (!data) return <div className="text-sm text-danger p-8">Failed to load admin data</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Admin Dashboard</h1>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${range === r.key ? "bg-accent text-white" : "bg-surface border border-border hover:bg-surface-hover"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <MetricCard label="Total Revenue" value={`$${(data.totalRevenue / 100).toFixed(2)}`} change={data.revenueChange ? `${data.revenueChange > 0 ? "+" : ""}${data.revenueChange}%` : undefined} />
        <MetricCard label="Total Users" value={String(data.totalUsers || 0)} sub={data.newUsers ? `+${data.newUsers} new` : undefined} />
        <MetricCard label="Reports Generated" value={String(data.totalReports || 0)} />
        <MetricCard label="Total COGS" value={`$${(data.totalCogs / 100).toFixed(2)}`} />
        <MetricCard label="Stripe Fees (est.)" value={`$${(data.stripeFees / 100).toFixed(2)}`} sub="~2.9% + $0.30" />
        <MetricCard label="Net Profit" value={`$${(data.netProfit / 100).toFixed(2)}`} positive={data.netProfit > 0} />
        <MetricCard label="Avg COGS / Report" value={`$${(data.avgCogs / 100).toFixed(2)}`} />
        <MetricCard label="Gross Margin" value={`${data.grossMargin}%`} positive={data.grossMargin > 50} />
      </div>

      {/* Revenue chart */}
      {data.chartData?.length > 0 && (
        <div className="bg-surface rounded-xl p-4 border border-border mb-5">
          <div className="text-xs text-text-secondary mb-3">Revenue vs COGS</div>
          <div className="h-48">
            <Line
              data={{
                labels: data.chartData.map((d: any) => d.date),
                datasets: [
                  { label: "Revenue", data: data.chartData.map((d: any) => d.revenue), borderColor: CHART_COLORS.green, backgroundColor: "rgba(16,185,129,0.05)", fill: true, tension: 0.3, pointRadius: 2, borderWidth: 1.5 },
                  { label: "COGS", data: data.chartData.map((d: any) => d.cogs), borderColor: CHART_COLORS.red, backgroundColor: "rgba(239,68,68,0.05)", fill: true, tension: 0.3, pointRadius: 2, borderWidth: 1.5 },
                ],
              }}
              options={{ ...DARK_CHART_OPTIONS, plugins: { legend: { display: true, labels: { color: "#94A3B8", font: { size: 10 } } } } } as any}
            />
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div>
        <div className="text-sm font-medium mb-3">Recent activity</div>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {data.activities?.length === 0 && <div className="p-4 text-xs text-text-secondary text-center">No activity yet</div>}
          {data.activities?.map((a: any, i: number) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-xs">
              <ActivityIcon type={a.type} />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{a.name || a.email?.split("@")[0] || "User"}</span>
                {a.type === "purchase" && <span className="text-text-secondary"> purchased {formatPkg(a.details.package)} — ${((a.details.amount || 0) / 100).toFixed(2)}</span>}
                {a.type === "report" && <span className="text-text-secondary"> report completed for {a.details.domain} — COGS: ${((a.details.cogs || 0) / 100).toFixed(2)}</span>}
                {a.type === "signup" && <span className="text-text-secondary"> signed up</span>}
              </div>
              <span className="text-text-tertiary whitespace-nowrap">{timeAgo(a.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, sub, positive }: { label: string; value: string; change?: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border">
      <div className="text-[10px] text-text-secondary">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
      {change && <div className={`text-[10px] ${positive !== false ? "text-success" : "text-danger"}`}>{change}</div>}
      {sub && <div className="text-[10px] text-text-tertiary">{sub}</div>}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === "purchase") return <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success text-[10px]">$</div>;
  if (type === "report") return <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[#60A5FA] text-[10px]">R</div>;
  return <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center text-info text-[10px]">+</div>;
}

function formatPkg(pkg: string) {
  const m: Record<string, string> = { single_1: "Single Report", pack_5: "5 Pack", pack_10: "10 Pack", pack_20: "20 Pack" };
  return m[pkg] || pkg;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
