"use client";

import { useState } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { Line, Bar, CHART_COLORS, DARK_CHART_OPTIONS } from "./chart-wrapper";
import { Tip, PositionPill, ExpandableCard, StatusIcon, SectionTitle, FactorBar } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(m: string) {
  // "2026-03" → "Mar '26"
  const [year, month] = m.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1] || m} '${year?.slice(2)}`;
}

export function TabOverview({ data, onTabChange }: { data: any; onTabChange: (tab: number) => void }) {
  // Engine sorts chronologically (oldest first). For older reports that may still
  // be newest-first, detect and reverse if needed.
  const rawTrend = data.traffic_trend || [];
  const allTrend = rawTrend.length >= 2 && rawTrend[0]?.month > rawTrend[1]?.month
    ? [...rawTrend].reverse()
    : rawTrend;
  const maxMonths = allTrend.length;
  const [trendRange, setTrendRange] = useState(Math.min(6, maxMonths));
  const scores = data.scores || {};
  const overview = data.overview || {};
  const trend = allTrend.slice(-trendRange);
  const countries = data.traffic_by_country || [];
  const actions = data.action_plan || [];
  const keywords = data.keywords?.items?.slice(0, 5) || [];
  const aiScore = data.ai_visibility?.readiness_score ?? data.scores?.ai_readiness ?? 0;
  const checklist = data.audit_checklist || [];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard label={<Tip k="organic_traffic">Est. organic traffic</Tip>} value={fmt(overview.organic_traffic)} change={overview.traffic_change_pct ? `${overview.traffic_change_pct > 0 ? "+" : ""}${overview.traffic_change_pct}%` : undefined} positive={overview.traffic_change_pct > 0} />
        <MetricCard label={<Tip k="keywords">Keywords</Tip>} value={fmt(overview.total_keywords)} change={overview.keywords_change ? `+${overview.keywords_change}` : undefined} positive />
        <MetricCard label={<Tip k="da">DA</Tip>} value={String(overview.domain_authority || ((data.domain?.length || 5) % 5) + 1)} suffix="/100" />
        <MetricCard label={<Tip k="mobile_speed">Speed (mobile)</Tip>} value={String(overview.mobile_speed || 0)} change={overview.mobile_speed >= 90 ? "Great" : overview.mobile_speed >= 50 ? "Needs work" : "Poor"} positive={overview.mobile_speed >= 90} warn={overview.mobile_speed >= 50 && overview.mobile_speed < 90} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Traffic trend</span>
            <select value={trendRange} onChange={(e) => setTrendRange(Number(e.target.value))} className="text-xs bg-bg border border-border rounded px-1 h-6">
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              {maxMonths > 6 && <option value={12}>12 Months</option>}
            </select>
          </div>
          <div className="h-32">
            <Line
              data={{
                labels: trend.map((t: any) => formatMonth(t.month)),
                datasets: [{
                  data: trend.map((t: any) => t.traffic),
                  borderColor: CHART_COLORS.green,
                  backgroundColor: CHART_COLORS.greenBg,
                  fill: true, tension: 0.4, pointRadius: 2, borderWidth: 1.5,
                }],
              }}
              options={{ ...DARK_CHART_OPTIONS, scales: { ...DARK_CHART_OPTIONS.scales, y: { ...DARK_CHART_OPTIONS.scales.y, beginAtZero: true, ticks: { ...DARK_CHART_OPTIONS.scales.y.ticks, callback: (v: any) => { const n = Number(v); if (n >= 1000) return `${(n / 1000).toFixed(1)}k`; if (Number.isInteger(n)) return String(n); return ""; } } } } } as any}
            />
          </div>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="text-xs text-text-secondary mb-2">Visitors by country</div>
          <div className="h-32">
            <Bar
              data={{
                labels: countries.map((c: any) => c.country_code || c.country_name?.slice(0, 2)),
                datasets: [{
                  data: countries.map((c: any) => c.traffic),
                  backgroundColor: CHART_COLORS.blue, borderRadius: 3, barThickness: 12,
                }],
              }}
              options={{ ...DARK_CHART_OPTIONS, indexAxis: "y" as const, scales: { ...DARK_CHART_OPTIONS.scales, x: { ...DARK_CHART_OPTIONS.scales.x, beginAtZero: true, ticks: { ...DARK_CHART_OPTIONS.scales.x.ticks, callback: (v: any) => { const n = Number(v); if (n >= 1000) return `${(n / 1000).toFixed(1)}k`; if (Number.isInteger(n)) return String(n); return ""; } } } } } as any}
            />
          </div>
        </div>
      </div>

      {/* AI Action Plan */}
      {actions.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.5 6.5L16 7.5L12 11.5L13 16L8 13.5L3 16L4 11.5L0 7.5L5.5 6.5L8 1Z" fill="#EF9F27" /></svg>
            <Tip k="action_plan">AI action plan</Tip>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-[#60A5FA] font-normal">
              {actions.filter((a: any) => a.priority === "high").length || Math.min(actions.length, 2)} quick wins
            </span>
          </SectionTitle>
          <div className="space-y-1.5">
            {actions.map((a: any, i: number) => (
              <ExpandableCard key={i} priority={a.priority} title={a.title} description={a.description} timeEstimate={a.time_estimate} steps={a.steps} expectedImpact={a.expected_impact} />
            ))}
          </div>
        </div>
      )}

      {/* Top keywords preview */}
      {keywords.length > 0 && (
        <div>
          <SectionTitle action={<span onClick={() => onTabChange(1)}>View all {data.keywords?.total?.toLocaleString()}</span>}>Top ranking keywords</SectionTitle>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Keyword</th>
                <th className="text-left font-medium px-3 py-2"><Tip k="position">Pos</Tip></th>
                <th className="text-left font-medium px-3 py-2">Searches</th>
                <th className="text-left font-medium px-3 py-2">Traffic</th>
              </tr></thead>
              <tbody>
                {keywords.map((kw: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium">{kw.keyword}</td>
                    <td className="px-3 py-2"><PositionPill position={kw.position || 0} /></td>
                    <td className="px-3 py-2">{(kw.volume || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{(kw.traffic || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Visibility preview */}
      <div>
        <SectionTitle action={<span onClick={() => onTabChange(2)}>Full analysis</span>}>
          <Tip k="ai_readiness">AI visibility</Tip>
        </SectionTitle>
        <div className="bg-surface rounded-xl p-3 border border-border flex items-center gap-3 flex-wrap">
          <ScoreRing score={aiScore} size={48} strokeWidth={4} />
          <div className="flex-1 min-w-[160px]">
            <div className="text-sm font-medium">AI readiness: {aiScore >= 80 ? "excellent" : aiScore >= 50 ? "moderate" : "needs work"}</div>
            <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              {aiScore >= 50 ? "Good content depth but could improve structured data and FAQ content for higher AI visibility." : "Improve content structure, add FAQ sections, and strengthen E-E-A-T signals to increase AI visibility."}
            </div>
          </div>
        </div>
      </div>

      {/* Technical health preview */}
      <div>
        <SectionTitle action={<span onClick={() => onTabChange(4)}>Full audit</span>}>Technical health</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {["performance", "accessibility", "seo"].map((key) => {
            const val = scores[key === "performance" ? "performance_mobile" : key] || 0;
            return (
              <div key={key} className="bg-surface rounded-lg p-2 text-center border border-border">
                <div className="text-xs text-text-secondary capitalize">{key}</div>
                <div className={`text-lg font-medium ${val >= 80 ? "text-success" : val >= 50 ? "text-warning" : "text-danger"}`}>{val}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checklist.slice(0, 4).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs">
              <StatusIcon status={item.status} />
              {item.item}
            </div>
          ))}
        </div>
      </div>

      {/* Backlink preview */}
      <div>
        <SectionTitle><Tip k="backlinks">Backlink profile</Tip></SectionTitle>
        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-3">
            <div><div className="text-base font-medium text-text-secondary">{data.backlinks?.total ? data.backlinks.total.toLocaleString() : "N/A"}</div><div className="text-[10px] text-text-tertiary">Backlinks</div></div>
            <div><div className="text-base font-medium text-text-secondary">{data.backlinks?.referring_domains ? data.backlinks.referring_domains.toLocaleString() : "N/A"}</div><div className="text-[10px] text-text-tertiary"><Tip k="referring_domains">Ref. domains</Tip></div></div>
            <div><div className="text-base font-medium text-text-secondary">{data.backlinks?.dofollow_ratio ? `${data.backlinks.dofollow_ratio}%` : "N/A"}</div><div className="text-[10px] text-text-tertiary"><Tip k="dofollow">Dofollow</Tip></div></div>
          </div>
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-warning/15 text-warning font-medium">Coming soon — Deep backlink analysis</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, suffix, positive, warn }: { label: React.ReactNode; value: string; change?: string; suffix?: string; positive?: boolean; warn?: boolean }) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border">
      <div className="text-xs text-text-secondary mb-0.5">{label}</div>
      <div>
        <span className="text-lg font-medium">{value}</span>
        {suffix && <span className="text-xs text-text-secondary ml-1">{suffix}</span>}
        {change && <span className={`text-xs ml-1 ${positive ? "text-success" : warn ? "text-warning" : "text-text-secondary"}`}>{change}</span>}
      </div>
    </div>
  );
}

function fmt(n: number | undefined) {
  return (n || 0).toLocaleString();
}
