import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, { priceId: string; credits: number; package: string }> = {
  single_1: { priceId: process.env.STRIPE_PRICE_SINGLE!, credits: 1, package: "single_1" },
  pack_5: { priceId: process.env.STRIPE_PRICE_PACK_5!, credits: 5, package: "pack_5" },
  pack_10: { priceId: process.env.STRIPE_PRICE_PACK_10!, credits: 10, package: "pack_10" },
  pack_20: { priceId: process.env.STRIPE_PRICE_PACK_20!, credits: 20, package: "pack_20" },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const pkg = formData.get("package") as string;

  const config = PRICE_MAP[pkg];
  if (!config) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  // Create a pending purchase record
  const serviceClient = createServiceClient();
  const { data: purchase } = await serviceClient.from("credit_purchases").insert({
    user_id: user.id,
    package: config.package,
    credits_added: config.credits,
    amount_cents: 0, // Will be updated by webhook with actual amount (may include tax)
    status: "pending",
  }).select("id").single();

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: config.priceId, quantity: 1 }],
    customer_creation: "always",
    customer_email: user.email || undefined,
    metadata: {
      user_id: user.id,
      credits: String(config.credits),
      package: config.package,
      purchase_id: purchase?.id || "",
    },
    payment_method_types: ["card"],
    payment_method_options: {
      card: { request_three_d_secure: "any" },
    },
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
  });

  return NextResponse.redirect(session.url!, 303);
}
