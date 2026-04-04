"use client";

import { useState } from "react";
import { Tip, StatusIcon, ScoreColor, SectionTitle } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabAudit({ data }: { data: any }) {
  const lh = data.lighthouse || {};
  const cwv = data.core_web_vitals || {};
  const checklist = data.audit_checklist || [];
  const passCount = checklist.filter((c: any) => c.status === "pass").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const mobilePerfGap = (lh.desktop?.performance || 0) - (lh.mobile?.performance || 0);

  // New Phase A data
  const imageAudit = data.image_audit || {};
  const tech = data.tech_stack || {};
  const enrichedTech = data.tech_stack_enriched || {};
  const techCategories = enrichedTech.categories || tech;
  const detectedCount = enrichedTech.detected_count || 0;
  const platform = enrichedTech.platform;
  const perfIssues = data.tech_performance_issues || [];
  const speedEstimate = data.tech_speed_estimate;
  const issueItems = perfIssues.filter((i: any) => i.status === "issue");
  const goodItems = perfIssues.filter((i: any) => i.status === "good");
  const highCount = issueItems.filter((i: any) => i.impact === "high").length;
  const medCount = issueItems.filter((i: any) => i.impact === "medium").length;

  return (
    <div className="space-y-4">
      {/* ── Lighthouse scores (existing, unchanged) ── */}
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

      {/* ── Core Web Vitals (existing, unchanged) ── */}
      <div>
        <div className="text-sm font-medium mb-2"><Tip k="core_web_vitals">Core Web Vitals</Tip> (mobile)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <CWVBox label={<Tip k="lcp">LCP</Tip>} value={cwv.lcp_ms ? `${(cwv.lcp_ms / 1000).toFixed(1)}s` : "—"} good={cwv.lcp_ms < 2500} bad={cwv.lcp_ms > 4000} />
          <CWVBox label={<Tip k="fid">FID</Tip>} value={cwv.fid_ms ? `${cwv.fid_ms}ms` : "—"} good={cwv.fid_ms < 100} bad={cwv.fid_ms > 300} />
          <CWVBox label={<Tip k="cls">CLS</Tip>} value={cwv.cls != null ? String(cwv.cls) : "—"} good={cwv.cls < 0.1} bad={cwv.cls > 0.25} />
          <CWVBox label={<Tip k="ttfb">TTFB</Tip>} value={cwv.ttfb_ms ? `${cwv.ttfb_ms}ms` : "—"} good={cwv.ttfb_ms < 800} bad={cwv.ttfb_ms > 1800} />
        </div>
      </div>

      {/* ── Audit checklist (existing, unchanged) ── */}
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

      {/* ── Image SEO audit ── */}
      {(imageAudit.oversized_count > 0 || imageAudit.missing_alt_count > 0) && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.3" />
              <circle cx="5.5" cy="6.5" r="1.5" stroke="#F59E0B" strokeWidth="1" />
              <path d="M2 11l3-3 2 2 3-3 4 4" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Tip k="image_audit">Image SEO audit</Tip>
            {imageAudit.missing_alt_count > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-normal">{imageAudit.missing_alt_count} without alt text</span>}
            {imageAudit.oversized_count > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-normal">{imageAudit.oversized_count} oversized</span>}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {imageAudit.missing_alt_count > 0 && (
              <div className="bg-surface rounded-xl p-3 border border-border">
                <div className="text-xs font-medium text-text-secondary mb-2"><Tip k="alt_text">Missing alt text</Tip></div>
                {(imageAudit.missing_alt || []).slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0 text-xs">
                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{getFileName(img.url)}</span>
                    <span className="text-danger text-[10px]">No alt</span>
                  </div>
                ))}
                {imageAudit.missing_alt_count > 4 && <div className="text-[10px] text-text-tertiary mt-1">+ {imageAudit.missing_alt_count - 4} more without alt text</div>}
              </div>
            )}
            {imageAudit.oversized_count > 0 && (
              <div className="bg-surface rounded-xl p-3 border border-border">
                <div className="text-xs font-medium text-text-secondary mb-2"><Tip k="oversized_images">Oversized images</Tip></div>
                {(imageAudit.oversized || []).slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0 text-xs">
                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{getFileName(img.url)}</span>
                    <span className="text-danger font-medium min-w-[50px] text-right">{fmtSize(img.size_kb)}</span>
                    <span className="text-success text-[10px] min-w-[60px] text-right">save {fmtSize(img.potential_save_kb)}</span>
                  </div>
                ))}
                {imageAudit.oversized_count > 4 && <div className="text-[10px] text-text-tertiary mt-1">+ {imageAudit.oversized_count - 4} more oversized · Total savings: ~{fmtSize(imageAudit.total_savings_kb)}</div>}
              </div>
            )}
          </div>
          {platform === "wordpress" && (
            <div className="text-xs text-text-secondary bg-surface rounded-lg p-2.5 mt-2 border border-border">
              <span className="font-medium text-text-primary">WordPress fix:</span> Install ShortPixel or Imagify plugin. Go to Media &gt; Bulk optimize. Both offer free tiers. Expected speed gain: 2-3 seconds on image-heavy pages.
            </div>
          )}
        </div>
      )}

      {/* ── Tech stack (moved from Pages and tech) ── */}
      <div>
        <SectionTitle>
          <Tip k="tech_stack">Your website tech stack</Tip>
          {detectedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary font-normal">{detectedCount} detected</span>}
        </SectionTitle>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <TechRow label="CMS and platform" items={[...(techCategories.cms || []), ...(techCategories.platform || [])]} highlight perfIssues={perfIssues} />
          <TechRow label={<Tip k="cdn">Hosting and CDN</Tip>} items={[...(techCategories.hosting || []), ...(techCategories.cdn || [])]} perfIssues={perfIssues} />
          <TechRow label="SEO and analytics" items={[...(techCategories.seo_tools || []), ...(techCategories.analytics || [])]} perfIssues={perfIssues} goodHighlight />
          <TechRow label="Plugins and extensions" items={techCategories.plugins || []} perfIssues={perfIssues} />
          <TechRow label="Page builders" items={techCategories.page_builder || []} perfIssues={perfIssues} />
          <TechRow label="JavaScript and frontend" items={[...(techCategories.javascript || []), ...(techCategories.css_framework || []), ...(techCategories.framework || [])]} perfIssues={perfIssues} />
          <TechRow label="Security" items={techCategories.security || []} perfIssues={perfIssues} />
          <TechRow label="Marketing" items={[...(techCategories.marketing || []), ...(techCategories.advertising || [])]} perfIssues={perfIssues} />
          <TechRow label="Ecommerce" items={techCategories.ecommerce || []} perfIssues={perfIssues} />
          <TechRow label="Other" items={[...(techCategories.other || []), ...(techCategories.payment || []), ...(techCategories.fonts || []), ...(techCategories.database || []), ...(techCategories.language || []), ...(techCategories.optimization || [])]} perfIssues={perfIssues} />
          {techCategories.missing_recommended?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-text-secondary mb-1">Missing (recommended)</div>
              <div className="flex flex-wrap gap-1">
                {techCategories.missing_recommended.map((item: string, i: number) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${item.toLowerCase().includes("no schema") ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Performance issues (moved from Pages and tech) ── */}
      {issueItems.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#F59E0B" strokeWidth="1.3" />
              <path d="M8 5.5v3M8 10.5v.5" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <Tip k="perf_issues">Performance issues</Tip>
            {highCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-normal">{highCount} high</span>}
            {medCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-normal">{medCount} medium</span>}
          </SectionTitle>
          <div className="space-y-1.5">
            {issueItems.map((issue: any, i: number) => <PerfCard key={i} issue={issue} />)}
            {goodItems.slice(0, 3).map((issue: any, i: number) => <PerfCard key={`g-${i}`} issue={issue} />)}
          </div>
        </div>
      )}

      {/* ── Estimated speed gains (moved from Pages and tech) ── */}
      {speedEstimate && speedEstimate.current_load_time_ms > 0 && issueItems.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v4l2.5 1.5" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="6" stroke="#60A5FA" strokeWidth="1.3" />
            </svg>
            <Tip k="speed_gains">Estimated speed gains</Tip>
          </SectionTitle>
          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="text-xs text-text-secondary">Fix all {issueItems.length} issues for these gains:</div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-[10px] text-text-secondary">Current</div>
                  <div className="text-xl font-medium text-warning">{(speedEstimate.current_load_time_ms / 1000).toFixed(1)}s</div>
                </div>
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                  <path d="M1 5h16M13 1l4 4-4 4" stroke="var(--color-text-tertiary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-center">
                  <div className="text-[10px] text-text-secondary">Projected</div>
                  <div className="text-xl font-medium text-success">{(speedEstimate.projected_load_time_ms / 1000).toFixed(1)}s</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-bg rounded-lg p-2.5">
                <div className="text-xs text-text-secondary mb-0.5">Load time saved</div>
                <span className="text-lg font-medium text-success">{((speedEstimate.current_load_time_ms - speedEstimate.projected_load_time_ms) / 1000).toFixed(1)}s</span>
                <span className="text-xs text-success ml-1">{Math.round((1 - speedEstimate.projected_load_time_ms / speedEstimate.current_load_time_ms) * 100)}% faster</span>
              </div>
              <div className="bg-bg rounded-lg p-2.5">
                <div className="text-xs text-text-secondary mb-0.5">Resources saved</div>
                <span className="text-lg font-medium text-info">{speedEstimate.resources_saved_kb}KB</span>
                <span className="text-xs text-text-secondary ml-1">CSS + JS</span>
              </div>
              <div className="bg-bg rounded-lg p-2.5">
                <div className="text-xs text-text-secondary mb-0.5">Lighthouse estimate</div>
                <span className="text-lg font-medium text-success">{speedEstimate.lighthouse_projected}</span>
                <span className="text-xs text-success ml-1">+{speedEstimate.lighthouse_projected - speedEstimate.lighthouse_current} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function PerfCard({ issue }: { issue: any }) {
  const [open, setOpen] = useState(false);
  const isGood = issue.status === "good";
  const borderColor = isGood ? "border-l-success" : issue.impact === "high" ? "border-l-danger" : "border-l-warning";
  const badgeCls = isGood ? "bg-success/10 text-success" : issue.impact === "high" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning";
  const badgeText = isGood ? "Good" : issue.impact === "high" ? "High impact" : "Medium impact";

  return (
    <div onClick={() => !isGood && setOpen(!open)}
      className={`rounded-r-lg p-3 border border-border border-l-[3px] ${borderColor} ${!isGood ? "cursor-pointer hover:border-border-light" : ""} transition-colors`}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCls}`}>{badgeText}</span>
        <span className="text-xs font-medium flex-1 min-w-[180px]">{issue.title}</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{issue.description}</p>
      {issue.estimated_gain_ms > 0 && !isGood && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success mt-1 inline-block">
          ~{(issue.estimated_gain_ms / 1000).toFixed(1)}s faster {issue.estimated_save_kb > 0 ? `· save ${issue.estimated_save_kb}KB` : ""}
        </span>
      )}
      {open && issue.fix_instructions && (
        <div className="mt-2 pt-2 border-t border-border text-xs text-text-secondary leading-relaxed">
          <span className="font-medium text-text-primary">How to fix this:</span>
          <p className="mt-1 whitespace-pre-line">{issue.fix_instructions}</p>
          {issue.estimated_gain_ms > 0 && (
            <p className="text-success font-medium mt-2">Estimated: {(issue.estimated_gain_ms / 1000).toFixed(1)}s faster page load</p>
          )}
        </div>
      )}
    </div>
  );
}

function TechRow({ label, items, highlight, goodHighlight, perfIssues = [] }: { label: React.ReactNode; items: string[]; highlight?: boolean; goodHighlight?: boolean; perfIssues?: any[] }) {
  if (!items || items.length === 0) return null;
  const issueNames = new Set(perfIssues.filter((i: any) => i.status === "issue" && i.tech_name).map((i: any) => i.tech_name.toLowerCase()));

  return (
    <div className="mb-2">
      <div className="text-xs font-medium text-text-secondary mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => {
          const nameLC = item.toLowerCase();
          const hasIssue = issueNames.has(nameLC) || [...issueNames].some((n) => nameLC.includes(n));
          const cls = hasIssue ? "bg-danger/10 text-danger border-transparent"
            : highlight && i === 0 ? "bg-info/10 text-info border-transparent"
            : goodHighlight && i === 0 ? "bg-success/10 text-success border-transparent"
            : "border-border";
          return <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>{item}</span>;
        })}
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

function getFileName(url: string) {
  try { return new URL(url).pathname.split("/").pop() || url; } catch { return url.split("/").pop() || url; }
}

function fmtSize(kb: number) {
  if (!kb) return "0KB";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
}
