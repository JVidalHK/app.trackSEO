import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge, ALL_BADGE_TYPES } from "@/components/ui/badge";
import { ReportCard } from "@/components/ui/report-card";
import { DomainInput } from "./domain-input";
import { seedSampleReport } from "@/lib/sample-report";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, credits_remaining")
    .eq("id", user.id)
    .single();

  let { data: reports } = await supabase
    .from("reports")
    .select("id, domain, created_at, scores, overview, status, is_sample")
    .eq("user_id", user.id)
    .neq("status", "dismissed")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fallback: seed sample report if user has no reports
  if (!reports || reports.length === 0) {
    const seeded = await seedSampleReport(user.id);
    if (seeded) {
      const { data: refreshed } = await supabase
        .from("reports")
        .select("id, domain, created_at, scores, overview, status, is_sample")
        .eq("user_id", user.id)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false })
        .limit(6);
      reports = refreshed;
    }
  }

  const { data: achievements } = await supabase
    .from("achievements")
    .select("type")
    .eq("user_id", user.id);

  const earnedTypes = new Set(achievements?.map((a) => a.type) || []);
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const completedReports = (reports || []).filter((r) => r.status === "completed");

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-medium">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {completedReports.length > 0
            ? `You have ${completedReports.length} report${completedReports.length > 1 ? "s" : ""}`
            : "Run your first SEO report to get started"}
        </p>
      </div>

      <div className="mt-5">
        <h2 className="text-sm font-medium mb-2">Start a new report</h2>
        <DomainInput
          credits={profile?.credits_remaining ?? 0}
          existingDomains={(reports || []).map((r) => ({ domain: r.domain, date: r.created_at }))}
        />
      </div>

      {/* Achievements */}
      <div className="mt-5">
        <h2 className="text-sm font-medium mb-2">Achievements</h2>
        <div className="flex gap-2 flex-wrap">
          {ALL_BADGE_TYPES.map((type) => (
            <Badge key={type} type={type} earned={earnedTypes.has(type)} />
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div className="mt-5">
        <h2 className="text-sm font-medium mb-3">Recent reports</h2>
        {completedReports.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <p className="text-sm text-text-secondary">
              No reports yet. Enter a domain above to generate your first SEO audit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedReports.map((report, i) => (
              <ReportCard
                key={report.id}
                id={report.id}
                domain={report.domain}
                date={new Date(report.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                score={report.scores?.overall ?? 0}
                traffic={report.overview?.organic_traffic ?? 0}
                keywords={report.overview?.total_keywords ?? 0}
                da={report.overview?.domain_authority ?? 0}
                isLatest={i === 0}
                isSample={report.is_sample}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
