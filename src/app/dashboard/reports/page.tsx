import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("id, domain, created_at, status, scores, overview")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-lg font-medium mb-5">My reports</h1>

      {!reports || reports.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-sm text-text-secondary">No reports yet.</p>
          <Link href="/dashboard" className="text-sm text-accent mt-2 inline-block">
            Generate your first report
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="text-left font-medium px-4 py-3">Domain</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Score</th>
                <th className="text-left font-medium px-4 py-3">Traffic</th>
                <th className="text-left font-medium px-4 py-3">Keywords</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {report.domain}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(report.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={report.status} />
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "completed" ? (
                      <ScorePill score={report.scores?.overall ?? 0} />
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "completed"
                      ? (report.overview?.organic_traffic ?? 0).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "completed"
                      ? (report.overview?.total_keywords ?? 0).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-accent/10 text-accent",
    processing: "bg-info/10 text-info",
    queued: "bg-warning/10 text-warning",
    failed: "bg-danger/10 text-danger",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

function ScorePill({ score }: { score: number }) {
  const cls =
    score >= 80
      ? "bg-accent-light text-accent-dark"
      : score >= 50
      ? "bg-warning-light text-warning-dark"
      : "bg-danger-light text-danger-dark";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {score}
    </span>
  );
}
