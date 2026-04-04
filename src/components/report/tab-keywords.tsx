"use client";

import { useState } from "react";
import { Doughnut, CHART_COLORS } from "./chart-wrapper";
import { PositionPill, Tip, SectionTitle } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabKeywords({ data }: { data: any }) {
  const kw = data.keywords || {};
  const items = kw.items || [];
  const pd = kw.position_distribution || {};
  const ib = kw.intent_breakdown || {};
  const gaps = data.content_gaps || [];
  const opportunities = data.keyword_opportunities || [];
  const pageMapping = data.page_keyword_mapping || [];

  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const filtered = items.filter((k: any) => {
    if (search && !k.keyword?.toLowerCase().includes(search.toLowerCase())) return false;
    if (intentFilter !== "all" && k.intent !== intentFilter) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="text-xs text-text-secondary mb-2"><Tip k="position">Position distribution</Tip></div>
          <div className="h-36 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ["Top 3", "4-10", "11-20", "21-100"],
                datasets: [{ data: [pd.top3 || 0, (pd.top10 || 0) - (pd.top3 || 0), (pd.top20 || 0) - (pd.top10 || 0), (pd.top100 || 0) - (pd.top20 || 0)], backgroundColor: [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.gray], borderWidth: 0, spacing: 2 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="flex justify-center gap-3 mt-2 text-[10px] text-text-secondary">
            <span><span className="inline-block w-2 h-2 rounded-full bg-success mr-1" />Top 3: {pd.top3}</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-info mr-1" />4-10: {(pd.top10 || 0) - (pd.top3 || 0)}</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-warning mr-1" />11-20: {(pd.top20 || 0) - (pd.top10 || 0)}</span>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="text-xs text-text-secondary mb-2"><Tip k="intent">Search intent</Tip></div>
          <div className="h-36 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ["Informational", "Commercial", "Transactional", "Navigational"],
                datasets: [{ data: [ib.informational || 0, ib.commercial || 0, ib.transactional || 0, ib.navigational || 0], backgroundColor: [CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.green, CHART_COLORS.gray], borderWidth: 0, spacing: 2 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="flex justify-center gap-3 mt-2 text-[10px] text-text-secondary flex-wrap">
            <span><span className="inline-block w-2 h-2 rounded-full bg-info mr-1" />Info: {ib.informational}</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-warning mr-1" />Comm: {ib.commercial}</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-success mr-1" />Trans: {ib.transactional}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text" placeholder="Search keywords..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[150px] h-8 px-2.5 text-xs bg-surface border border-border rounded-lg focus:border-accent focus:outline-none"
        />
        <select value={intentFilter} onChange={(e) => { setIntentFilter(e.target.value); setPage(0); }} className="h-8 px-2 text-xs bg-surface border border-border rounded-lg">
          <option value="all">All intents</option>
          <option value="informational">Informational</option>
          <option value="commercial">Commercial</option>
          <option value="transactional">Transactional</option>
          <option value="navigational">Navigational</option>
        </select>
      </div>

      {/* Keyword table */}
      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-text-secondary">
            <th className="text-left font-medium px-3 py-2">Keyword</th>
            <th className="text-center font-medium px-3 py-2">Pos</th>
            <th className="text-center font-medium px-3 py-2">Volume</th>
            <th className="text-center font-medium px-3 py-2">Traffic</th>
            <th className="text-center font-medium px-3 py-2 hidden sm:table-cell"><Tip k="cpc">CPC</Tip></th>
            <th className="text-center font-medium px-3 py-2 hidden sm:table-cell">Intent</th>
            <th className="text-left font-medium px-3 py-2 hidden md:table-cell">Page</th>
          </tr></thead>
          <tbody>
            {pageItems.map((k: any, i: number) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 font-medium max-w-[200px] truncate">{k.keyword}</td>
                <td className="px-3 py-2 text-center"><PositionPill position={k.position || 0} /></td>
                <td className="px-3 py-2 text-center">{(k.volume || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-center">{(k.traffic || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-center hidden sm:table-cell text-text-secondary">{k.cpc ? `$${k.cpc.toFixed(2)}` : "—"}</td>
                <td className="px-3 py-2 text-center hidden sm:table-cell text-text-secondary capitalize">{k.intent || "—"}</td>
                <td className="px-3 py-2 hidden md:table-cell text-info truncate max-w-[120px]">{k.url || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 rounded bg-surface border border-border disabled:opacity-30">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 rounded bg-surface border border-border disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {/* Keyword opportunities (scored) */}
      {opportunities.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#10B981" strokeWidth="1.3" /><path d="M8 5v6M5 8h6" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" /></svg>
            <Tip k="keyword_opportunities">Keyword opportunities</Tip>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-normal">{opportunities.length} gaps found</span>
          </SectionTitle>
          <div className="bg-surface rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Keyword gap</th>
                <th className="text-center font-medium px-3 py-2">Volume</th>
                <th className="text-center font-medium px-3 py-2"><Tip k="difficulty">KD</Tip></th>
                <th className="text-center font-medium px-3 py-2"><Tip k="competitors">Competitors</Tip></th>
                <th className="text-center font-medium px-3 py-2"><Tip k="opp_score">Opp. score</Tip></th>
                <th className="text-center font-medium px-3 py-2">Est. traffic</th>
              </tr></thead>
              <tbody>
                {opportunities.slice(0, 15).map((o: any, i: number) => {
                  const kdCls = (o.difficulty || 0) < 30 ? "bg-success/10 text-success" : (o.difficulty || 0) < 60 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger";
                  const scoreCls = (o.opportunity_score || 0) > 80 ? "bg-success/10 text-success" : (o.opportunity_score || 0) > 50 ? "bg-warning/10 text-warning" : "bg-surface text-text-secondary";
                  return (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 font-medium">{o.keyword}</td>
                      <td className="px-3 py-2 text-center">{(o.volume || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"><span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${kdCls}`}>{o.difficulty || "—"}</span></td>
                      <td className="px-3 py-2 text-center">{o.competitors_ranking || "—"}</td>
                      <td className="px-3 py-2 text-center"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${scoreCls}`}>{o.opportunity_score || "—"}</span></td>
                      <td className="px-3 py-2 text-center text-success font-medium">~{(o.potential_traffic || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-text-secondary mt-1.5">
            Total untapped traffic from top {Math.min(opportunities.length, 15)} gaps: <span className="text-success font-medium">~{opportunities.slice(0, 15).reduce((s: number, o: any) => s + (o.potential_traffic || 0), 0).toLocaleString()} visitors/month</span>
          </div>
        </div>
      )}

      {/* Content gaps (original) */}
      {gaps.length > 0 && opportunities.length === 0 && (
        <div>
          <div className="text-sm font-medium mb-2"><Tip k="content_gaps">Content gaps — missed opportunities</Tip></div>
          <div className="bg-surface rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Missing keyword</th>
                <th className="text-left font-medium px-3 py-2">Volume</th>
                <th className="text-left font-medium px-3 py-2"><Tip k="difficulty">Difficulty</Tip></th>
                <th className="text-left font-medium px-3 py-2">Competitors</th>
                <th className="text-left font-medium px-3 py-2">Potential traffic</th>
              </tr></thead>
              <tbody>
                {gaps.slice(0, 20).map((g: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium">{g.keyword}</td>
                    <td className="px-3 py-2">{(g.volume || 0).toLocaleString()}</td>
                    <td className="px-3 py-2"><span className={g.difficulty_label === "Easy" ? "text-success" : g.difficulty_label === "Medium" ? "text-warning" : "text-danger"}>{g.difficulty_label || g.difficulty}</span></td>
                    <td className="px-3 py-2">{g.competitors_ranking || "—"}</td>
                    <td className="px-3 py-2 text-success font-medium">+{(g.potential_traffic || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Page keyword mapping */}
      {pageMapping.length > 0 && (
        <div>
          <SectionTitle>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h4l2-4 2 8 2-4h3" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <Tip k="page_mapping">Page keyword mapping</Tip>
          </SectionTitle>
          <div className="bg-surface rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Page</th>
                <th className="text-left font-medium px-3 py-2">Keywords</th>
                <th className="text-left font-medium px-3 py-2">Top keyword</th>
                <th className="text-center font-medium px-3 py-2">In title?</th>
                <th className="text-center font-medium px-3 py-2">In H1?</th>
                <th className="text-left font-medium px-3 py-2">Issue</th>
              </tr></thead>
              <tbody>
                {pageMapping.slice(0, 15).map((m: any, i: number) => {
                  const isOk = m.issue === "Well optimised";
                  return (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 text-info">{m.page}</td>
                      <td className="px-3 py-2">{m.keyword_count}</td>
                      <td className="px-3 py-2 font-medium">{m.top_keyword}</td>
                      <td className="px-3 py-2 text-center">{m.in_title ? <CheckSvg /> : <CrossSvg />}</td>
                      <td className="px-3 py-2 text-center">{m.in_h1 ? <CheckSvg /> : <CrossSvg />}</td>
                      <td className={`px-3 py-2 text-[10px] ${isOk ? "text-success" : "text-danger"}`}>{m.issue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="inline-block">
      <circle cx="6" cy="6" r="5" fill="none" stroke="#10B981" strokeWidth="1.2" />
      <path d="M4 6l1.5 1.5 3-3" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="inline-block">
      <circle cx="6" cy="6" r="5" fill="none" stroke="#EF4444" strokeWidth="1.2" />
      <path d="M4 4l4 4M8 4l-4 4" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
