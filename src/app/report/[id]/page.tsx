import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReportViewer } from "@/components/report/report-viewer";

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

  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "https://trackseo.pro";

  const dateStr = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary">
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

      {/* Full report */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <ReportViewer
          data={report.report_data}
          domain={report.domain}
          date={dateStr}
          market={report.market}
          shared
        />
      </div>

      {/* Footer CTA */}
      <div className="text-center py-10 border-t border-border">
        <p className="text-base font-medium mb-1">Want to know your website&apos;s SEO score?</p>
        <p className="text-sm text-text-secondary mb-4">
          Full SEO audit with AI-powered recommendations. No subscription.
        </p>
        <Link
          href={marketingUrl}
          className="inline-flex h-10 items-center px-6 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          Get started with TrackSEO
        </Link>
      </div>
    </div>
  );
}
