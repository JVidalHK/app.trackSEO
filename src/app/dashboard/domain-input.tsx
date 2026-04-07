"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

interface DomainInputProps {
  credits: number;
  existingDomains?: { domain: string; date: string }[];
}

export function DomainInput({ credits: initialCredits, existingDomains = [] }: DomainInputProps) {
  // Live credits state — updates via Supabase Realtime
  const [credits, setCredits] = useState(initialCredits);

  useEffect(() => {
    setCredits(initialCredits);
  }, [initialCredits]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;
      const channel = supabase
        .channel("credits-domain-input")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
          (payload) => {
            const newCredits = payload.new?.credits_remaining;
            if (typeof newCredits === "number") setCredits(newCredits);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    });
  }, []);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [cleanedDomain, setCleanedDomain] = useState("");
  const router = useRouter();

  function cleanDomain(input: string): string {
    return input.trim().toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .replace(/\?.*$/, "")
      .replace(/#.*$/, "");
  }

  function validateAndProceed() {
    if (credits < 1) {
      router.push("/dashboard/credits");
      return;
    }

    const cleaned = cleanDomain(domain);

    if (!cleaned) {
      setError("Please enter a website URL");
      return;
    }

    if (!DOMAIN_REGEX.test(cleaned)) {
      setError("Please enter a valid domain (e.g. example.com)");
      return;
    }

    setError("");
    setCleanedDomain(cleaned);

    // Check if report already exists today
    const today = new Date().toISOString().slice(0, 10);
    const existingToday = existingDomains.find(
      (d) => d.domain === cleaned && d.date.slice(0, 10) === today
    );

    if (existingToday) {
      setShowConfirm(true);
      return;
    }

    generateReport(cleaned);
  }

  async function generateReport(dom: string) {
    setShowConfirm(false);
    setLoading(true);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: dom }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setCredits(0);
          router.push("/dashboard/credits");
        } else {
          setError(data.error || "Failed to start report");
        }
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
          onChange={(e) => { setDomain(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && validateAndProceed()}
          className="w-full h-12 px-4 rounded-lg bg-bg border border-border-light text-sm focus:border-accent focus:outline-none placeholder:text-text-tertiary"
        />
        <button
          onClick={validateAndProceed}
          disabled={loading}
          className="w-full h-11 mt-3 rounded-lg bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]"
        >
          {loading
            ? "Starting analysis..."
            : credits < 1
            ? "Buy credits to start"
            : "Generate Report"}
        </button>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>

      {/* Duplicate report confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl" style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div className="text-sm font-medium mb-2">Report already generated today</div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              It looks like you already generated a report for <span className="font-medium text-text-primary">{cleanedDomain}</span> today. Running another report will use 1 credit. Are you sure?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => generateReport(cleanedDomain)}
                className="h-9 px-4 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Generate anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
