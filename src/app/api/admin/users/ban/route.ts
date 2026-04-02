import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, banned } = await request.json();
  if (!userId || typeof banned !== "boolean") {
    return NextResponse.json({ error: "userId and banned (boolean) required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db
    .from("profiles")
    .update({ is_banned: banned })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, banned });
}
