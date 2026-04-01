import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const userId = user.id;

  try {
    // Delete all user data (order matters due to foreign keys)
    await serviceClient.from("domain_tracking").delete().eq("user_id", userId);
    await serviceClient.from("achievements").delete().eq("user_id", userId);
    await serviceClient.from("reports").delete().eq("user_id", userId);
    await serviceClient.from("credit_purchases").delete().eq("user_id", userId);
    await serviceClient.from("profiles").delete().eq("id", userId);

    // Delete the auth user
    const { error: authError } = await serviceClient.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Failed to delete auth user:", authError);
      return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
