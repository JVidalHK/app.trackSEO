import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const pkg = formData.get("package") as string;
  const credits = parseInt(formData.get("credits") as string);
  const amount = parseInt(formData.get("amount") as string);

  if (!pkg || !credits || !amount) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  // TODO: Create actual Stripe checkout session
  // For now, create a pending purchase record and redirect to a placeholder
  const serviceClient = createServiceClient();

  await serviceClient.from("credit_purchases").insert({
    user_id: user.id,
    package: pkg,
    credits_added: credits,
    amount_cents: amount,
    status: "pending",
  });

  // Placeholder: directly add credits (replace with Stripe in production)
  await serviceClient.rpc("add_credits", {
    p_user_id: user.id,
    p_amount: credits,
  });

  await serviceClient
    .from("credit_purchases")
    .update({ status: "completed" })
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.redirect(
    new URL("/dashboard/credits?success=true", request.url)
  );
}
