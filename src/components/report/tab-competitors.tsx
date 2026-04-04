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
    overlap: 0,
    isUser: true,
  };

  // Sort competitors by shared keywords (most relevant first)
  const allDomains = [
    userEntry,
    ...competitors.map((c: any) => ({ ...c, isUser: false })),
  ];

  // Separate into similar-size and giants for display
  const userTraffic = overview.organic_traffic || 1;
  const similarCompetitors = competitors.filter((c: any) => c.traffic < userTraffic * 1000);
  const giantCompetitors = competitors.filter((c: any) => c.traffic >= userTraffic * 1000);

  // Share of voice: user traffic / total search volume of all ranked keywords
  // This measures what % of available search traffic you're capturing
  const keywords = data.keywords?.items || [];
  const totalSearchVolume = keywords.reduce((s: number, kw: any) => s + (kw.volume || 0), 0);
  const sovPct = totalSearchVolume > 0
    ? Math.min(((userTraffic / totalSearchVolume) * 100), 99).toFixed(1)
    : "0";

  // For chart, show only similar-size competitors + user (skip giants that dwarf the chart)
  const chartDomains = similarCompetitors.length > 0
    ? [userEntry, ...similarCompetitors].sort((a, b) => b.traffic - a.traffic).slice(0, 6)
    : allDomains.sort((a, b) => b.traffic - a.traffic).slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Competitor table */}
      <div>
        <div className="text-sm font-medium mb-2">How you compare</div>

        {/* Similar-size competitors */}
        <div className="bg-surface rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-3 py-2">Website</th>
              <th className="text-center font-medium px-3 py-2"><Tip k="organic_traffic">Est. Traffic</Tip></th>
              <th className="text-center font-medium px-3 py-2"><Tip k="keywords">Keywords</Tip></th>
              <th className="text-center font-medium px-3 py-2 hidden sm:table-cell"><Tip k="overlap">Shared KW</Tip></th>
              <th className="text-center font-medium px-3 py-2 hidden sm:table-cell">Avg Pos</th>
            </tr></thead>
            <tbody>
              {/* User row */}
              <tr className="border-b border-border font-medium">
                <td className="px-3 py-2 text-[#06B6D4]">{domain} (you)</td>
                <td className="px-3 py-2 text-center">{fmtNum(userEntry.traffic)}</td>
                <td className="px-3 py-2 text-center">{fmtNum(userEntry.keywords)}</td>
                <td className="px-3 py-2 text-center hidden sm:table-cell">—</td>
                <td className="px-3 py-2 text-center hidden sm:table-cell">—</td>
              </tr>
              {/* Competitors */}
              {competitors.map((c: any, i: number) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">
                    {c.domain}
                    {c.traffic > userTraffic * 1000 && <span className="text-[10px] text-text-tertiary ml-1">(mega site)</span>}
                  </td>
                  <td className="px-3 py-2 text-center">{fmtNum(c.traffic || 0)}</td>
                  <td className="px-3 py-2 text-center">{fmtNum(c.keywords || 0)}</td>
                  <td className="px-3 py-2 text-center hidden sm:table-cell">{c.overlap || "—"}</td>
                  <td className="px-3 py-2 text-center hidden sm:table-cell">{c.avg_position || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {giantCompetitors.length > 0 && similarCompetitors.length > 0 && (
          <div className="text-[10px] text-text-tertiary mt-1.5">
            {giantCompetitors.map((c: any) => c.domain).join(", ")} are large platforms that rank for some of your keywords. Focus on competing with sites closer to your size.
          </div>
        )}
      </div>

      {/* Share of voice */}
      <div>
        <div className="text-sm font-medium mb-1"><Tip k="sov">Your share of voice</Tip></div>
        <div className="text-xs text-text-secondary mb-2">Your estimated traffic as a percentage of total search volume for your keywords</div>
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

      {/* Traffic comparison chart — similar-size only */}
      {chartDomains.length > 1 && (
        <div>
          <div className="text-sm font-medium mb-2">
            Traffic comparison
            {similarCompetitors.length > 0 && giantCompetitors.length > 0 && (
              <span className="text-[10px] text-text-tertiary font-normal ml-2">(similar-size competitors)</span>
            )}
          </div>
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
                    ticks: { ...DARK_CHART_OPTIONS.scales.x.ticks, callback: (v: any) => fmtNum(Number(v)) },
                  },
                },
              } as any}
            />
          </div>
        </div>
      )}
    </div>
  );
}
