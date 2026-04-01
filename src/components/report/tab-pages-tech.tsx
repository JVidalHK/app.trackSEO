"use client";

import { Tip } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabPagesTech({ data }: { data: any }) {
  const pages = data.pages || [];
  const tech = data.tech_stack || {};

  return (
    <div className="space-y-4">
      {/* Page performance */}
      <div>
        <div className="text-sm font-medium mb-2">
          Page performance
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary font-normal ml-2">
            {pages.length} pages analysed
          </span>
        </div>
        <div className="bg-surface rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-3 py-2">Page</th>
              <th className="text-left font-medium px-3 py-2"><Tip k="seo_score">SEO score</Tip></th>
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
                    <td className="px-3 py-2"><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${scoreCls}`}>{score}</span></td>
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

      {/* Tech stack */}
      <div>
        <div className="text-sm font-medium mb-2">
          <Tip k="cms">Your website tech stack</Tip>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          {tech.cms?.length > 0 && <TechCategory label="CMS and platform" items={tech.cms} highlight />}
          {tech.platform?.length > 0 && <TechCategory label="Platform" items={tech.platform} />}
          {tech.hosting?.length > 0 && <TechCategory label={<><Tip k="cdn">Hosting and CDN</Tip></>} items={tech.hosting} />}
          {tech.plugins?.length > 0 && <TechCategory label="Plugins" items={tech.plugins} />}
          {tech.analytics?.length > 0 && <TechCategory label="Analytics" items={tech.analytics} />}
          {tech.javascript?.length > 0 && <TechCategory label="JavaScript" items={tech.javascript} />}
          {tech.missing_recommended?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-text-secondary mb-1">Missing (recommended)</div>
              <div className="flex flex-wrap gap-1">
                {tech.missing_recommended.map((item: string, i: number) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${item.toLowerCase().includes("no schema") ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TechCategory({ label, items, highlight }: { label: React.ReactNode; items: string[]; highlight?: boolean }) {
  return (
    <div className="mb-2">
      <div className="text-xs font-medium text-text-secondary mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${highlight && i === 0 ? "bg-info/10 text-info border-transparent" : "border-border"}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
