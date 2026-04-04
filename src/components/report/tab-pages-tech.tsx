"use client";

import { useState } from "react";
import { Tip, SectionTitle, ComingSoon } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabPagesTech({ data }: { data: any }) {
  const pages = data.pages || [];
  const tech = data.tech_stack || {};
  const enrichedTech = data.tech_stack_enriched || {};
  const perfIssues = data.tech_performance_issues || [];
  const speedEstimate = data.tech_speed_estimate;
  const linkSuggestions = data.internal_linking_suggestions || [];
  const imageAudit = data.image_audit || {};

  const techCategories = enrichedTech.categories || tech;
  const detectedCount = enrichedTech.detected_count || 0;
  const platform = enrichedTech.platform;

  const issueItems = perfIssues.filter((i: any) => i.status === "issue");
  const goodItems = perfIssues.filter((i: any) => i.status === "good");
  const highCount = issueItems.filter((i: any) => i.impact === "high").length;
  const medCount = issueItems.filter((i: any) => i.impact === "medium").length;

  return (
    <div className="space-y-4">
      {/* ── Page performance (existing, unchanged) ── */}
      <div>
        <SectionTitle>
          Page performance
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary font-normal">
            {pages.length} pages analysed
          </span>
        </SectionTitle>
        <div className="bg-surface rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-3 py-2">Page</th>
              <th className="text-center font-medium px-3 py-2"><Tip k="seo_score">SEO score</Tip></th>
              <th className="text-left font-medium px-3 py-2">Load time</th>
              <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Size</th>
              <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Words</th>
              <th className="text-left font-medium px-3 py-2">Issues</th>
            </tr></thead>
            <tbody>
              {pages.map((p: any, i: number) => {
                const score = p.seo_score || 0;
                const scoreCls = score >= 80 ? "bg-[#E1F5EE] text-[#085041]" : score >= 50 ? "bg-[#FAEEDA] text-[#633806]" : "bg-[#FCEBEB] text-[#791F1F]";
                return (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-info max-w-[200px] truncate">{p.url}</td>
                    <td className="px-3 py-2 text-center"><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-medium ${scoreCls}`}>{Math.round(score)}</span></td>
                    <td className="px-3 py-2">{p.load_time_ms ? `${(p.load_time_ms / 1000).toFixed(1)}s` : "—"}</td>
                    <td className="px-3 py-2 hidden sm:table-cell">{p.size_bytes ? formatBytes(p.size_bytes) : "—"}</td>
                    <td className="px-3 py-2 hidden sm:table-cell">{(p.word_count || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={p.issues > 0 ? (p.issues >= 3 ? "text-danger" : "text-warning") : "text-success"}>{p.issues}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Internal linking opportunities ── */}
      {linkSuggestions.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 10l-1.5 1.5a2.1 2.1 0 0 1-3-3L5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-info" />
              <path d="M10 6l1.5-1.5a2.1 2.1 0 0 1 3 3L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-info" />
              <path d="M6 10l4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-info" />
            </svg>
            <Tip k="internal_links">Internal linking opportunities</Tip>
            <span className="text-xs px-2 py-0.5 rounded-full bg-info/10 text-info font-normal">
              {linkSuggestions.length} suggestions
            </span>
          </SectionTitle>
          <div className="space-y-2">
            {linkSuggestions.map((link: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6h6M6 3v6" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs">
                    <span className="font-medium text-info">{link.from_page}</span>
                    <span className="text-text-tertiary mx-1">should link to</span>
                    <span className="font-medium text-info">{link.to_page}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1">{link.reason}</p>
                  {link.shared_keywords > 0 && (
                    <span className="text-[10px] text-text-tertiary mt-1 inline-block">{link.shared_keywords} shared keyword topics</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tech stack (enhanced) ── */}
      <div>
        <SectionTitle>
          <Tip k="tech_stack">Your website tech stack</Tip>
          {detectedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary font-normal">
              {detectedCount} detected
            </span>
          )}
        </SectionTitle>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <TechCategoryRow label="CMS and platform" items={[...(techCategories.cms || []), ...(techCategories.platform || [])]} highlight perfIssues={perfIssues} />
          <TechCategoryRow label={<Tip k="cdn">Hosting and CDN</Tip>} items={[...(techCategories.hosting || []), ...(techCategories.cdn || [])]} perfIssues={perfIssues} />
          <TechCategoryRow label="SEO and analytics" items={[...(techCategories.seo_tools || []), ...(techCategories.analytics || [])]} perfIssues={perfIssues} goodHighlight />
          <TechCategoryRow label="Plugins and extensions" items={techCategories.plugins || []} perfIssues={perfIssues} />
          <TechCategoryRow label="Page builders" items={techCategories.page_builder || []} perfIssues={perfIssues} />
          <TechCategoryRow label="JavaScript and frontend" items={[...(techCategories.javascript || []), ...(techCategories.css_framework || []), ...(techCategories.framework || [])]} perfIssues={perfIssues} />
          <TechCategoryRow label="Security" items={techCategories.security || []} perfIssues={perfIssues} />
          <TechCategoryRow label="Marketing" items={[...(techCategories.marketing || []), ...(techCategories.advertising || [])]} perfIssues={perfIssues} />
          <TechCategoryRow label="Ecommerce" items={techCategories.ecommerce || []} perfIssues={perfIssues} />
          <TechCategoryRow label="Fonts" items={techCategories.fonts || []} perfIssues={perfIssues} />
          <TechCategoryRow label="Database" items={[...(techCategories.database || []), ...(techCategories.language || [])]} perfIssues={perfIssues} />
          <TechCategoryRow label="Other" items={[...(techCategories.other || []), ...(techCategories.payment || []), ...(techCategories.optimization || [])]} perfIssues={perfIssues} />

          {techCategories.missing_recommended?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-text-secondary mb-1">Missing (recommended)</div>
              <div className="flex flex-wrap gap-1">
                {techCategories.missing_recommended.map((item: string, i: number) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${item.toLowerCase().includes("no schema") ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Performance issues ── */}
      {issueItems.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" className="text-warning" />
              <path d="M8 5.5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-warning" />
            </svg>
            <Tip k="perf_issues">Performance issues</Tip>
            {highCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-normal">{highCount} high</span>}
            {medCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-normal">{medCount} medium</span>}
          </SectionTitle>
          <div className="space-y-1.5">
            {issueItems.map((issue: any, i: number) => (
              <PerfIssueCard key={i} issue={issue} />
            ))}
            {goodItems.slice(0, 3).map((issue: any, i: number) => (
              <PerfIssueCard key={`good-${i}`} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── Estimated speed gains ── */}
      {speedEstimate && speedEstimate.current_load_time_ms > 0 && issueItems.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v4l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-info" />
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" className="text-info" />
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
                <div>
                  <span className="text-lg font-medium text-success">{((speedEstimate.current_load_time_ms - speedEstimate.projected_load_time_ms) / 1000).toFixed(1)}s</span>
                  <span className="text-xs text-success ml-1">{Math.round((1 - speedEstimate.projected_load_time_ms / speedEstimate.current_load_time_ms) * 100)}% faster</span>
                </div>
              </div>
              <div className="bg-bg rounded-lg p-2.5">
                <div className="text-xs text-text-secondary mb-0.5">Resources saved</div>
                <div>
                  <span className="text-lg font-medium text-info">{speedEstimate.resources_saved_kb}KB</span>
                  <span className="text-xs text-text-secondary ml-1">CSS + JS</span>
                </div>
              </div>
              <div className="bg-bg rounded-lg p-2.5">
                <div className="text-xs text-text-secondary mb-0.5">Lighthouse estimate</div>
                <div>
                  <span className="text-lg font-medium text-success">{speedEstimate.lighthouse_projected}</span>
                  <span className="text-xs text-success ml-1">+{speedEstimate.lighthouse_projected - speedEstimate.lighthouse_current} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image SEO audit ── */}
      {(imageAudit.oversized_count > 0 || imageAudit.missing_alt_count > 0) && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" className="text-warning" />
              <circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" className="text-warning" />
              <path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-warning" />
            </svg>
            <Tip k="image_audit">Image SEO audit</Tip>
            {imageAudit.missing_alt_count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-normal">{imageAudit.missing_alt_count} without alt text</span>
            )}
            {imageAudit.oversized_count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-normal">{imageAudit.oversized_count} oversized</span>
            )}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {imageAudit.missing_alt_count > 0 && (
              <div className="bg-surface rounded-xl p-3 border border-border">
                <div className="text-xs font-medium text-text-secondary mb-2">
                  <Tip k="alt_text">Missing alt text</Tip>
                </div>
                {(imageAudit.missing_alt || []).slice(0, 5).map((img: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0 text-xs">
                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{getFileName(img.url)}</span>
                    <span className="text-danger text-[10px]">No alt</span>
                  </div>
                ))}
                {imageAudit.missing_alt_count > 5 && (
                  <div className="text-[10px] text-text-tertiary mt-1">+ {imageAudit.missing_alt_count - 5} more without alt text</div>
                )}
              </div>
            )}
            {imageAudit.oversized_count > 0 && (
              <div className="bg-surface rounded-xl p-3 border border-border">
                <div className="text-xs font-medium text-text-secondary mb-2">
                  <Tip k="oversized_images">Oversized images</Tip>
                </div>
                {(imageAudit.oversized || []).slice(0, 5).map((img: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0 text-xs">
                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{getFileName(img.url)}</span>
                    <span className="text-danger font-medium min-w-[50px] text-right">{img.size_kb >= 1024 ? `${(img.size_kb / 1024).toFixed(1)}MB` : `${img.size_kb}KB`}</span>
                    <span className="text-success text-[10px] min-w-[60px] text-right">save {img.potential_save_kb >= 1024 ? `${(img.potential_save_kb / 1024).toFixed(1)}MB` : `${img.potential_save_kb}KB`}</span>
                  </div>
                ))}
                {imageAudit.oversized_count > 5 && (
                  <div className="text-[10px] text-text-tertiary mt-1">+ {imageAudit.oversized_count - 5} more oversized · Total savings: ~{imageAudit.total_savings_kb >= 1024 ? `${(imageAudit.total_savings_kb / 1024).toFixed(1)}MB` : `${imageAudit.total_savings_kb}KB`}</div>
                )}
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
    </div>
  );
}

function PerfIssueCard({ issue }: { issue: any }) {
  const [open, setOpen] = useState(false);
  const isGood = issue.status === "good";
  const borderColor = isGood ? "border-l-success" : issue.impact === "high" ? "border-l-danger" : "border-l-warning";
  const badgeCls = isGood ? "bg-success/10 text-success" : issue.impact === "high" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning";
  const badgeText = isGood ? "Good" : issue.impact === "high" ? "High impact" : issue.impact === "medium" ? "Medium impact" : "Low impact";

  return (
    <div
      onClick={() => !isGood && setOpen(!open)}
      className={`rounded-r-lg p-3 border border-border border-l-[3px] ${borderColor} ${!isGood ? "cursor-pointer hover:border-border-light" : ""} transition-colors`}
    >
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
            <p className="text-success font-medium mt-2">Estimated: {(issue.estimated_gain_ms / 1000).toFixed(1)}s faster page load{issue.estimated_save_kb > 0 ? `, ${issue.estimated_save_kb}KB saved` : ""}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TechCategoryRow({ label, items, highlight, goodHighlight, perfIssues = [] }: { label: React.ReactNode; items: string[]; highlight?: boolean; goodHighlight?: boolean; perfIssues?: any[] }) {
  if (!items || items.length === 0) return null;

  // Check which items have performance issues
  const issueNames = new Set(
    perfIssues.filter((i: any) => i.status === "issue" && i.tech_name).map((i: any) => i.tech_name.toLowerCase())
  );

  return (
    <div className="mb-2">
      <div className="text-xs font-medium text-text-secondary mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => {
          const nameLC = item.toLowerCase();
          const hasIssue = issueNames.has(nameLC) || [...issueNames].some((n) => nameLC.includes(n));
          const cls = hasIssue
            ? "bg-danger/10 text-danger border-transparent"
            : highlight && i === 0
            ? "bg-info/10 text-info border-transparent"
            : goodHighlight && i === 0
            ? "bg-success/10 text-success border-transparent"
            : "border-border";
          return (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileName(url: string) {
  try {
    const path = new URL(url).pathname;
    return path.split("/").pop() || path;
  } catch {
    return url.split("/").pop() || url;
  }
}
