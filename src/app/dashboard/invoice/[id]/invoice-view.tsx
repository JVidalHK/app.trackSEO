"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function InvoiceView({ purchase }: { purchase: any }) {
  const searchParams = useSearchParams();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadPdf = useCallback(async () => {
    if (!invoiceRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

    const invNum = (purchase.invoice_data?.invoice_number || "invoice").replace(/\s/g, "_");
    pdf.save(`TrackSEO_${invNum}.pdf`);
  }, [purchase]);

  // Auto-download when opened with ?download=true
  useEffect(() => {
    if (searchParams.get("download") === "true") {
      setTimeout(() => downloadPdf(), 800);
    }
  }, [searchParams, downloadPdf]);

  const inv = purchase.invoice_data || {};
  const paidAt = inv.paid_at ? new Date(inv.paid_at) : new Date(purchase.created_at);
  const currency = (inv.currency || purchase.currency || "usd").toUpperCase();
  const total = purchase.amount_cents || inv.total || inv.amount || 0;
  const subtotal = inv.subtotal || total;
  const taxAmount = inv.tax_amount || 0;
  const invoiceNumber = inv.invoice_number || `INV-${new Date(purchase.created_at).getFullYear()}-${purchase.id?.slice(0, 5)?.toUpperCase()}`;
  const receiptNumber = inv.charge_id || inv.payment_intent_id || purchase.stripe_payment_intent || "—";
  const customerId = purchase.stripe_customer_id || "—";

  const billing = {
    name: inv.billing_name || "",
    email: inv.billing_email || "",
    address: inv.billing_address || {},
  };

  const card = {
    brand: inv.card_brand || null,
    last4: inv.card_last4 || null,
    exp_month: inv.card_exp_month,
    exp_year: inv.card_exp_year,
  };

  const brandLabel = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : null;
  const productName = inv.product_name || formatPkg(purchase.package);
  const creditCount = purchase.credits_added || inv.credits || 0;

  // Tax label
  const taxBreakdown = inv.tax_breakdown || [];
  const taxLabel = taxBreakdown.length > 0
    ? `${taxBreakdown[0].tax_rate_details?.display_name || "Tax"} (${taxBreakdown[0].tax_rate_details?.percentage_decimal || ""}% — ${taxBreakdown[0].tax_rate_details?.country || ""})`
    : taxAmount > 0 ? "Tax" : "Tax (0%)";

  return (
    <div>
      {/* Action bar */}
      <div className="screen-only flex items-center gap-2 mb-4">
        <button onClick={downloadPdf}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-gradient text-white hover:opacity-90 active:scale-[0.97] transition-all">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Download PDF
        </button>
        <button onClick={() => window.history.back()}
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">
          Back to purchases
        </button>
      </div>

      {/* Invoice */}
      <div ref={invoiceRef} style={{ fontFamily: "-apple-system,system-ui,sans-serif", maxWidth: 620, margin: "0 auto", background: "#fff", borderRadius: 12, overflow: "hidden", color: "#0F172A" }}>

        {/* Header */}
        <div style={{ padding: "32px 36px 24px", borderBottom: "2px solid #2563EB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none"><defs><linearGradient id="ig" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs><rect width="36" height="36" rx="8" fill="url(#ig)"/><path d="M8 26L14 19L18 22L28 12" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 12L28 12L28 17" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", letterSpacing: -0.3 }}>{"Track"}<span style={{ color: "#2563EB" }}>{"SEO"}</span></div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Track your SEO like a Pro</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0F172A", margin: 0 }}>Invoice</h1>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{invoiceNumber}</div>
              <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "#E6F9F0", color: "#059669", marginTop: 6 }}>Paid</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 36px" }}>

          {/* From / Bill to */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>From</h3>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>PostReach AI Limited</span><br />
                Hong Kong<br />
                hello@trackseo.pro
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>Bill to</h3>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>
                {billing.name && <><span style={{ fontWeight: 600, color: "#0F172A" }}>{billing.name}</span><br /></>}
                {billing.address.line1 && <>{billing.address.line1}<br /></>}
                {billing.address.line2 && <>{billing.address.line2}<br /></>}
                {[billing.address.city, billing.address.state, billing.address.postal_code].filter(Boolean).join(", ")}
                {billing.address.country && <><br />{billing.address.country}</>}
                {billing.email && <><br />{billing.email}</>}
                {!billing.name && !billing.email && <span style={{ color: "#94A3B8" }}>Customer details not provided at checkout</span>}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <DetailBox label="Invoice date" value={paidAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            <DetailBox label="Payment date" value={paidAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            <DetailBox label="Receipt number" value={receiptNumber.length > 20 ? receiptNumber.slice(0, 20) + "…" : receiptNumber} />
            <DetailBox label="Customer ID" value={customerId.length > 20 ? customerId.slice(0, 20) + "…" : customerId} />
          </div>

          {/* Line items */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ width: "55%", fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0", textAlign: "left" }}>Description</th>
                <th style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0", textAlign: "left" }}>Qty</th>
                <th style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0", textAlign: "left" }}>Unit price</th>
                <th style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "14px 0", fontSize: 13, color: "#334155" }}>
                  <div style={{ fontWeight: 500, color: "#0F172A" }}>{productName}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{creditCount} SEO audit report credit{creditCount > 1 ? "s" : ""} · Credits never expire</div>
                </td>
                <td style={{ padding: "14px 0", fontSize: 13, color: "#334155" }}>1</td>
                <td style={{ padding: "14px 0", fontSize: 13, color: "#334155" }}>{fmtAmt(subtotal, currency)}</td>
                <td style={{ padding: "14px 0", fontSize: 13, fontWeight: 500, color: "#0F172A", textAlign: "right" }}>{fmtAmt(subtotal, currency)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
            <div style={{ width: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#64748B" }}>
                <span>Subtotal</span>
                <span>{fmtAmt(subtotal, currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#64748B" }}>
                <span>{taxLabel}</span>
                <span>{fmtAmt(taxAmount, currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", fontSize: 15, fontWeight: 600, color: "#0F172A", borderTop: "1.5px solid #E2E8F0", marginTop: 6 }}>
                <span>Total paid</span>
                <span>{fmtAmt(total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          {brandLabel && card.last4 && (
            <div style={{ padding: "16px 20px", background: "#F8FAFC", borderRadius: 10, display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <CardIcon brand={card.brand} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{brandLabel} ending in {card.last4}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                  Charged on {paidAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {paidAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>Successful</div>
            </div>
          )}

          {/* Credits note */}
          <div style={{ padding: "14px 18px", background: "#F0F7FF", borderRadius: "0 8px 8px 0", borderLeft: "3px solid #2563EB", fontSize: 12, color: "#334155", lineHeight: 1.6, marginBottom: 0 }}>
            <div style={{ fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{creditCount} credit{creditCount > 1 ? "s" : ""} added to your account</div>
            Use your credits at <span style={{ color: "#2563EB", fontWeight: 500 }}>app.trackseo.pro</span> to generate SEO audit reports. Credits never expire.
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 36px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>
              PostReach AI Limited · Hong Kong<br />
              hello@trackseo.pro · trackseo.pro
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 36 36" fill="none"><defs><linearGradient id="ig2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs><rect width="36" height="36" rx="8" fill="url(#ig2)"/><path d="M8 26L14 19L18 22L28 12" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 12L28 12L28 17" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>{"Track"}</span><span style={{ color: "#2563EB", fontWeight: 500 }}>{"SEO"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{value}</div>
    </div>
  );
}

function fmtAmt(cents: number, currency: string): string {
  const a = cents / 100;
  if (currency === "USD") return `$${a.toFixed(2)}`;
  return `${a.toFixed(2)} ${currency}`;
}

function formatPkg(pkg: string): string {
  const m: Record<string, string> = { single_1: "Single Report", pack_5: "5 Report Pack", pack_10: "10 Report Pack", pack_20: "20 Report Pack" };
  return m[pkg] || pkg;
}

function CardIcon({ brand }: { brand: string }) {
  const colors: Record<string, string> = {
    visa: "linear-gradient(135deg,#1A1F71,#F7B600)",
    mastercard: "linear-gradient(135deg,#EB001B,#F79E1B)",
    amex: "linear-gradient(135deg,#006FCF,#00A3E0)",
  };
  const bg = colors[brand] || "linear-gradient(135deg,#64748B,#94A3B8)";
  const label = brand?.toUpperCase()?.slice(0, 4) || "CARD";
  return (
    <div style={{ width: 42, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bg }}>
      <svg width="28" height="10" viewBox="0 0 28 10" fill="none">
        <text x="0" y="9" fontFamily="-apple-system,sans-serif" fontSize="9" fontWeight="700" fill="#fff" letterSpacing="0.5">{label}</text>
      </svg>
    </div>
  );
}
