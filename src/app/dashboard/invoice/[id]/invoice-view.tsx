"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface InvoiceViewProps {
  purchase: any;
}

export function InvoiceView({ purchase }: InvoiceViewProps) {
  const inv = purchase.invoice_data || {};
  const paidAt = inv.paid_at ? new Date(inv.paid_at) : new Date(purchase.created_at);
  const currency = (inv.currency || purchase.currency || "usd").toUpperCase();
  const total = purchase.amount_cents || inv.total || inv.amount || 0;
  const subtotal = inv.subtotal || total;
  const taxAmount = inv.tax_amount || 0;
  const invoiceNumber = inv.invoice_number || `INV-${purchase.id?.slice(0, 8)?.toUpperCase()}`;

  const billing = {
    name: inv.billing_name || "",
    email: inv.billing_email || "",
    address: inv.billing_address || {},
  };

  const card = {
    brand: inv.card_brand ? inv.card_brand.charAt(0).toUpperCase() + inv.card_brand.slice(1) : null,
    last4: inv.card_last4 || null,
  };

  return (
    <div>
      {/* Action bar — hidden in print */}
      <div className="screen-only flex items-center gap-2 mb-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-gradient text-white hover:opacity-90 active:scale-[0.97] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Download PDF
        </button>
        <button
          onClick={() => window.history.back()}
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors"
        >
          Back to purchases
        </button>
      </div>

      {/* Invoice — light theme for printing */}
      <div className="bg-white text-[#1a1a1a] rounded-xl p-8 sm:p-10 max-w-2xl mx-auto print:rounded-none print:shadow-none print:p-10" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6" style={{ borderBottom: "2px solid #2563EB" }}>
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32">
              <defs><linearGradient id="lgInv" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
              <rect width="32" height="32" rx="7" fill="url(#lgInv)"/>
              <path d="M8 23L13.5 16.5L17 19.5L24 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 11L24 11L24 15" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{"Track"}<span style={{ color: "#2563EB" }}>{"SEO"}</span></div>
              <div style={{ fontSize: 10, color: "#888" }}>Invoice</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#666" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{invoiceNumber}</div>
            <div>Date: {paidAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            <div>Status: <span style={{ color: "#10B981", fontWeight: 500 }}>Paid</span></div>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-8" style={{ fontSize: 11 }}>
          <div>
            <div style={{ fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>From</div>
            <div style={{ fontWeight: 600 }}>PostReach AI Limited</div>
            <div style={{ color: "#666", lineHeight: 1.6 }}>
              Hong Kong<br />
              hello@trackseo.pro<br />
              trackseo.pro
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Bill to</div>
            {billing.name && <div style={{ fontWeight: 600 }}>{billing.name}</div>}
            <div style={{ color: "#666", lineHeight: 1.6 }}>
              {billing.email && <>{billing.email}<br /></>}
              {billing.address.line1 && <>{billing.address.line1}<br /></>}
              {billing.address.line2 && <>{billing.address.line2}<br /></>}
              {[billing.address.city, billing.address.state, billing.address.postal_code].filter(Boolean).join(", ")}
              {billing.address.country && <><br />{billing.address.country}</>}
              {!billing.name && !billing.email && <span style={{ color: "#aaa" }}>Customer details not provided</span>}
            </div>
          </div>
        </div>

        {/* Line items */}
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase" }}>Description</th>
              <th style={{ textAlign: "center", padding: "8px 0", fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "12px 0" }}>
                <div style={{ fontWeight: 500 }}>{inv.product_name || formatPkg(purchase.package)}</div>
                <div style={{ fontSize: 10, color: "#888" }}>{purchase.credits_added} SEO report credit{purchase.credits_added > 1 ? "s" : ""}</div>
              </td>
              <td style={{ padding: "12px 0", textAlign: "center" }}>1</td>
              <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 500 }}>{formatAmount(subtotal, currency)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div style={{ width: 240 }}>
            <div className="flex justify-between py-1.5" style={{ fontSize: 12, color: "#666" }}>
              <span>Subtotal</span>
              <span>{formatAmount(subtotal, currency)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between py-1.5" style={{ fontSize: 12, color: "#666" }}>
                <span>Tax</span>
                <span>{formatAmount(taxAmount, currency)}</span>
              </div>
            )}
            {taxAmount === 0 && (
              <div className="flex justify-between py-1.5" style={{ fontSize: 12, color: "#aaa" }}>
                <span>Tax</span>
                <span>$0.00</span>
              </div>
            )}
            <div className="flex justify-between py-2" style={{ fontSize: 14, fontWeight: 600, borderTop: "2px solid #1a1a1a", marginTop: 4 }}>
              <span>Total</span>
              <span>{formatAmount(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        {card.brand && card.last4 && (
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 11 }}>
            <div style={{ fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Payment method</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CardBrandIcon brand={inv.card_brand} />
              <span style={{ fontWeight: 500 }}>{card.brand} ending in {card.last4}</span>
              {inv.card_exp_month && inv.card_exp_year && (
                <span style={{ color: "#888" }}>· Exp {String(inv.card_exp_month).padStart(2, "0")}/{String(inv.card_exp_year).slice(-2)}</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, fontSize: 10, color: "#aaa", textAlign: "center", lineHeight: 1.6 }}>
          PostReach AI Limited · Hong Kong · trackseo.pro<br />
          Thank you for your purchase. This invoice serves as your receipt.
        </div>
      </div>
    </div>
  );
}

function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === "USD" || currency === "usd") return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency}`;
}

function formatPkg(pkg: string): string {
  const map: Record<string, string> = { single_1: "Single Report", pack_5: "5 Report Pack", pack_10: "10 Report Pack", pack_20: "20 Report Pack" };
  return map[pkg] || pkg;
}

function CardBrandIcon({ brand }: { brand: string }) {
  const color = brand === "visa" ? "#1A1F71" : brand === "mastercard" ? "#EB001B" : brand === "amex" ? "#006FCF" : "#666";
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" style={{ flexShrink: 0 }}>
      <rect width="24" height="16" rx="2" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.5" />
      <text x="12" y="11" textAnchor="middle" fontSize="6" fontWeight="700" fill={color} fontFamily="system-ui">
        {brand?.toUpperCase()?.slice(0, 4)}
      </text>
    </svg>
  );
}
