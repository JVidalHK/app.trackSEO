"use client";

import { ScoreRing } from "@/components/ui/score-ring";
import { Tip, TrendPill, ExpandableCard, FactorBar, ComingSoon } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TabAIVisibility({ data }: { data: any }) {
  const ai = data.ai_visibility || {};
  const score = ai.readiness_score ?? data.scores?.ai_readiness ?? 0;
  const factors = ai.factors || {};
  const aiVsGoogle = ai.ai_vs_google || [];
  const geoRecs = data.geo_recommendations || [];
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Moderate" : "Needs work";

  return (
    <div className="space-y-4">
      {/* Score + factors */}
      <div className="bg-surface rounded-xl p-4 border border-border flex items-start gap-4 flex-wrap">
        <div className="text-center">
          <ScoreRing score={score} size={72} strokeWidth={5} />
          <div className={`text-xs font-medium mt-1 ${score >= 60 ? "text-success" : score >= 40 ? "text-warning" : "text-danger"}`}>{label}</div>
        </div>
        <div className="flex-1 min-w-[180px]">
          <FactorBar label="Content depth" tipKey="content_depth" score={factors.content_depth || 0} />
          <FactorBar label="Topical authority" tipKey="topical_authority" score={factors.topical_authority || 0} />
          <FactorBar label="E-E-A-T signals" tipKey="eeat" score={factors.eeat_signals || 0} />
          <FactorBar label="Structured data" tipKey="structured_data" score={factors.structured_data || 0} />
          <FactorBar label="Q&A format" tipKey="qa_format" score={factors.qa_format || 0} />
          <FactorBar label="Entity clarity" tipKey="entity_clarity" score={factors.entity_clarity || 0} />
        </div>
      </div>

      {/* AI vs Google table */}
      {aiVsGoogle.length > 0 && aiVsGoogle.some((item: any) => item.google_volume > 0 || item.ai_volume > 0) ? (
        <div>
          <div className="text-sm font-medium mb-2">
            <Tip k="ai_volume">AI vs traditional search volume</Tip>
          </div>
          <div className="bg-surface rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-3 py-2">Keyword</th>
                <th className="text-left font-medium px-3 py-2">Google vol</th>
                <th className="text-left font-medium px-3 py-2"><Tip k="ai_volume">AI vol</Tip></th>
                <th className="text-left font-medium px-3 py-2"><Tip k="ai_trend">AI trend</Tip></th>
                <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Opportunity</th>
              </tr></thead>
              <tbody>
                {aiVsGoogle.slice(0, 20).map((item: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium max-w-[180px] truncate">{item.keyword}</td>
                    <td className="px-3 py-2">{(item.google_volume || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{(item.ai_volume || 0).toLocaleString()}</td>
                    <td className="px-3 py-2"><TrendPill value={item.ai_trend_pct || 0} /></td>
                    <td className="px-3 py-2 hidden sm:table-cell text-xs">
                      <span className={item.opportunity?.includes("High") ? "text-success font-medium" : item.opportunity?.includes("Medium") ? "text-warning" : "text-text-secondary"}>
                        {item.opportunity || "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className="text-xs text-text-secondary">AI search volume data is not yet available for your keywords. This data is more common for high-volume, popular search terms. As your site grows and targets broader keywords, AI visibility data will become available.</div>
        </div>
      )}

      {/* GEO Recommendations */}
      {geoRecs.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">AI visibility recommendations</div>
          <div className="space-y-1.5">
            {geoRecs.map((rec: any, i: number) => (
              <ExpandableCard key={i} priority={rec.priority} title={rec.title} description={rec.description} steps={rec.steps} expectedImpact={rec.expected_impact} />
            ))}
          </div>
        </div>
      )}

      <ComingSoon title="LLM mention tracking" description="Track how often your brand appears in ChatGPT, Gemini, and other AI tools — coming soon" />
    </div>
  );
}
