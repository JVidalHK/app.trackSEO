"use client";

import { useState } from "react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ProgressView({
  trackingByDomain,
  reportsByDomain,
  domains,
  credits,
}: {
  trackingByDomain: Record<string, any[]>;
  reportsByDomain: Record<string, any[]>;
  domains: string[];
  credits: number;
}) {
  const [selected, setSelected] = useState(domains[0]);
  const tracking = trackingByDomain[selected] || [];
  const reports = reportsByDomain[selected] || [];

  const first = tracking[0];
  const last = tracking[tracking.length - 1];
  const prev = tracking.length >= 2 ? tracking[tracking.length - 2] : null;
  const reportCount = tracking.length;

  // Score trajectory
  const scoreChange = first && last ? (last.seo_score ?? 0) - (first.seo_score ?? 0) : 0;
  const trend = scoreChange > 0 ? "up" : scoreChange < 0 ? "down" : "steady";

  // Deltas from last report
  const scoreDelta = prev && last ? (last.seo_score ?? 0) - (prev.seo_score ?? 0) : 0;
  const trafficDelta = prev && last ? (last.organic_traffic ?? 0) - (prev.organic_traffic ?? 0) : 0;
  const kwDelta = prev && last ? (last.total_keywords ?? 0) - (prev.total_keywords ?? 0) : 0;
  const issuesFixed = first && last ? Math.max(0, (first.issues_count ?? 0) - (last.issues_count ?? 0)) : 0;

  // Action items from reports
  const latestReport = reports[reports.length - 1]?.report_data;
  const actionItems = latestReport?.action_plan || [];
  const techIssues = (latestReport?.tech_performance_issues || []).filter((i: any) => i.status === "issue");
  const allActions = [...actionItems, ...techIssues.map((t: any) => ({ ...t, priority: t.impact, category: "technical" }))];

  // Keyword movements (compare first and last report)
  const firstKeywords = reports[0]?.report_data?.keywords?.items || [];
  const lastKeywords = reports[reports.length - 1]?.report_data?.keywords?.items || [];
  const keywordMovements = computeKeywordMovements(firstKeywords, lastKeywords);

  // Next report recommendation
  const lastReportDate = last ? new Date(last.tracked_at) : null;
  const nextReportInfo = computeNextReport(lastReportDate, reportCount, issuesFixed);

  // Completion percentage
  const totalIssuesFirst = first?.issues_count ?? 0;
  const currentIssues = last?.issues_count ?? 0;
  const completionPct = totalIssuesFirst > 0 ? Math.round(((totalIssuesFirst - currentIssues) / totalIssuesFirst) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Domain selector */}
      {domains.length > 1 && (
        <div className="flex items-center gap-3 mb-2">
          <label className="text-sm text-text-secondary whitespace-nowrap">Domain:</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="flex-1 max-w-xs h-9 px-3 text-sm bg-surface border border-border rounded-lg focus:border-accent focus:outline-none">
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Single domain header */}
      {domains.length === 1 && (
        <div className="mb-1">
          <div className="text-base font-medium">{selected}</div>
          <div className="text-xs text-text-secondary">{reportCount} report{reportCount !== 1 ? "s" : ""} since {first ? new Date(first.tracked_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
        </div>
      )}

      {/* Section 1: Momentum summary */}
      {reportCount >= 2 && (
        <div className={`bg-surface rounded-r-xl p-4 border border-border border-l-[3px] ${trend === "up" ? "border-l-success" : trend === "down" ? "border-l-danger" : "border-l-warning"} flex items-center gap-4 flex-wrap`}>
          <div className="w-[60px] h-[60px] relative flex-shrink-0">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="var(--color-border)" strokeWidth="4" />
              <circle cx="30" cy="30" r="25" fill="none"
                stroke={trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#F59E0B"}
                strokeWidth="4"
                strokeDasharray={157.1}
                strokeDashoffset={157.1 - (157.1 * Math.min(completionPct, 100)) / 100}
                strokeLinecap="round"
                transform="rotate(-90 30 30)" />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-base font-medium ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-warning"}`}>
              {completionPct}%
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm font-medium">
              {trend === "up" ? "Your SEO is trending upward" : trend === "down" ? "SEO needs attention" : "Holding steady"}
            </div>
            <div className="text-xs text-text-secondary leading-relaxed mt-1">
              Score {scoreChange > 0 ? "improved" : scoreChange < 0 ? "dropped" : "unchanged"} {Math.abs(scoreChange)} points across {reportCount} reports.
              {issuesFixed > 0 && ` You've fixed ${issuesFixed} issues`}
              {trafficDelta > 0 && ` and gained an estimated ${trafficDelta.toLocaleString()} additional monthly visitors`}.
              {currentIssues > 0 && ` ${currentIssues} issues remaining.`}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Score trajectory */}
      {reportCount >= 1 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#60A5FA" strokeWidth="1.2" /><path d="M4 7h6M7 4v6" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Score trajectory
          </div>
          <div className="bg-surface rounded-xl p-4 border border-border">
            <ScoreTrajectoryChart tracking={tracking.slice(-5)} />
          </div>
        </div>
      )}

      {/* Section 3: What changed since last report */}
      {reportCount >= 2 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 10l3-4 2.5 2L12 4" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            What changed since last report
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCard label="SEO score" value={String(last?.seo_score ?? 0)} change={scoreDelta} />
            <MetricCard label="Monthly traffic" value={(last?.organic_traffic ?? 0).toLocaleString()} change={trafficDelta} />
            <MetricCard label="Keywords" value={(last?.total_keywords ?? 0).toLocaleString()} change={kwDelta} suffix={kwDelta > 0 ? "new" : undefined} />
            <MetricCard label="Issues" value={String(last?.issues_count ?? 0)} change={-issuesFixed} suffix={issuesFixed > 0 ? `${issuesFixed} fixed` : undefined} invertColor />
          </div>
        </div>
      )}

      {/* Section 4: Action items */}
      {allActions.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3v8" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Action items
            <span className="text-xs text-text-secondary font-normal">{allActions.length} total</span>
          </div>
          <div className="space-y-1.5">
            {allActions.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3 border border-border rounded-lg">
                <div className="w-5 h-5 rounded-full border-[1.5px] border-border flex items-center justify-center flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium flex items-center gap-1.5 flex-wrap">
                    {item.title}
                    <ImpactPill priority={item.priority} category={item.category} />
                  </div>
                  {item.description && <div className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Keyword movements */}
      {keywordMovements.length > 0 && reportCount >= 2 && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10V4l3 3 2.5-4L10 7l2-3v6z" stroke="#10B981" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Keyword movements since first report
          </div>
          <div className="bg-surface rounded-xl p-3 border border-border">
            {keywordMovements.slice(0, 8).map((kw: any, i: number) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-border last:border-b-0 text-xs">
                <span className="flex-1 font-medium">{kw.keyword}</span>
                <span className={`font-medium min-w-[24px] text-center ${kw.currentPos <= 3 ? "text-success" : kw.currentPos <= 10 ? "text-info" : kw.currentPos <= 20 ? "text-warning" : "text-danger"}`}>
                  {kw.currentPos}
                </span>
                <span className={`font-medium min-w-[40px] text-right ${kw.change > 0 ? "text-success" : kw.change < 0 ? "text-danger" : "text-text-secondary"}`}>
                  {kw.change > 0 ? `+${kw.change}` : kw.change < 0 ? String(kw.change) : "—"} pos
                </span>
                <span className={`text-[10px] min-w-[60px] text-right ${kw.trafficChange >= 0 ? "text-success" : "text-danger"}`}>
                  {kw.trafficChange >= 0 ? "+" : ""}{kw.trafficChange.toLocaleString()} visits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Recommended next report */}
      {lastReportDate && (
        <div className={`border-2 rounded-xl p-5 text-center ${nextReportInfo.ready ? "border-accent bg-accent/5" : "border-info bg-info/5"}`}>
          <div className="text-[11px] text-info font-medium mb-1">Recommended next report</div>
          <div className={`text-4xl font-medium my-2 ${nextReportInfo.ready ? "text-accent" : "text-info"}`}>
            {nextReportInfo.ready ? "Ready" : `${nextReportInfo.daysLeft} days`}
          </div>
          <div className="text-sm font-medium mb-1">
            {nextReportInfo.ready
              ? "Your next report is due"
              : `Run your next report around ${nextReportInfo.targetDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
          </div>
          <div className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed mb-4">
            {nextReportInfo.ready
              ? `It's been ${nextReportInfo.daysSince} days since your last report. Enough time has passed for Google to reflect your changes. Run a new report to see your progress.`
              : nextReportInfo.reason}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-border max-w-xs mx-auto overflow-hidden mb-1">
            <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(nextReportInfo.progressPct, 100)}%` }} />
          </div>
          <div className="flex justify-between max-w-xs mx-auto text-[10px] text-text-tertiary">
            <span>Last report ({lastReportDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})</span>
            <span>Recommended ({nextReportInfo.targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})</span>
          </div>

          {nextReportInfo.ready && (
            <div className="mt-4">
              {credits > 0 ? (
                <Link href={`/dashboard?domain=${encodeURIComponent(selected)}`}
                  className="inline-flex h-10 items-center px-6 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:brightness-110 transition-all">
                  Run report for {selected}
                </Link>
              ) : (
                <Link href="/dashboard/credits"
                  className="inline-flex h-10 items-center px-6 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-all">
                  Buy credits to run report
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Single report state */}
      {reportCount === 1 && (
        <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
          <div className="text-sm font-medium mb-1">Run your next report in 2-3 weeks</div>
          <div className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
            Focus on completing the action items from your first report. Google typically takes 2-4 weeks to reflect improvements. Running too early won&apos;t show results yet.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score trajectory SVG chart ──

function ScoreTrajectoryChart({ tracking }: { tracking: any[] }) {
  if (tracking.length === 0) return null;

  const n = tracking.length;
  const scores = tracking.map((t) => t.seo_score ?? 0);
  const minScore = Math.max(0, Math.min(...scores) - 15);
  const maxScore = Math.min(100, Math.max(...scores) + 15);
  const range = maxScore - minScore || 1;

  // All rendering in one SVG for perfect alignment
  const width = 500;
  const chartTop = 10;
  const chartH = 80;
  const labelStart = chartTop + chartH + 20;
  const totalH = labelStart + 50;

  // Position points: 1=center, 2=far left/right, 3-5=evenly spread edge-to-edge
  const margin = 50;
  const usable = width - margin * 2;
  const points = tracking.map((t, i) => {
    let x: number;
    if (n === 1) x = width / 2;
    else x = margin + (i / (n - 1)) * usable;
    const y = chartTop + chartH - (((t.seo_score ?? 0) - minScore) / range) * chartH;
    return { x, y, score: t.seo_score ?? 0 };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${totalH}`} preserveAspectRatio="xMidYMid meet">
      {/* Vertical grid lines */}
      {points.map((p, i) => (
        <line key={`g-${i}`} x1={p.x} y1={chartTop} x2={p.x} y2={chartTop + chartH} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* Score line */}
      {n > 1 && <path d={linePath} stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {/* Data point circles */}
      {points.map((p, i) => {
        const prevScore = i > 0 ? points[i - 1].score : p.score;
        const delta = p.score - prevScore;
        const color = i === 0 ? "#F59E0B" : delta >= 0 ? "#10B981" : "#EF4444";
        return <circle key={`p-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-bg, #0B1120)" stroke={color} strokeWidth="2" />;
      })}
      {/* Labels below — score, date, delta */}
      {tracking.map((t: any, i: number) => {
        const score = t.seo_score ?? 0;
        const prevScore = i > 0 ? (tracking[i - 1].seo_score ?? 0) : 0;
        const delta = i > 0 ? score - prevScore : 0;
        const color = i === 0 ? "#F59E0B" : delta >= 0 ? "#10B981" : "#EF4444";
        const dateStr = new Date(t.tracked_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const deltaStr = i === 0 ? "First report" : `${delta >= 0 ? "+" : ""}${delta} pts`;
        return (
          <g key={`l-${i}`}>
            <text x={points[i].x} y={labelStart} textAnchor="middle" fill={color} fontSize="16" fontWeight="500" fontFamily="inherit">{score}</text>
            <text x={points[i].x} y={labelStart + 14} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontFamily="inherit">{dateStr}</text>
            <text x={points[i].x} y={labelStart + 26} textAnchor="middle" fill={color} fontSize="10" fontWeight="500" fontFamily="inherit">{deltaStr}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Helpers ──

function MetricCard({ label, value, change, suffix, invertColor }: { label: string; value: string; change: number; suffix?: string; invertColor?: boolean }) {
  const positive = invertColor ? change <= 0 : change > 0;
  const changeText = suffix || (change > 0 ? `+${change.toLocaleString()}` : change < 0 ? change.toLocaleString() : "—");
  return (
    <div className="bg-surface rounded-lg p-3 border border-border">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="text-xl font-medium">{value}</div>
      <div className={`text-[11px] font-medium ${positive ? "text-success" : change === 0 ? "text-text-tertiary" : "text-danger"}`}>
        {suffix || changeText}
      </div>
    </div>
  );
}

function ImpactPill({ priority, category }: { priority: string; category?: string }) {
  if (category === "technical") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger/10 text-danger font-medium">Technical</span>;
  if (priority === "high") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">High impact</span>;
  if (priority === "medium") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Medium</span>;
  if (category === "ai-visibility") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">AI visibility</span>;
  return null;
}

function computeKeywordMovements(firstKws: any[], lastKws: any[]) {
  if (!firstKws.length || !lastKws.length) return [];

  const firstMap = new Map<string, { position: number; traffic: number }>();
  for (const kw of firstKws) {
    if (kw.keyword) firstMap.set(kw.keyword, { position: kw.position || 100, traffic: kw.traffic || 0 });
  }

  const movements: any[] = [];
  for (const kw of lastKws) {
    if (!kw.keyword) continue;
    const prev = firstMap.get(kw.keyword);
    if (!prev) continue;
    const change = prev.position - (kw.position || 100); // positive = improved
    const trafficChange = (kw.traffic || 0) - prev.traffic;
    movements.push({
      keyword: kw.keyword,
      currentPos: kw.position || 100,
      prevPos: prev.position,
      change,
      trafficChange,
    });
  }

  // Sort by traffic impact descending
  movements.sort((a, b) => Math.abs(b.trafficChange) - Math.abs(a.trafficChange));
  return movements;
}

function computeNextReport(lastDate: Date | null, reportCount: number, issuesFixed: number) {
  if (!lastDate) return { daysLeft: 0, daysSince: 0, ready: false, targetDate: new Date(), progressPct: 0, reason: "" };

  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // Recommendation logic
  let recommendedDays = 28; // default 4 weeks
  let reason = "";

  if (issuesFixed >= 3) {
    recommendedDays = 14;
    reason = `You've made ${issuesFixed} significant changes since your last report. Google typically takes 2-3 weeks to reflect improvements. This timing gives enough data to measure impact.`;
  } else if (issuesFixed >= 1) {
    recommendedDays = 21;
    reason = `You've made some changes since your last report. Give Google 3 weeks to re-crawl and re-index your site before checking results.`;
  } else {
    recommendedDays = 35;
    reason = `No changes detected since your last report. Check back in 4-5 weeks to monitor organic shifts and competitor movements.`;
  }

  if (daysSince > 56) {
    reason = `It's been ${daysSince} days since your last report — over 8 weeks. Your SEO landscape may have shifted significantly. Time for a fresh check.`;
  }

  const targetDate = new Date(lastDate.getTime() + recommendedDays * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPct = recommendedDays > 0 ? Math.round((daysSince / recommendedDays) * 100) : 100;
  const ready = daysLeft <= 0;

  return { daysLeft, daysSince, ready, targetDate, progressPct, reason };
}
