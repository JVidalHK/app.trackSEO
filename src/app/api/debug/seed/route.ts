import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sampleReportData, sampleScores, sampleOverview, sampleMarket, SAMPLE_REPORT_DOMAIN } from "@/lib/sample-report";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in", authError: authError?.message }, { status: 401 });
  }

  const svc = createServiceClient();

  // Check profile exists
  const { data: profile, error: profileError } = await svc
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user.id)
    .single();

  // Check existing reports
  const { count: reportCount, error: countError } = await svc
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Try inserting sample report
  const { data: inserted, error: insertError } = await svc.from("reports").insert({
    user_id: user.id,
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
  }).select("id");

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    profileExists: !!profile,
    profileError: profileError?.message,
    existingReports: reportCount,
    countError: countError?.message,
    inserted: inserted?.[0]?.id || null,
    insertError: insertError?.message || null,
    insertErrorDetails: insertError || null,
  });
}
