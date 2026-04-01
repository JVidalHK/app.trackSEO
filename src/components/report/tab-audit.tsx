"use client";

import { Tip, StatusIcon, ScoreColor } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabAudit({ data }: { data: any }) {
  const lh = data.lighthouse || {};
  const cwv = data.core_web_vitals || {};
  const checklist = data.audit_checklist || [];
  const passCount = checklist.filter((c: any) => c.status === "pass").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const mobilePerfGap = (lh.desktop?.performance || 0) - (lh.mobile?.performance || 0);

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
    </div>
  );
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
