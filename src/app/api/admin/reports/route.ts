import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") === "asc";
  const offset = (page - 1) * limit;

  const db = createServiceClient();

  let query = db.from("reports").select("id, domain, user_id, status, created_at, scores, cogs_cents, cost_breakdown, report_data", { count: "exact" });
  if (search) query = query.ilike("domain", `%${search}%`);
  if (status) query = query.eq("status", status);
  query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1);

  const { data: reports, count } = await query;

  // Get user emails
  const userIds = [...new Set(reports?.map((r) => r.user_id) || [])];
  const { data: users } = await db.from("profiles").select("id, email, full_name").in("id", userIds);
  const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));

  return NextResponse.json({
    reports: reports?.map((r) => ({
      ...r,
      user_email: userMap[r.user_id]?.email,
      user_name: userMap[r.user_id]?.full_name,
    })),
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  });
}
