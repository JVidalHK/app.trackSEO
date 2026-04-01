"use client";

import { Tip, StatusIcon, ScoreColor, ExpandableCard } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabAudit({ data }: { data: any }) {
  const lh = data.lighthouse || {};
  const cwv = data.core_web_vitals || {};
  const checklist = data.audit_checklist || [];
  const actions = data.action_plan || [];
  const passCount = checklist.filter((c: any) => c.status === "pass").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const mobilePerfGap = (lh.desktop?.performance || 0) - (lh.mobile?.performance || 0);

  // Get technical recommendations from AI action plan
  const techActions = actions.filter((a: any) => a.category === "technical");
  // If no technical-specific actions, show any actions that mention performance/speed/mobile
  const perfActions = techActions.length > 0 ? techActions : actions.filter((a: any) => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    return text.includes("speed") || text.includes("performance") || text.includes("mobile") || text.includes("compress") || text.includes("cache") || text.includes("load");
  });

  // Generate quick tips from audit failures
  const quickTips = generateQuickTips(checklist, lh, cwv);

  return (
    <div className="space-y-4">
      {/* Lighthouse */}
      <div>
        <div className="text-sm font-medium mb-2"><Tip k="lighthouse">Lighthouse scores</Tip></div>
        {mobilePerfGap > 15 && (
          <div className="text-xs text-warning bg-warning/10 px-3 py-1.5 rounded-lg mb-2">
            Your mobile performance ({lh.mobile?.performance || 0}) is significantly lower than desktop ({lh.desktop?.performance || 0}) — this gap is hurting your Google rankings.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <LighthouseDevice label="Mobile (used for rankings)" data={lh.mobile} />
          <LighthouseDevice label="Desktop" data={lh.desktop} />
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <div className="text-sm font-medium mb-2"><Tip k="core_web_vitals">Core Web Vitals</Tip> (mobile)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <CWVBox label={<Tip k="lcp">LCP</Tip>} value={cwv.lcp_ms ? `${(cwv.lcp_ms / 1000).toFixed(1)}s` : "—"} good={cwv.lcp_ms < 2500} bad={cwv.lcp_ms > 4000} />
          <CWVBox label={<Tip k="fid">FID</Tip>} value={cwv.fid_ms ? `${cwv.fid_ms}ms` : "—"} good={cwv.fid_ms < 100} bad={cwv.fid_ms > 300} />
          <CWVBox label={<Tip k="cls">CLS</Tip>} value={cwv.cls != null ? String(cwv.cls) : "—"} good={cwv.cls < 0.1} bad={cwv.cls > 0.25} />
          <CWVBox label={<Tip k="ttfb">TTFB</Tip>} value={cwv.ttfb_ms ? `${cwv.ttfb_ms}ms` : "—"} good={cwv.ttfb_ms < 800} bad={cwv.ttfb_ms > 1800} />
        </div>
      </div>

      {/* Audit checklist */}
      <div>
        <div className="text-sm font-medium mb-2 flex items-center gap-2 flex-wrap">
          Audit checklist
          {passCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">{passCount} pass</span>}
          {warnCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">{warnCount} warnings</span>}
          {failCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger">{failCount} errors</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checklist.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs">
              <StatusIcon status={item.status} />
              {item.item}
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggested improvements */}
      {(perfActions.length > 0 || quickTips.length > 0) && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.5 6.5L16 7.5L12 11.5L13 16L8 13.5L3 16L4 11.5L0 7.5L5.5 6.5L8 1Z" fill="#F59E0B" />
            </svg>
            Suggested improvements
          </div>

          {/* Quick tips from audit failures */}
          {quickTips.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {quickTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-xs">
                  <span className="text-warning mt-0.5">●</span>
                  <div>
                    <span className="font-medium">{tip.title}</span>
                    <span className="text-text-secondary"> — {tip.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI action plan items related to technical */}
          {perfActions.length > 0 && (
            <div className="space-y-1.5">
              {perfActions.slice(0, 3).map((a: any, i: number) => (
                <ExpandableCard key={i} priority={a.priority} title={a.title} description={a.description} timeEstimate={a.time_estimate} steps={a.steps} expectedImpact={a.expected_impact} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function generateQuickTips(checklist: any[], lh: any, cwv: any) {
  const tips: { title: string; description: string }[] = [];

  // Check for slow LCP
  if (cwv.lcp_ms > 2500) {
    tips.push({
      title: "Improve Largest Contentful Paint",
      description: `Your LCP is ${(cwv.lcp_ms / 1000).toFixed(1)}s (should be under 2.5s). Optimize your largest visible element — usually a hero image or heading. Compress images, use WebP format, and add lazy loading.`,
    });
  }

  // Check for poor mobile performance
  if (lh.mobile?.performance && lh.mobile.performance < 50) {
    tips.push({
      title: "Mobile performance needs attention",
      description: `Your mobile score is ${lh.mobile.performance}. Focus on reducing JavaScript bundle size, deferring non-critical scripts, and optimizing images for mobile screens.`,
    });
  }

  // Check audit failures
  for (const item of checklist) {
    if (item.status === "fail" && item.item.includes("meta description")) {
      tips.push({
        title: "Add missing meta descriptions",
        description: "Pages without meta descriptions get lower click-through rates from search results. Write unique 150-160 character descriptions for each page.",
      });
      break;
    }
  }

  // Check for high CLS
  if (cwv.cls > 0.1) {
    tips.push({
      title: "Reduce layout shift",
      description: `Your CLS is ${cwv.cls} (should be under 0.1). Set explicit width/height on images and ads, and avoid inserting content above existing content.`,
    });
  }

  return tips.slice(0, 3);
}

function LighthouseDevice({ label, data }: { label: string; data: any }) {
  if (!data) return <div className="bg-surface rounded-xl p-4 border border-border text-center text-xs text-text-secondary">{label}: No data</div>;
  return (
    <div className="bg-surface rounded-xl p-4 border border-border text-center">
      <div className="text-xs text-text-secondary mb-3 font-medium">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <div><div className="text-[10px] text-text-secondary">Performance</div><div className="text-xl font-medium"><ScoreColor score={data.performance || 0} /></div></div>
        <div><div className="text-[10px] text-text-secondary">Accessibility</div><div className="text-xl font-medium"><ScoreColor score={data.accessibility || 0} /></div></div>
        <div><div className="text-[10px] text-text-secondary">SEO</div><div className="text-xl font-medium"><ScoreColor score={data.seo || 0} /></div></div>
        <div><div className="text-[10px] text-text-secondary">Best practices</div><div className="text-xl font-medium"><ScoreColor score={data.best_practices || 0} /></div></div>
      </div>
    </div>
  );
}

function CWVBox({ label, value, good, bad }: { label: React.ReactNode; value: string; good: boolean; bad: boolean }) {
  return (
    <div className="bg-surface rounded-lg p-2.5 border border-border text-center">
      <div className="text-[10px] text-text-secondary">{label}</div>
      <div className={`text-base font-medium mt-0.5 ${good ? "text-success" : bad ? "text-danger" : "text-warning"}`}>{value}</div>
    </div>
  );
}
