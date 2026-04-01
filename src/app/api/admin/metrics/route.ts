import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "lifetime";
  const db = createServiceClient();

  const dateFilter = getDateFilter(range);

  // Total revenue
  const { data: purchases } = await db.from("credit_purchases").select("amount_cents, created_at, package, credits_added, user_id").eq("status", "completed");
  const filtered = dateFilter ? purchases?.filter((p) => new Date(p.created_at) >= dateFilter) : purchases;
  const totalRevenue = filtered?.reduce((s, p) => s + (p.amount_cents || 0), 0) || 0;
  const txCount = filtered?.length || 0;

  // Previous period for comparison
  const prevFilter = getPrevDateFilter(range);
  const prevPurchases = prevFilter ? purchases?.filter((p) => { const d = new Date(p.created_at); return d >= prevFilter.start && d < prevFilter.end; }) : [];
  const prevRevenue = prevPurchases?.reduce((s, p) => s + (p.amount_cents || 0), 0) || 0;

  // Users
  const { count: totalUsers } = await db.from("profiles").select("*", { count: "exact", head: true });
  const newUsers = dateFilter ? (await db.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", dateFilter.toISOString())).count : totalUsers;

  // Reports + COGS
  const { data: reports } = await db.from("reports").select("cogs_cents, status, created_at, domain, scores").eq("status", "completed");
  const filteredReports = dateFilter ? reports?.filter((r) => new Date(r.created_at) >= dateFilter) : reports;
  const totalReports = filteredReports?.length || 0;
  const totalCogs = filteredReports?.reduce((s, r) => s + (r.cogs_cents || 0), 0) || 0;

  // Stripe fees estimate: 2.9% + $0.30 per tx
  const stripeFees = Math.round(totalRevenue * 0.029 + txCount * 30);

  // Net profit
  const netProfit = totalRevenue - totalCogs - stripeFees;
  const avgCogs = totalReports > 0 ? Math.round(totalCogs / totalReports) : 0;
  const grossMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCogs) / totalRevenue) * 100) : 0;
  const revenueChange = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  // Recent activity (last 20)
  const { data: recentPurchases } = await db.from("credit_purchases").select("created_at, amount_cents, package, user_id, status").eq("status", "completed").order("created_at", { ascending: false }).limit(10);
  const { data: recentReports } = await db.from("reports").select("created_at, domain, cogs_cents, user_id, status").eq("status", "completed").order("created_at", { ascending: false }).limit(10);
  const { data: recentUsers } = await db.from("profiles").select("created_at, email, full_name").order("created_at", { ascending: false }).limit(10);

  // Merge and sort activities
  const activities = [
    ...(recentPurchases?.map((p) => ({ type: "purchase" as const, time: p.created_at, data: p })) || []),
    ...(recentReports?.map((r) => ({ type: "report" as const, time: r.created_at, data: r })) || []),
    ...(recentUsers?.map((u) => ({ type: "signup" as const, time: u.created_at, data: u })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);

  // Get emails for activities
  const userIds = [...new Set([
    ...(recentPurchases?.map((p) => p.user_id) || []),
    ...(recentReports?.map((r) => r.user_id) || []),
  ])];
  const { data: userEmails } = await db.from("profiles").select("id, email, full_name").in("id", userIds);
  const emailMap = Object.fromEntries((userEmails || []).map((u) => [u.id, { email: u.email, name: u.full_name }]));

  // Daily revenue for chart
  const dailyData: Record<string, { revenue: number; cogs: number }> = {};
  for (const p of filtered || []) {
    const day = p.created_at.slice(0, 10);
    if (!dailyData[day]) dailyData[day] = { revenue: 0, cogs: 0 };
    dailyData[day].revenue += p.amount_cents || 0;
  }
  for (const r of filteredReports || []) {
    const day = r.created_at.slice(0, 10);
    if (!dailyData[day]) dailyData[day] = { revenue: 0, cogs: 0 };
    dailyData[day].cogs += r.cogs_cents || 0;
  }
  const chartData = Object.entries(dailyData).sort().map(([date, d]) => ({ date, revenue: d.revenue / 100, cogs: d.cogs / 100 }));

  return NextResponse.json({
    totalRevenue, totalUsers, newUsers, totalReports, totalCogs, stripeFees, netProfit, avgCogs, grossMargin, revenueChange,
    chartData,
    activities: activities.map((a) => ({
      type: a.type,
      time: a.time,
      email: a.type === "signup" ? (a.data as any).email : emailMap[(a.data as any).user_id]?.email,
      name: a.type === "signup" ? (a.data as any).full_name : emailMap[(a.data as any).user_id]?.name,
      details: a.type === "purchase" ? { package: (a.data as any).package, amount: (a.data as any).amount_cents }
        : a.type === "report" ? { domain: (a.data as any).domain, cogs: (a.data as any).cogs_cents }
        : {},
    })),
  });
}

function getDateFilter(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "7d": return new Date(now.getTime() - 7 * 86400000);
    case "month": return new Date(now.getFullYear(), now.getMonth(), 1);
    case "last_month": return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    case "3mo": return new Date(now.getTime() - 90 * 86400000);
    case "1yr": return new Date(now.getTime() - 365 * 86400000);
    default: return null;
  }
}

function getPrevDateFilter(range: string): { start: Date; end: Date } | null {
  const now = new Date();
  switch (range) {
    case "7d": return { start: new Date(now.getTime() - 14 * 86400000), end: new Date(now.getTime() - 7 * 86400000) };
    case "month": { const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); return { start: s, end: new Date(now.getFullYear(), now.getMonth(), 1) }; }
    default: return null;
  }
}
