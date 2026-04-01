"use client";

import { Bar, CHART_COLORS, DARK_CHART_OPTIONS } from "./chart-wrapper";
import { Tip } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabCompetitors({ data }: { data: any }) {
  const competitors = data.competitors || [];
  const domain = data.domain || "";
  const overview = data.overview || {};

  // Build comparison data including the user's domain
  const allDomains = [
    { domain, traffic: overview.organic_traffic || 0, keywords: overview.total_keywords || 0, authority: overview.domain_authority || 0, isUser: true },
    ...competitors.map((c: any) => ({ ...c, isUser: false })),
  ].sort((a, b) => b.traffic - a.traffic);

  const sovTotal = allDomains.reduce((s, d) => s + d.traffic, 0);
  const userTraffic = overview.organic_traffic || 0;
  const sovPct = sovTotal > 0 ? ((userTraffic / sovTotal) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Competitor table */}
      <div>
        <div className="text-sm font-medium mb-2">How you compare</div>
        <div className="bg-surface rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-3 py-2">Website</th>
              <th className="text-left font-medium px-3 py-2">Traffic</th>
              <th className="text-left font-medium px-3 py-2">Keywords</th>
              <th className="text-left font-medium px-3 py-2"><Tip k="da">DA</Tip></th>
              <th className="text-left font-medium px-3 py-2 hidden sm:table-cell"><Tip k="overlap">Overlap</Tip></th>
            </tr></thead>
            <tbody>
              {allDomains.map((c: any, i: number) => (
                <tr key={i} className={`border-b border-border last:border-b-0 ${c.isUser ? "font-medium" : ""}`}>
                  <td className={`px-3 py-2 ${c.isUser ? "text-info" : ""}`}>
                    {c.domain}{c.isUser && " (you)"}
                  </td>
                  <td className="px-3 py-2">{(c.traffic || 0).toLocaleString()}</td>
                  <td className="px-3 py-2">{(c.keywords || 0).toLocaleString()}</td>
                  <td className="px-3 py-2">{c.authority || 0}</td>
                  <td className="px-3 py-2 hidden sm:table-cell">{c.isUser ? "—" : `${c.overlap_pct || 0}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share of voice */}
      <div>
        <div className="text-sm font-medium mb-1"><Tip k="sov">Your share of voice</Tip></div>
        <div className="text-xs text-text-secondary mb-2">How much of the available search traffic in your space you&apos;re capturing</div>
        <div className="h-5 rounded-lg overflow-hidden bg-surface">
          <div className="flex h-full">
            <div
              className="bg-brand-gradient rounded-l-lg flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${Math.max(Number(sovPct), 5)}%`, minWidth: 36 }}
            >
              {sovPct}%
            </div>
            <div className="flex-1 flex items-center pl-2 text-xs text-text-tertiary">Room to grow</div>
          </div>
        </div>
      </div>

      {/* Traffic comparison chart */}
      {allDomains.length > 1 && (
        <div>
          <div className="text-sm font-medium mb-2">Traffic comparison</div>
          <div className="h-40">
            <Bar
              data={{
                labels: allDomains.map((d: any) => d.isUser ? `${d.domain} (you)` : d.domain),
                datasets: [{
                  data: allDomains.map((d: any) => d.traffic),
                  backgroundColor: allDomains.map((d: any) => d.isUser ? CHART_COLORS.green : "#555"),
                  borderRadius: 4,
                  barThickness: 16,
                }],
              }}
              options={{
                ...DARK_CHART_OPTIONS,
                indexAxis: "y" as const,
                scales: {
                  ...DARK_CHART_OPTIONS.scales,
                  x: { ...DARK_CHART_OPTIONS.scales.x, ticks: { ...DARK_CHART_OPTIONS.scales.x.ticks, callback: (v: any) => `${(v / 1000).toFixed(0)}k` } },
                },
              } as any}
            />
          </div>
        </div>
      )}
    </div>
  );
}
