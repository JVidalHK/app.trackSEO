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
    <div className="max-w-lg">
      <div className="rounded-xl bg-surface border border-border p-5">
        <input
          type="text"
          placeholder="Enter your website URL..."
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="w-full h-12 px-4 rounded-lg bg-bg border border-border-light text-sm focus:border-accent focus:outline-none placeholder:text-text-tertiary"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-11 mt-3 rounded-lg bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]"
        >
          {loading
            ? "Starting analysis..."
            : credits < 1
            ? "Buy credits to start"
            : "Analyse my site"}
        </button>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}
