import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only delete if report belongs to user and is not a sample
  const { data: report } = await supabase
    .from("reports")
    .select("id, is_sample")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.is_sample) {
    // Soft-delete: hide from user's view without removing from DB
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", id).eq("user_id", user.id);
  } else {
    // Delete associated domain_tracking entries first
    await supabase.from("domain_tracking").delete().eq("report_id", id);
    // Then delete the report
    await supabase.from("reports").delete().eq("id", id).eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
