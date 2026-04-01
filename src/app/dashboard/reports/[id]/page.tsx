import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportProgress } from "./report-progress";
import { ReportViewer } from "@/components/report/report-viewer";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!report) redirect("/dashboard/reports");

  // If report is still processing, show progress view
  if (report.status === "queued" || report.status === "processing") {
    return <ReportProgress reportId={report.id} initialProgress={report.progress} initialStage={report.stage} />;
  }

  // If failed, show error
  if (report.status === "failed") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-danger text-lg font-medium mb-2">Report generation failed</div>
        <p className="text-sm text-text-secondary mb-4">
          {report.error_message || "An unexpected error occurred."}
        </p>
        <a href="/dashboard" className="text-sm text-accent hover:underline">
          Try again
        </a>
      </div>
    );
  }

  // Completed — render the full report viewer
  const dateStr = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ReportViewer
      data={report.report_data}
      domain={report.domain}
      date={dateStr}
      market={report.market}
    />
  );
}
