import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgressCharts } from "./progress-charts";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tracking } = await supabase
    .from("domain_tracking")
    .select("*")
    .eq("user_id", user.id)
    .order("tracked_at", { ascending: true });

  // Group by domain
  const byDomain: Record<string, NonNullable<typeof tracking>> = {};
  for (const row of tracking || []) {
    if (!byDomain[row.domain]) byDomain[row.domain] = [];
    byDomain[row.domain].push(row);
  }

  const domains = Object.keys(byDomain);

  if (domains.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-medium mb-5">Progress tracker</h1>
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-sm text-text-secondary">
            Run at least two reports for the same domain to see your progress over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-medium mb-5">Progress tracker</h1>
      <ProgressCharts byDomain={byDomain} domains={domains} />
    </div>
  );
}
