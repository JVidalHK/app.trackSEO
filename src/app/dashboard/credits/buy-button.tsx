"use client";

import { useRef, useState } from "react";

export function BuyButton({ packageId, credits, popular }: { packageId: string; credits: number; popular?: boolean }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    setLoading(true);
    // Form will navigate away — but if it takes a while, show loading state
    // Reset after 15s in case redirect fails
    setTimeout(() => setLoading(false), 15000);
  };

  return (
    <form ref={formRef} action="/api/stripe/checkout" method="POST" className="mt-4" onSubmit={handleSubmit}>
      <input type="hidden" name="package" value={packageId} />
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
          popular
            ? "bg-brand-gradient text-white hover:brightness-110 hover:shadow-md hover:shadow-accent/20 active:scale-[0.97]"
            : "bg-bg border border-border-light text-text-primary hover:bg-surface-hover hover:border-accent/30 active:scale-[0.97]"
        } ${loading ? "opacity-70 pointer-events-none" : ""}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d="M7 2a5 5 0 015 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            Redirecting to checkout...
          </>
        ) : (
          <>Buy {credits} credit{credits > 1 ? "s" : ""}</>
        )}
      </button>
    </form>
  );
}
