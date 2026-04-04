"use client";

import { Tip, SectionTitle } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabPagesTech({ data }: { data: any }) {
  const pages = data.pages || [];
  const linkSuggestions = data.internal_linking_suggestions || [];

  return (
    <div className="space-y-4">
      {/* ── Page performance ── */}
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
              <path d="M6 10l-1.5 1.5a2.1 2.1 0 0 1-3-3L5 5" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M10 6l1.5-1.5a2.1 2.1 0 0 1 3 3L11 11" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M6 10l4-4" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" />
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
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
