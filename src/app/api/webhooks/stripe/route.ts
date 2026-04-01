import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits || "0");
      const pkg = session.metadata?.package || "unknown";
      const purchaseId = session.metadata?.purchase_id;

      if (!userId || credits <= 0) {
        console.error("Stripe webhook: missing metadata", { userId, credits });
        break;
      }

      // Idempotency check — don't process the same event twice
      const { data: existing } = await supabase
        .from("credit_purchases")
        .select("id, status")
        .eq("stripe_event_id", event.id)
        .single();

      if (existing?.status === "completed") {
        console.log("Stripe webhook: already processed", event.id);
        break;
      }

      // Get receipt URL from the payment intent
      let receiptUrl: string | null = null;
      let customerId: string | null = null;
      if (session.payment_intent) {
        try {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
            expand: ["latest_charge"],
          });
          const charge = pi.latest_charge as Stripe.Charge | null;
          receiptUrl = charge?.receipt_url || null;
          customerId = (session.customer as string) || null;
        } catch {
          // Non-critical
        }
      }

      // Add credits
      await supabase.rpc("add_credits", { p_user_id: userId, p_amount: credits });

      // Update or create purchase record
      const purchaseData = {
        user_id: userId,
        package: pkg,
        credits_added: credits,
        amount_cents: session.amount_total || 0,
        currency: session.currency || "usd",
        status: "completed",
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string || null,
        stripe_customer_id: customerId,
        stripe_event_id: event.id,
        receipt_url: receiptUrl,
      };

      if (purchaseId) {
        await supabase.from("credit_purchases").update(purchaseData).eq("id", purchaseId);
      } else {
        await supabase.from("credit_purchases").insert(purchaseData);
      }

      console.log("Stripe: credits added", { userId, credits, eventId: event.id });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const purchaseId = session.metadata?.purchase_id;
      if (purchaseId) {
        await supabase.from("credit_purchases").update({ status: "expired" }).eq("id", purchaseId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = charge.payment_intent as string;

      if (paymentIntent) {
        // Find the purchase and reverse credits
        const { data: purchase } = await supabase
          .from("credit_purchases")
          .select("id, user_id, credits_added, status")
          .eq("stripe_payment_intent", paymentIntent)
          .single();

        if (purchase && purchase.status !== "refunded") {
          await supabase.from("credit_purchases").update({ status: "refunded" }).eq("id", purchase.id);

          // Deduct the credits (best effort — balance may go negative, which is fine)
          const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining")
            .eq("id", purchase.user_id)
            .single();

          const currentCredits = profile?.credits_remaining || 0;
          const newCredits = Math.max(0, currentCredits - purchase.credits_added);
          await supabase
            .from("profiles")
            .update({ credits_remaining: newCredits })
            .eq("id", purchase.user_id);

          console.log("Stripe: refund processed", { userId: purchase.user_id, credits: purchase.credits_added });
        }
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      console.error("STRIPE DISPUTE ALERT:", {
        amount: dispute.amount,
        reason: dispute.reason,
        chargeId: dispute.charge,
        created: new Date(dispute.created * 1000).toISOString(),
      });
      break;
    }

    default:
      console.log("Stripe webhook: unhandled event", event.type);
  }

  return NextResponse.json({ received: true });
}
