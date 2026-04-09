"use client";

import { useState, Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import { TabOverview } from "./tab-overview";

// Lazy-load non-default tabs (code-splitting)
const TabKeywords = lazy(() => import("./tab-keywords").then(m => ({ default: m.TabKeywords })));
const TabAIVisibility = lazy(() => import("./tab-ai-visibility").then(m => ({ default: m.TabAIVisibility })));
const TabPagesTech = lazy(() => import("./tab-pages-tech").then(m => ({ default: m.TabPagesTech })));
const TabAudit = lazy(() => import("./tab-audit").then(m => ({ default: m.TabAudit })));
const TabCompetitors = lazy(() => import("./tab-competitors").then(m => ({ default: m.TabCompetitors })));
const TabBacklinks = lazy(() => import("./tab-backlinks").then(m => ({ default: m.TabBacklinks })));
const PdfReport = lazy(() => import("./pdf-report").then(m => ({ default: m.PdfReport })));

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "keywords", label: "Keywords" },
  { key: "ai-visibility", label: "AI visibility" },
  { key: "pages-tech", label: "Pages and linking" },
  { key: "audit", label: "Technical audit" },
  { key: "competitors", label: "Competitors" },
  { key: "backlinks", label: "Backlinks" },
];

export function ReportViewer({ data, domain, date, market, shared }: {
  data: any;
  domain: string;
  date: string;
  market?: any;
  shared?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = TABS.findIndex((t) => t.key === searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0);

  const scores = data?.scores || {};
  const techStack = data?.tech_stack;
  const checklist = data?.audit_checklist || [];
  const actions = data?.action_plan || [];
  const perfIssues = (data?.tech_performance_issues || []).filter((i: any) => i.status === "issue");
  const imageAudit = data?.image_audit || {};
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  // Count real issues: checklist fails + warns + perf engine issues + image issues
  const issueCount = failCount + warnCount + perfIssues.length + (imageAudit.missing_alt_count || 0) + (imageAudit.oversized_count || 0);
  const quickWins = actions.filter((a: any) => a.priority === "high").length || (scores.overall < 85 ? Math.min(actions.length, 3) : 0);

  function setTab(index: number) {
    setActiveTab(index);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", TABS[index].key);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  async function handleShare() {
    const url = `${window.location.origin}/report/${data?.reportId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Shareable link copied to clipboard");
    } catch {
      prompt("Copy this link:", url);
    }
  }

  return (
    <>
    <div className="screen-only">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-3 flex-wrap">
        <ScoreRing score={scores.overall || 0} size={64} strokeWidth={4.5} label="SEO score" />
        <div className="flex-1 min-w-[180px]">
          <div className="text-base font-medium">{domain}</div>
          <div className="text-xs text-text-secondary">
            {date}
            {techStack?.cms?.[0] && ` · Built with ${techStack.cms[0]}`}
            {market?.primary_country_name && ` · ${market.primary_country_name}`}
          </div>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {scores.overall >= 80 ? (
              <Pill bg="bg-accent/10" color="text-accent">Good health</Pill>
            ) : scores.overall >= 50 ? (
              <Pill bg="bg-warning/10" color="text-warning">Needs attention</Pill>
            ) : (
              <Pill bg="bg-danger/10" color="text-danger">Poor health</Pill>
            )}
            {issueCount > 0 && (
              <Pill bg="bg-warning/10" color="text-warning">{issueCount} issues</Pill>
            )}
            {quickWins > 0 && (
              <Pill bg="bg-accent/10" color="text-accent">{quickWins} quick wins</Pill>
            )}
          </div>
        </div>
        {!shared && (
          <div className="flex gap-1.5">
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors" onClick={() => { const prev = document.title; document.title = `${domain} - TrackSEO`; window.print(); document.title = prev; }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6V2h8v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12H2V8h12v4h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="10" width="8" height="4" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Export PDF
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors" onClick={handleShare}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 7l4-2M6 9l4 2" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Share
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-4 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setTab(i)}
            className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
              activeTab === i
                ? "text-text-primary font-medium border-text-primary"
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && <TabOverview data={data} onTabChange={setTab} />}
      <Suspense fallback={<div className="py-8 text-center text-xs text-text-tertiary">Loading...</div>}>
        {activeTab === 1 && <TabKeywords data={data} />}
        {activeTab === 2 && <TabAIVisibility data={data} />}
        {activeTab === 3 && <TabPagesTech data={data} />}
        {activeTab === 4 && <TabAudit data={data} />}
        {activeTab === 5 && <TabCompetitors data={{ ...data, domain }} />}
        {activeTab === 6 && <TabBacklinks data={data} />}
      </Suspense>

      <div className="text-center py-3 text-xs text-text-tertiary">
        Powered by TrackSEO · Data freshness: live
      </div>
    </div>
    <Suspense fallback={null}>
      <div className="print-only hidden">
        <PdfReport data={data} domain={domain} date={date} market={market} />
      </div>
    </Suspense>
    </>
  );
}

function Pill({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color}`}>{children}</span>;
}
