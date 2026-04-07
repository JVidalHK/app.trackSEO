import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.VPS_API_SECRET) {
    console.error("Webhook auth failed:", { received: apiKey?.slice(0, 8), expected: process.env.VPS_API_SECRET?.slice(0, 8) });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reportId, domain, status, scores, cogs_cents } = body;

  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify report exists and get the actual owner from DB (never trust userId from webhook body)
  const { data: report } = await supabase
    .from("reports")
    .select("user_id")
    .eq("id", reportId)
    .single();

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const userId = report.user_id;

  if (status === "completed") {
    // Fetch the full report from the engine
    let reportData = null;
    try {
      const res = await fetch(
        `${process.env.VPS_ENGINE_URL}/api/reports/${reportId}`,
        {
          headers: { "x-api-key": process.env.VPS_API_SECRET! },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (res.ok) {
        reportData = await res.json();
      } else {
        console.error("Report fetch failed:", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("Report fetch error:", err);
    }

    // Update the report in Supabase
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: "completed",
        progress: 100,
        stage: "completed",
        report_data: reportData,
        scores: reportData?.scores || scores,
        overview: reportData?.overview || null,
        market: reportData?.market || null,
        cogs_cents: cogs_cents || 0,
        cost_breakdown: reportData?.cost_breakdown || {},
        completed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) {
      console.error("Supabase update failed:", updateError);
      return NextResponse.json({ error: "DB update failed", detail: updateError.message }, { status: 500 });
    }


    // Increment reports count + check achievements
    if (userId) {
      await supabase.rpc("increment_reports_count", { p_user_id: userId });

      // Get updated profile to check achievements
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_reports_run")
        .eq("id", userId)
        .single();

      const totalReports = profile?.total_reports_run || 1;

      // Grant first_report badge
      if (totalReports === 1) {
        await supabase.from("achievements").upsert(
          { user_id: userId, type: "first_report" },
          { onConflict: "user_id,type" }
        );
      }

      // Grant ten_reports badge
      if (totalReports >= 10) {
        await supabase.from("achievements").upsert(
          { user_id: userId, type: "ten_reports" },
          { onConflict: "user_id,type" }
        );
      }

      // Grant score_above_85 badge
      const overallScore = reportData?.scores?.overall ?? 0;
      if (overallScore >= 85) {
        await supabase.from("achievements").upsert(
          { user_id: userId, type: "score_above_85" },
          { onConflict: "user_id,type" }
        );
      }

      // Grant ai_ready_80 badge
      const aiScore = reportData?.scores?.ai_readiness ?? 0;
      if (aiScore >= 80) {
        await supabase.from("achievements").upsert(
          { user_id: userId, type: "ai_ready_80" },
          { onConflict: "user_id,type" }
        );
      }
    }

    // Insert domain tracking row
    if (reportData && userId) {
      const checklist = reportData.audit_checklist || [];
      const failCount = checklist.filter(
        (c: { status: string }) => c.status === "fail"
      ).length;

      await supabase.from("domain_tracking").insert({
        user_id: userId,
        domain,
        report_id: reportId,
        seo_score: reportData.scores?.overall ?? 0,
        organic_traffic: reportData.overview?.organic_traffic ?? 0,
        total_keywords: reportData.overview?.total_keywords ?? 0,
        domain_authority: reportData.overview?.domain_authority ?? 0,
        ai_readiness_score: reportData.scores?.ai_readiness ?? 0,
        issues_count: failCount,
      });
    }
  } else if (status === "failed") {
    await supabase
      .from("reports")
      .update({
        status: "failed",
        error_message: body.error || "Report generation failed",
      })
      .eq("id", reportId);

    if (userId) {
      await supabase.rpc("add_credits", { p_user_id: userId, p_amount: 1 });
    }
  }

  return NextResponse.json({ ok: true });
}
