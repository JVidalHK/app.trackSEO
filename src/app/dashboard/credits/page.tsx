import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PACKAGES = [
  { id: "single_1", name: "Single", credits: 1, price: 299, perReport: "$2.99", savings: null },
  { id: "pack_5", name: "5 Pack", credits: 5, price: 1199, perReport: "$2.40", savings: "20% off", popular: true },
  { id: "pack_10", name: "10 Pack", credits: 10, price: 1999, perReport: "$2.00", savings: "33% off" },
  { id: "pack_20", name: "20 Pack", credits: 20, price: 3499, perReport: "$1.75", savings: "42% off" },
];

export default async function CreditsPage() {
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
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <h1 className="text-lg font-medium mb-1">Buy credits</h1>
      <p className="text-sm text-text-secondary mb-6">
        You have <span className="text-accent font-medium">{profile?.credits_remaining ?? 0}</span> credits remaining
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-surface rounded-xl p-5 border ${
              pkg.popular ? "border-accent" : "border-border"
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
                <span className="text-accent ml-1">· {pkg.savings}</span>
              )}
            </div>
            <div className="text-xs text-text-tertiary mt-0.5">
              {pkg.credits} report{pkg.credits > 1 ? "s" : ""}
            </div>
            <form action={`/api/stripe/checkout`} method="POST" className="mt-4">
              <input type="hidden" name="package" value={pkg.id} />
              <input type="hidden" name="credits" value={pkg.credits} />
              <input type="hidden" name="amount" value={pkg.price} />
              <button
                type="submit"
                className={`w-full h-9 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
                  pkg.popular
                    ? "bg-brand-gradient text-white"
                    : "bg-bg border border-border-light text-text-primary"
                }`}
              >
                Buy {pkg.credits} credit{pkg.credits > 1 ? "s" : ""}
              </button>
            </form>
          </div>
        ))}
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
                  <th className="text-left font-medium px-4 py-2.5">Package</th>
                  <th className="text-left font-medium px-4 py-2.5">Credits</th>
                  <th className="text-left font-medium px-4 py-2.5">Amount</th>
                  <th className="text-left font-medium px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">{p.package}</td>
                    <td className="px-4 py-2.5">{p.credits_added}</td>
                    <td className="px-4 py-2.5">${(p.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "completed"
                            ? "bg-accent/10 text-accent"
                            : p.status === "failed"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {p.status}
                      </span>
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
