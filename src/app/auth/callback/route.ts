import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sampleReportData, sampleScores, sampleOverview, sampleMarket, SAMPLE_REPORT_DOMAIN } from "@/lib/sample-report";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Seed sample report for brand-new users
    if (data?.user) {
      try {
        const svc = createServiceClient();

        // Wait for profile to be created by the database trigger
        // (Google OAuth can be faster than the trigger)
        let profileExists = false;
        for (let i = 0; i < 5; i++) {
          const { count } = await svc
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("id", data.user.id);

          if (count && count > 0) {
            profileExists = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 500));
        }

        if (profileExists) {
          // Check if user already has any reports (not a new user)
          const { count: reportCount } = await svc
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("user_id", data.user.id);

          if (reportCount === 0) {
            await svc.from("reports").insert({
              user_id: data.user.id,
              domain: SAMPLE_REPORT_DOMAIN,
              status: "completed",
              progress: 100,
              stage: "completed",
              report_data: sampleReportData,
              scores: sampleScores,
              overview: sampleOverview,
              market: sampleMarket,
              is_sample: true,
              completed_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Sample report seed error:", err);
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
