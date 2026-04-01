import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Always check Supabase first — this is the source of truth
  const serviceClient = createServiceClient();
  const { data: report } = await serviceClient
    .from("reports")
    .select("status, progress, stage, job_id, report_data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If Supabase says completed, trust it — the webhook has written the data
  if (report.status === "completed") {
    return NextResponse.json({
      status: "completed",
      progress: 100,
      stage: "completed",
    });
  }

  // If failed, return that
  if (report.status === "failed") {
    return NextResponse.json({
      status: "failed",
      progress: report.progress || 0,
      stage: "failed",
    });
  }

  // Still processing — check the engine for real-time progress updates
  if (report.job_id) {
    try {
      const engineRes = await fetch(
        `${process.env.VPS_ENGINE_URL}/api/reports/${report.job_id}/status`,
        {
          headers: { "x-api-key": process.env.VPS_API_SECRET! },
          signal: AbortSignal.timeout(5000),
        }
      );
      const engineData = await engineRes.json();

      // If engine says completed but Supabase doesn't yet, return "finishing"
      // The webhook is still writing — don't trigger a page reload yet
      if (engineData.status === "completed") {
        return NextResponse.json({
          status: "processing",
          progress: 95,
          stage: "saving report",
        });
      }

      return NextResponse.json({
        status: "processing",
        progress: engineData.progress ?? report.progress ?? 0,
        stage: engineData.stage ?? report.stage ?? "processing",
      });
    } catch {
      // Engine unreachable — fall back to Supabase data
    }
  }

  return NextResponse.json({
    status: report.status,
    progress: report.progress || 0,
    stage: report.stage || "processing",
  });
}
