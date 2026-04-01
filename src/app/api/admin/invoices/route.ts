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
  const pkg = searchParams.get("package") || "";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") === "asc";
  const offset = (page - 1) * limit;

  const db = createServiceClient();

  let query = db.from("credit_purchases").select("*", { count: "exact" }).eq("status", "completed");
  if (pkg) query = query.eq("package", pkg);
  query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1);

  const { data: invoices, count } = await query;

  // Get user info
  const userIds = [...new Set(invoices?.map((i) => i.user_id) || [])];
  const { data: users } = await db.from("profiles").select("id, email, full_name").in("id", userIds);
  const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));

  // Apply search filter (client-side since we need user data)
  let filtered = invoices?.map((inv) => ({
    ...inv,
    user_email: userMap[inv.user_id]?.email,
    user_name: userMap[inv.user_id]?.full_name,
  })) || [];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((i) =>
      i.user_email?.toLowerCase().includes(s) ||
      i.user_name?.toLowerCase().includes(s) ||
      i.invoice_data?.invoice_number?.toLowerCase().includes(s) ||
      i.invoice_data?.billing_name?.toLowerCase().includes(s)
    );
  }

  return NextResponse.json({
    invoices: filtered,
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  });
}
