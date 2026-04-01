import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const PACKAGES: Record<string, { credits: number; package: string; envKey: string }> = {
  single_1: { credits: 1, package: "single_1", envKey: "STRIPE_PRICE_SINGLE" },
  pack_5: { credits: 5, package: "pack_5", envKey: "STRIPE_PRICE_PACK_5" },
  pack_10: { credits: 10, package: "pack_10", envKey: "STRIPE_PRICE_PACK_10" },
  pack_20: { credits: 20, package: "pack_20", envKey: "STRIPE_PRICE_PACK_20" },
};

// Redirect GET requests back to credits page
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/dashboard/credits", request.url));
}

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.redirect(new URL("/dashboard/credits?error=config", request.url));
    }

    const stripe = new Stripe(stripeKey);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const formData = await request.formData();
    const pkg = formData.get("package") as string;

    const config = PACKAGES[pkg];
    if (!config) {
      console.error("Invalid package:", pkg);
      return NextResponse.redirect(new URL("/dashboard/credits?error=invalid_package", request.url));
    }

    // Read price ID at runtime (not module load)
    const priceId = process.env[config.envKey];
    if (!priceId) {
      console.error("Missing price env var:", config.envKey, "Available env keys:", Object.keys(process.env).filter(k => k.includes("STRIPE")).join(", "));
      return NextResponse.redirect(new URL("/dashboard/credits?error=missing_price", request.url));
    }

    // Create a pending purchase record
    const serviceClient = createServiceClient();
    const { data: purchase, error: insertError } = await serviceClient.from("credit_purchases").insert({
      user_id: user.id,
      package: config.package,
      credits_added: config.credits,
      amount_cents: 0,
      status: "pending",
    }).select("id").single();

    if (insertError) {
      console.error("Failed to create purchase record:", insertError);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.trackseo.pro";

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_creation: "always",
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        credits: String(config.credits),
        package: config.package,
        purchase_id: purchase?.id || "",
      },
      payment_method_types: ["card"],
      success_url: `${appUrl}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/credits?canceled=true`,
    };

    // Only enable automatic tax if Stripe Tax is active (skip if not configured)
    try {
      sessionParams.automatic_tax = { enabled: true };
      sessionParams.tax_id_collection = { enabled: true };
    } catch {
      // Tax not configured — proceed without
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      console.error("Stripe returned no session URL");
      return NextResponse.redirect(new URL("/dashboard/credits?error=no_url", request.url));
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe checkout error:", message);
    // Return specific error for debugging
    const errorParam = encodeURIComponent(message.slice(0, 100));
    return NextResponse.redirect(new URL(`/dashboard/credits?error=${errorParam}`, request.url));
  }
}
