import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const PACKAGES = [
  { id: "single_1", name: "Single", credits: 1, price: 299, perReport: "$2.99", savings: null },
  { id: "pack_5", name: "5 Pack", credits: 5, price: 1199, perReport: "$2.40", savings: "20% off", popular: true },
  { id: "pack_10", name: "10 Pack", credits: 10, price: 1999, perReport: "$2.00", savings: "33% off" },
  { id: "pack_20", name: "20 Pack", credits: 20, price: 3499, perReport: "$1.75", savings: "42% off" },
];

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  const { data: purchases } = await supabase
    .from("credit_purchases")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .neq("status", "expired")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-lg font-medium mb-1">Buy credits</h1>
      <p className="text-sm text-text-secondary mb-6">
        You have <span className="text-[#06B6D4] font-medium">{profile?.credits_remaining ?? 0}</span> credits remaining
      </p>

      {params.success && (
        <div className="text-xs text-success bg-success/10 px-3 py-2 rounded-lg mb-4">
          Payment successful! Your credits have been added.
        </div>
      )}
      {params.canceled && (
        <div className="text-xs text-warning bg-warning/10 px-3 py-2 rounded-lg mb-4">
          Payment was canceled. No credits were charged.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-surface rounded-xl p-5 border transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 ${
              pkg.popular ? "border-[#2563EB] hover:border-[#06B6D4]" : "border-border hover:border-border-light"
            } relative`}
          >
            {pkg.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                Most popular
              </div>
            )}
            <div className="text-lg font-medium">{pkg.name}</div>
            <div className="text-2xl font-semibold mt-1">
              ${(pkg.price / 100).toFixed(2)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {pkg.perReport} per report
              {pkg.savings && (
                <span className="text-[#06B6D4] ml-1">· {pkg.savings}</span>
              )}
            </div>
            <div className="text-xs text-text-tertiary mt-0.5">
              {pkg.credits} report{pkg.credits > 1 ? "s" : ""}
            </div>
            <form action="/api/stripe/checkout" method="POST" className="mt-4">
              <input type="hidden" name="package" value={pkg.id} />
              <button
                type="submit"
                className={`w-full h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  pkg.popular
                    ? "bg-brand-gradient text-white hover:brightness-110 hover:shadow-md hover:shadow-accent/20 active:scale-[0.97]"
                    : "bg-bg border border-border-light text-text-primary hover:bg-surface-hover hover:border-accent/30 active:scale-[0.97]"
                }`}
              >
                Buy {pkg.credits} credit{pkg.credits > 1 ? "s" : ""}
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-text-tertiary mb-6">
        Prices shown exclude applicable taxes. Tax is calculated at checkout based on your location. Payments are processed securely by Stripe.
      </div>

      {/* Purchase history */}
      {purchases && purchases.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3">Purchase history</h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary">
                  <th className="text-left font-medium px-4 py-2.5">Date</th>
                  <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Package</th>
                  <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Credits</th>
                  <th className="text-left font-medium px-4 py-2.5">Amount</th>
                  <th className="text-center font-medium px-4 py-2.5">Status</th>
                  <th className="text-center font-medium px-4 py-2.5">View</th>
                  <th className="text-center font-medium px-4 py-2.5">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">{formatPackage(p.package)}</td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">{p.credits_added}</td>
                    <td className="px-4 py-2.5">
                      {p.amount_cents > 0 ? `$${(p.amount_cents / 100).toFixed(2)}` : "—"}
                      {p.currency && p.currency !== "usd" ? ` ${p.currency.toUpperCase()}` : ""}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {p.receipt_url ? (
                        <Link href={p.receipt_url} target="_blank" title="Preview invoice">
                          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="inline-block text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer">
                            <path d="M2 2h8l4 4v8H2V2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08"/>
                            <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                            <text x="5" y="12" fontSize="4.5" fontWeight="700" fill="currentColor" fontFamily="system-ui">PDF</text>
                          </svg>
                        </Link>
                      ) : (
                        <span title="Invoice unavailable">
                          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="inline-block text-text-tertiary opacity-30">
                            <path d="M2 2h8l4 4v8H2V2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                            <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {p.invoice_pdf_url || p.receipt_url ? (
                        <Link
                          href={p.invoice_pdf_url || p.receipt_url}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-[#06B6D4] hover:text-[#2563EB] transition-colors"
                          title="Download invoice"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          </svg>
                          PDF
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-text-tertiary opacity-30 cursor-default" title="Invoice unavailable">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          </svg>
                          PDF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
    refunded: "bg-warning/10 text-warning",
    pending: "bg-info/10 text-info",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || "bg-surface text-text-secondary"}`}>
      {status}
    </span>
  );
}

function formatPackage(pkg: string): string {
  const map: Record<string, string> = {
    single_1: "Single",
    pack_5: "5 Pack",
    pack_10: "10 Pack",
    pack_20: "20 Pack",
  };
  return map[pkg] || pkg;
}
