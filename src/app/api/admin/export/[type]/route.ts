import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  let csv = "";

  if (type === "users") {
    const { data } = await db.from("profiles").select("*").order("created_at", { ascending: false });
    csv = "Name,Email,Credits,Reports,Signup Date\n";
    for (const u of data || []) {
      csv += `"${u.full_name || ""}","${u.email}",${u.credits_remaining},${u.total_reports_run},"${u.created_at}"\n`;
    }
  } else if (type === "reports") {
    const { data } = await db.from("reports").select("domain, user_id, status, created_at, cogs_cents, scores").order("created_at", { ascending: false });
    const userIds = [...new Set(data?.map((r) => r.user_id) || [])];
    const { data: users } = await db.from("profiles").select("id, email").in("id", userIds);
    const emailMap = Object.fromEntries((users || []).map((u) => [u.id, u.email]));
    csv = "Domain,User Email,Status,Date,SEO Score,COGS\n";
    for (const r of data || []) {
      csv += `"${r.domain}","${emailMap[r.user_id] || ""}","${r.status}","${r.created_at}",${r.scores?.overall || 0},${((r.cogs_cents || 0) / 100).toFixed(2)}\n`;
    }
  } else if (type === "invoices") {
    const { data } = await db.from("credit_purchases").select("*").eq("status", "completed").order("created_at", { ascending: false });
    const userIds = [...new Set(data?.map((i) => i.user_id) || [])];
    const { data: users } = await db.from("profiles").select("id, email, full_name").in("id", userIds);
    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));
    csv = "Invoice Number,Date,Customer,Email,Package,Subtotal,Tax,Total,Status\n";
    for (const i of data || []) {
      const inv = i.invoice_data || {};
      csv += `"${inv.invoice_number || ""}","${i.created_at}","${userMap[i.user_id]?.full_name || ""}","${userMap[i.user_id]?.email || ""}","${i.package}",${((inv.subtotal || i.amount_cents || 0) / 100).toFixed(2)},${((inv.tax_amount || 0) / 100).toFixed(2)},${((i.amount_cents || 0) / 100).toFixed(2)},"${i.status}"\n`;
    }
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="trackseo_${type}_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
