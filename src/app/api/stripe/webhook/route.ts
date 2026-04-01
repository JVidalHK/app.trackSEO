import { NextResponse } from "next/server";

// TODO: Implement actual Stripe webhook handler
// This will handle checkout.session.completed events
// and call add_credits RPC to add credits to the user's balance

export async function POST() {
  // Placeholder — will be implemented when Stripe is configured
  return NextResponse.json({ received: true });
}
