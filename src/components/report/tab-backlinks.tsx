"use client";

import { Tip } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabBacklinks({ data }: { data: any }) {
  const bl = data.backlinks || {};
  const overview = data.overview || {};
  const da = overview.domain_authority || bl.domain_authority || 0;
  const pa = overview.page_authority || bl.page_authority || 0;
  const spam = bl.spam_score ?? -1;

  return (
    <div className="space-y-4">
      {/* Authority scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="da">Domain Authority</Tip></div>
          <div className="text-lg font-medium">{da}<span className="text-xs text-text-tertiary font-normal">/100</span></div>
        </div>
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="pa">Page Authority</Tip></div>
          <div className="text-lg font-medium">{pa}<span className="text-xs text-text-tertiary font-normal">/100</span></div>
        </div>
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="spam_score">Spam Score</Tip></div>
          <div className={`text-lg font-medium ${spam >= 6 ? "text-danger" : spam >= 3 ? "text-warning" : spam >= 0 ? "text-success" : ""}`}>
            {spam >= 0 ? `${spam}%` : "N/A"}
          </div>
        </div>
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="dofollow">Dofollow ratio</Tip></div>
          <div className="text-lg font-medium">{bl.dofollow_ratio ? `${bl.dofollow_ratio}%` : "N/A"}</div>
        </div>
      </div>

      {/* Backlink metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="backlinks">Total backlinks</Tip></div>
          <div className="text-lg font-medium">{bl.total ? bl.total.toLocaleString() : "N/A"}</div>
        </div>
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="text-xs text-text-secondary mb-0.5"><Tip k="referring_domains">Referring domains</Tip></div>
          <div className="text-lg font-medium">{bl.referring_domains ? bl.referring_domains.toLocaleString() : "N/A"}</div>
        </div>
      </div>

      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
        <div className="text-sm font-medium mb-2">Deep backlink analysis</div>
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-warning/15 text-warning font-medium">Coming soon</span>
      </div>
    </div>
  );
}
