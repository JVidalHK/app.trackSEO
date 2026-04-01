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

// Fetch full payment details from Stripe for invoice generation
async function getPaymentDetails(paymentIntentId: string, stripeKey: string) {
  const result = {
    receiptUrl: null as string | null,
    invoiceData: {} as Record<string, unknown>,
  };

  try {
    // Get payment intent with charge expanded
    const piRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}?expand[]=latest_charge`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    const pi = await piRes.json();
    const charge = pi.latest_charge;

    result.receiptUrl = charge?.receipt_url || null;

    // Build invoice data from charge details
    result.invoiceData = {
      // Billing info
      billing_name: charge?.billing_details?.name || null,
      billing_email: charge?.billing_details?.email || pi.receipt_email || null,
      billing_address: charge?.billing_details?.address || null,
      // Card info (last 4 + brand only, never full number)
      card_brand: charge?.payment_method_details?.card?.brand || null,
      card_last4: charge?.payment_method_details?.card?.last4 || null,
      card_exp_month: charge?.payment_method_details?.card?.exp_month || null,
      card_exp_year: charge?.payment_method_details?.card?.exp_year || null,
      // Payment details
      amount: charge?.amount || pi.amount || 0,
      amount_refunded: charge?.amount_refunded || 0,
      currency: charge?.currency || pi.currency || "usd",
      payment_intent_id: paymentIntentId,
      charge_id: charge?.id || null,
      paid_at: charge?.created ? new Date(charge.created * 1000).toISOString() : null,
      // Tax (from checkout session total_details if available)
      tax_amount: 0,
      subtotal: 0,
    };
  } catch (err) {
    console.error("Failed to fetch payment details:", err);
  }

  return result;
}

// Fetch checkout session for tax details
async function getSessionTaxDetails(sessionId: string, stripeKey: string) {
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=total_details.breakdown`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    const session = await res.json();
    return {
      subtotal: session.amount_subtotal || 0,
      tax_amount: session.total_details?.amount_tax || 0,
      total: session.amount_total || 0,
      tax_breakdown: session.total_details?.breakdown?.taxes || [],
    };
  } catch {
    return { subtotal: 0, tax_amount: 0, total: 0, tax_breakdown: [] };
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

      // Get full payment details for invoice generation
      let receiptUrl: string | null = null;
      let invoiceData: Record<string, unknown> = {};
      if (session.payment_intent && stripeKey) {
        const details = await getPaymentDetails(session.payment_intent, stripeKey);
        receiptUrl = details.receiptUrl;
        invoiceData = details.invoiceData;

        // Get tax details from session
        const taxDetails = await getSessionTaxDetails(session.id, stripeKey);
        invoiceData.subtotal = taxDetails.subtotal;
        invoiceData.tax_amount = taxDetails.tax_amount;
        invoiceData.total = taxDetails.total;
        invoiceData.tax_breakdown = taxDetails.tax_breakdown;
      }

      // Add product info to invoice data
      invoiceData.product_name = formatPackageName(pkg);
      invoiceData.credits = credits;
      invoiceData.invoice_number = `INV-${Date.now().toString(36).toUpperCase()}`;

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
        invoice_data: invoiceData,
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

function formatPackageName(pkg: string): string {
  const map: Record<string, string> = {
    single_1: "Single Report",
    pack_5: "5 Report Pack",
    pack_10: "10 Report Pack",
    pack_20: "20 Report Pack",
  };
  return map[pkg] || pkg;
}
