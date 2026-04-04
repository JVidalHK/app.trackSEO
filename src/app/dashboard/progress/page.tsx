import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgressView } from "./progress-view";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all tracking snapshots
  const { data: tracking } = await supabase
    .from("domain_tracking")
    .select("*")
    .eq("user_id", user.id)
    .order("tracked_at", { ascending: true });

  // Fetch all completed reports with their data for action items + keywords
  const { data: reports } = await supabase
    .from("reports")
    .select("id, domain, created_at, status, scores, overview, report_data, market")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .neq("is_sample", true)
    .order("created_at", { ascending: true });

  // Fetch user profile for credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  // Group tracking data by domain
  const trackingByDomain: Record<string, NonNullable<typeof tracking>> = {};
  for (const row of tracking || []) {
    if (!trackingByDomain[row.domain]) trackingByDomain[row.domain] = [];
    trackingByDomain[row.domain].push(row);
  }

  // Group reports by domain
  const reportsByDomain: Record<string, NonNullable<typeof reports>> = {};
  for (const report of reports || []) {
    if (!reportsByDomain[report.domain]) reportsByDomain[report.domain] = [];
    reportsByDomain[report.domain].push(report);
  }

  const domains = [...new Set([...Object.keys(trackingByDomain), ...Object.keys(reportsByDomain)])];

  if (domains.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-medium mb-5">Progress tracker</h1>
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <div className="text-sm font-medium mb-1">No reports yet</div>
          <p className="text-xs text-text-secondary">
            Generate your first SEO report to start tracking progress over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-medium mb-5">Progress tracker</h1>
      <ProgressView
        trackingByDomain={trackingByDomain}
        reportsByDomain={reportsByDomain}
        domains={domains}
        credits={profile?.credits_remaining ?? 0}
      />
    </div>
  );
}
