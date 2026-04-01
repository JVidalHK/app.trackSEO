import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, credits } = await request.json();
  if (!userId || credits === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from("profiles").update({ credits_remaining: credits }).eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, credits });
}
