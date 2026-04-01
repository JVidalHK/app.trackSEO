"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DomainInput({ credits }: { credits: number }) {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleGenerate() {
    if (credits < 1) {
      router.push("/dashboard/credits");
      return;
    }

    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      setError("Enter a valid domain (e.g. example.com)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: cleaned }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start report");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/reports/${data.reportId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter a domain to analyse (e.g. acmecoffee.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1 h-10 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="h-10 px-4 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {loading
            ? "Starting..."
            : credits < 1
            ? "Buy credits to start"
            : "Generate report"}
        </button>
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}
