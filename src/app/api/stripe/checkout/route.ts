import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PACKAGES: Record<string, { credits: number; package: string; envKey: string }> = {
  single_1: { credits: 1, package: "single_1", envKey: "STRIPE_PRICE_SINGLE" },
  pack_5: { credits: 5, package: "pack_5", envKey: "STRIPE_PRICE_PACK_5" },
  pack_10: { credits: 10, package: "pack_10", envKey: "STRIPE_PRICE_PACK_10" },
  pack_20: { credits: 20, package: "pack_20", envKey: "STRIPE_PRICE_PACK_20" },
};

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/dashboard/credits", request.url));
}

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.redirect(new URL("/dashboard/credits?error=stripe_not_configured", request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const formData = await request.formData();
    const pkg = formData.get("package") as string;
    const config = PACKAGES[pkg];
    if (!config) {
      return NextResponse.redirect(new URL("/dashboard/credits?error=invalid_package", request.url));
    }

    const priceId = process.env[config.envKey];
    if (!priceId) {
      return NextResponse.redirect(new URL(`/dashboard/credits?error=missing_${config.envKey}`, request.url));
    }

    // Create pending purchase
    const serviceClient = createServiceClient();
    const { data: purchase } = await serviceClient.from("credit_purchases").insert({
      user_id: user.id,
      package: config.package,
      credits_added: config.credits,
      amount_cents: 0,
      status: "pending",
    }).select("id").single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.trackseo.pro";

    // Use fetch directly to Stripe API instead of SDK
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("customer_creation", "always");
    if (user.email) params.append("customer_email", user.email);
    params.append("metadata[user_id]", user.id);
    params.append("metadata[credits]", String(config.credits));
    params.append("metadata[package]", config.package);
    params.append("metadata[purchase_id]", purchase?.id || "");
    params.append("allow_promotion_codes", "true");
    params.append("payment_method_types[0]", "card");
    params.append("success_url", `${appUrl}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${appUrl}/dashboard/credits?canceled=true`);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    console.log("Stripe checkout params:", Object.fromEntries(params.entries()));
    console.log("Stripe checkout response:", { ok: stripeRes.ok, status: stripeRes.status, allow_promotion_codes: session.allow_promotion_codes });

    if (!stripeRes.ok) {
      console.error("Stripe API error:", session);
      const msg = session.error?.message || "Stripe error";
      return NextResponse.redirect(new URL(`/dashboard/credits?error=${encodeURIComponent(msg)}`, request.url));
    }

    if (!session.url) {
      return NextResponse.redirect(new URL("/dashboard/credits?error=no_checkout_url", request.url));
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Checkout error:", message);
    return NextResponse.redirect(new URL(`/dashboard/credits?error=${encodeURIComponent(message.slice(0, 100))}`, request.url));
  }
}
