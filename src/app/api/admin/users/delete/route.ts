import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Don't let admin delete themselves
  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const db = createServiceClient();

  // Delete in order: domain_tracking → achievements → reports → credit_purchases → profiles → auth user
  await db.from("domain_tracking").delete().eq("user_id", userId);
  await db.from("achievements").delete().eq("user_id", userId);
  await db.from("reports").delete().eq("user_id", userId);
  await db.from("credit_purchases").delete().eq("user_id", userId);
  await db.from("profiles").delete().eq("id", userId);

  // Delete the auth user
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Failed to delete auth user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
