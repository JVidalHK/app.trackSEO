import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin, isAdminEmail } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = 50;
  const search = searchParams.get("search") || "";
  const ALLOWED_SORTS = ["created_at", "email", "full_name", "credits_remaining", "total_reports_run"];
  const sort = ALLOWED_SORTS.includes(searchParams.get("sort") || "") ? searchParams.get("sort")! : "created_at";
  const order = searchParams.get("order") === "asc";
  const offset = (page - 1) * limit;

  const db = createServiceClient();

  let query = db.from("profiles").select("*", { count: "exact" });
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1);

  const { data: users, count } = await query;

  // Get revenue per user
  const userIds = users?.map((u) => u.id) || [];
  const { data: purchases } = await db.from("credit_purchases").select("user_id, amount_cents").eq("status", "completed").in("user_id", userIds);
  const revenueMap: Record<string, number> = {};
  for (const p of purchases || []) {
    revenueMap[p.user_id] = (revenueMap[p.user_id] || 0) + (p.amount_cents || 0);
  }

  // Get last report date per user
  const { data: lastReports } = await db.from("reports").select("user_id, created_at").eq("status", "completed").in("user_id", userIds).order("created_at", { ascending: false });
  const lastActiveMap: Record<string, string> = {};
  for (const r of lastReports || []) {
    if (!lastActiveMap[r.user_id]) lastActiveMap[r.user_id] = r.created_at;
  }

  return NextResponse.json({
    users: users?.map((u) => ({
      ...u,
      revenue: revenueMap[u.id] || 0,
      last_active: lastActiveMap[u.id] || null,
      is_admin: isAdminEmail(u.email),
    })),
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  });
}
