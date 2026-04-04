import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain } = await request.json();
  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Check if user is banned
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("credits_remaining, is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Your account has been suspended. Contact support@postreach.ai for assistance." }, { status: 403 });
  }

  console.log("DEBUG generate:", { userId: user.id, profile, profileError });

  // Atomically deduct 1 credit
  const { data: success, error: rpcError } = await serviceClient.rpc("deduct_credit", {
    p_user_id: user.id,
  });

  console.log("DEBUG deduct_credit:", { success, rpcError, type: typeof success });

  if (success !== true) {
    return NextResponse.json({
      error: "Insufficient credits",
      debug: { success, rpcError: rpcError?.message, credits: profile?.credits_remaining, userId: user.id },
    }, { status: 402 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.trackseo.pro";
  const reportId = uuidv4();

  // Create report row in Supabase
  await serviceClient.from("reports").insert({
    id: reportId,
    user_id: user.id,
    domain,
    status: "queued",
    progress: 0,
    stage: "queued",
  });

  // Call VPS engine to start generation
  try {
    const engineRes = await fetch(
      `${process.env.VPS_ENGINE_URL}/api/reports/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.VPS_API_SECRET!,
        },
        body: JSON.stringify({
          domain,
          userId: user.id,
          reportId,
          webhookUrl: `${appUrl}/api/webhooks/report-complete`,
        }),
      }
    );

    const engineData = await engineRes.json();

    // Store the BullMQ job ID
    await serviceClient
      .from("reports")
      .update({
        job_id: engineData.jobId,
        status: "processing",
        stage: "detecting market",
      })
      .eq("id", reportId);
  } catch (err) {
    // Engine call failed — refund credit and mark report as failed
    await serviceClient.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
    await serviceClient
      .from("reports")
      .update({
        status: "failed",
        error_message: "Failed to connect to report engine",
      })
      .eq("id", reportId);

    return NextResponse.json({ error: "Engine unavailable" }, { status: 503 });
  }

  return NextResponse.json({ reportId, status: "queued" });
}
