import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

// Manual Stripe signature verification (no SDK needed)
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const parts = signature.split(",").reduce((acc, part) => {
    const [key, val] = part.split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;

  // Reject if older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Fetch receipt URL from Stripe API directly
async function getReceiptUrl(paymentIntentId: string, stripeKey: string): Promise<{ receiptUrl: string | null; invoicePdfUrl: string | null }> {
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}?expand[]=latest_charge`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    const pi = await res.json();
    const charge = pi.latest_charge;
    return {
      receiptUrl: charge?.receipt_url || null,
      invoicePdfUrl: charge?.receipt_url ? `${charge.receipt_url}#pdf` : null,
    };
  } catch {
    return { receiptUrl: null, invoicePdfUrl: null };
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!signature || !webhookSecret) {
    console.error("Stripe webhook: missing signature or secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifySignature(body, signature, webhookSecret)) {
    console.error("Stripe webhook: signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Stripe webhook received:", event.type, event.id);

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits || "0");
      const pkg = session.metadata?.package || "unknown";
      const purchaseId = session.metadata?.purchase_id;

      if (!userId || credits <= 0) {
        console.error("Stripe webhook: missing metadata", { userId, credits });
        break;
      }

      // Idempotency check
      const { data: existing } = await supabase
        .from("credit_purchases")
        .select("id, status")
        .eq("stripe_event_id", event.id)
        .single();

      if (existing?.status === "completed") {
        console.log("Stripe webhook: already processed", event.id);
        break;
      }

      // Get receipt URL
      let receiptUrl: string | null = null;
      let invoicePdfUrl: string | null = null;
      if (session.payment_intent && stripeKey) {
        const urls = await getReceiptUrl(session.payment_intent, stripeKey);
        receiptUrl = urls.receiptUrl;
        invoicePdfUrl = urls.invoicePdfUrl;
      }

      const customerId = session.customer || null;

      // Add credits
      const { error: rpcError } = await supabase.rpc("add_credits", { p_user_id: userId, p_amount: credits });
      if (rpcError) {
        console.error("Failed to add credits:", rpcError);
      }

      // Update or create purchase record
      const purchaseData = {
        user_id: userId,
        package: pkg,
        credits_added: credits,
        amount_cents: session.amount_total || 0,
        currency: session.currency || "usd",
        status: "completed",
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent || null,
        stripe_customer_id: customerId,
        stripe_event_id: event.id,
        receipt_url: receiptUrl,
        invoice_pdf_url: invoicePdfUrl,
      };

      if (purchaseId) {
        const { error } = await supabase.from("credit_purchases").update(purchaseData).eq("id", purchaseId);
        if (error) console.error("Failed to update purchase:", error);
      } else {
        const { error } = await supabase.from("credit_purchases").insert(purchaseData);
        if (error) console.error("Failed to insert purchase:", error);
      }

      console.log("Stripe: credits added", { userId, credits, receiptUrl: !!receiptUrl });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const purchaseId = session.metadata?.purchase_id;
      if (purchaseId) {
        await supabase.from("credit_purchases").update({ status: "expired" }).eq("id", purchaseId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntent = charge.payment_intent;

      if (paymentIntent) {
        const { data: purchase } = await supabase
          .from("credit_purchases")
          .select("id, user_id, credits_added, status")
          .eq("stripe_payment_intent", paymentIntent)
          .single();

        if (purchase && purchase.status !== "refunded") {
          await supabase.from("credit_purchases").update({ status: "refunded" }).eq("id", purchase.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining")
            .eq("id", purchase.user_id)
            .single();

          const newCredits = Math.max(0, (profile?.credits_remaining || 0) - purchase.credits_added);
          await supabase.from("profiles").update({ credits_remaining: newCredits }).eq("id", purchase.user_id);

          console.log("Stripe: refund processed", { userId: purchase.user_id, credits: purchase.credits_added });
        }
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object;
      console.error("STRIPE DISPUTE ALERT:", {
        amount: dispute.amount,
        reason: dispute.reason,
        chargeId: dispute.charge,
      });
      break;
    }

    default:
      console.log("Stripe webhook: unhandled event", event.type);
  }

  return NextResponse.json({ received: true });
}
