import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import Link from "next/link";

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS policy allows reading completed reports publicly
  const { data: report } = await supabase
    .from("reports")
    .select("id, domain, created_at, report_data, scores, overview, market, status")
    .eq("id", id)
    .eq("status", "completed")
    .single();

  if (!report) notFound();

  const data = report.report_data;
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "https://trackseo.pro";

  return (
    <div className="min-h-screen">
      {/* CTA banner */}
      <div className="bg-accent/10 border-b border-accent/20 px-4 py-2.5 text-center">
        <p className="text-sm">
          This report was generated with{" "}
          <span className="font-medium text-accent">TrackSEO</span>
          {" — "}
          <Link href={marketingUrl} className="text-accent underline">
            Get your own SEO report for $2.99
          </Link>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <ScoreRing score={report.scores?.overall ?? 0} size={72} strokeWidth={5} label="SEO score" />
          <div>
            <h1 className="text-xl font-medium">{report.domain}</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {new Date(report.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {report.market?.primary_country_name &&
                ` · ${report.market.primary_country_name}`}
            </p>
          </div>
        </div>

        {/* Scores */}
        {report.scores && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {Object.entries(report.scores).map(([key, value]) => (
              <div key={key} className="bg-surface rounded-lg p-3 text-center border border-border">
                <div className="text-lg font-medium">{value as number}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">
                  {key.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overview */}
        {report.overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <MetricBox label="Organic traffic" value={(report.overview.organic_traffic ?? 0).toLocaleString()} />
            <MetricBox label="Keywords" value={(report.overview.total_keywords ?? 0).toLocaleString()} />
            <MetricBox label="Domain authority" value={String(report.overview.domain_authority ?? 0)} />
            <MetricBox label="Mobile speed" value={String(report.overview.mobile_speed ?? 0)} />
          </div>
        )}

        {/* Action plan */}
        {data?.action_plan?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium mb-3">AI action plan</h2>
            <div className="space-y-2">
              {data.action_plan.map((action: { priority: string; title: string; description: string; expected_impact: string }, i: number) => (
                <div key={i} className="bg-surface rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        action.priority === "high"
                          ? "bg-accent-light text-accent-dark"
                          : action.priority === "medium"
                          ? "bg-warning-light text-warning-dark"
                          : "bg-surface text-text-secondary"
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{action.description}</p>
                  {action.expected_impact && (
                    <p className="text-xs text-accent mt-1 font-medium">{action.expected_impact}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center py-8 border-t border-border mt-8">
          <p className="text-sm text-text-secondary mb-2">
            Track your SEO improvements over time
          </p>
          <Link
            href={marketingUrl}
            className="inline-flex h-10 items-center px-6 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90"
          >
            Get started with TrackSEO
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border">
      <div className="text-lg font-medium">{value}</div>
      <div className="text-xs text-text-secondary">{label}</div>
    </div>
  );
}
