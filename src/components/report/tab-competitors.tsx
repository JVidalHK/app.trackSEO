"use client";

import { Bar, CHART_COLORS, DARK_CHART_OPTIONS } from "./chart-wrapper";
import { Tip } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function TabCompetitors({ data }: { data: any }) {
  const competitors = data.competitors || [];
  const domain = data.domain || "";
  const overview = data.overview || {};

  const userEntry = {
    domain,
    traffic: overview.organic_traffic || 0,
    keywords: overview.total_keywords || 0,
    authority: 0,
    overlap: 0,
    overlap_pct: 0,
    isUser: true,
  };

  // Sort competitors by traffic descending
  const allDomains = [
    userEntry,
    ...competitors.map((c: any) => ({ ...c, isUser: false })),
  ].sort((a, b) => b.traffic - a.traffic);

  // For the chart, use a log-friendly view or cap at reasonable range
  const chartDomains = allDomains.slice(0, 6);
  const maxTraffic = Math.max(...chartDomains.map((d) => d.traffic));

  // Share of voice among these competitors
  const totalOverlapTraffic = allDomains.reduce((s, d) => s + (d.isUser ? d.traffic : (d.overlap || 0)), 0);
  const userTraffic = overview.organic_traffic || 0;
  const sovPct = totalOverlapTraffic > 0 ? ((userTraffic / totalOverlapTraffic) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Competitor table */}
      <div>
        <div className="text-sm font-medium mb-2">How you compare</div>
        <div className="bg-surface rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-3 py-2">Website</th>
              <th className="text-right font-medium px-3 py-2"><Tip k="organic_traffic">Est. Traffic</Tip></th>
              <th className="text-right font-medium px-3 py-2"><Tip k="keywords">Keywords</Tip></th>
              <th className="text-right font-medium px-3 py-2 hidden sm:table-cell"><Tip k="overlap">Shared Keywords</Tip></th>
              <th className="text-right font-medium px-3 py-2 hidden sm:table-cell">Avg Position</th>
            </tr></thead>
            <tbody>
              {allDomains.map((c: any, i: number) => (
                <tr key={i} className={`border-b border-border last:border-b-0 ${c.isUser ? "font-medium" : ""}`}>
                  <td className={`px-3 py-2 ${c.isUser ? "text-[#06B6D4]" : ""}`}>
                    {c.domain}{c.isUser && " (you)"}
                  </td>
                  <td className="px-3 py-2 text-right">{fmtNum(c.traffic || 0)}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(c.keywords || 0)}</td>
                  <td className="px-3 py-2 text-right hidden sm:table-cell">{c.isUser ? "—" : (c.overlap || c.intersections || 0)}</td>
                  <td className="px-3 py-2 text-right hidden sm:table-cell">{c.isUser ? "—" : (c.avg_position || "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share of voice */}
      <div>
        <div className="text-sm font-medium mb-1"><Tip k="sov">Your share of voice</Tip></div>
        <div className="text-xs text-text-secondary mb-2">How much of the shared keyword traffic you capture vs competitors</div>
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
      {chartDomains.length > 1 && (
        <div>
          <div className="text-sm font-medium mb-2">Traffic comparison</div>
          <div className="h-40">
            <Bar
              data={{
                labels: chartDomains.map((d: any) => {
                  const label = d.domain.length > 20 ? d.domain.slice(0, 18) + "…" : d.domain;
                  return d.isUser ? `${label} (you)` : label;
                }),
                datasets: [{
                  data: chartDomains.map((d: any) => d.traffic),
                  backgroundColor: chartDomains.map((d: any) => d.isUser ? CHART_COLORS.green : "#555"),
                  borderRadius: 4,
                  barThickness: 16,
                }],
              }}
              options={{
                ...DARK_CHART_OPTIONS,
                indexAxis: "y" as const,
                scales: {
                  ...DARK_CHART_OPTIONS.scales,
                  x: {
                    ...DARK_CHART_OPTIONS.scales.x,
                    type: maxTraffic > 100000 ? "logarithmic" as const : "linear" as const,
                    ticks: {
                      ...DARK_CHART_OPTIONS.scales.x.ticks,
                      callback: (v: any) => fmtNum(Number(v)),
                    },
                  },
                },
              } as any}
            />
          </div>
          {maxTraffic > 100000 && (
            <div className="text-[10px] text-text-tertiary mt-1">Scale: logarithmic (competitors have significantly more traffic)</div>
          )}
        </div>
      )}
    </div>
  );
}
