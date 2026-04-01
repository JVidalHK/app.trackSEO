"use client";

import { useEffect, useState } from "react";

const STAGE_LABELS: Record<string, string> = {
  queued: "Waiting in queue...",
  "detecting market": "Detecting primary market...",
  crawling: "Crawling pages and analysing keywords...",
  analyzing: "Running AI analysis...",
  scoring: "Calculating scores...",
  completed: "Report ready!",
  failed: "Report generation failed",
};

export function ReportProgress({
  reportId,
  initialProgress,
  initialStage,
}: {
  reportId: string;
  initialProgress: number;
  initialStage: string;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [stage, setStage] = useState(initialStage);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/status`);
        const data = await res.json();

        setProgress(data.progress ?? 0);
        setStage(data.stage ?? "queued");

        if (data.status === "completed") {
          clearInterval(interval);
          setDone(true);
          // Wait for webhook to finish writing to Supabase, then hard reload
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }

        if (data.status === "failed") {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch {
        // Keep polling on error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reportId]);

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#2563EB"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-medium">{progress}%</span>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-1">
        {done ? "Loading your report..." : "Generating your report"}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {done ? "Almost there..." : (STAGE_LABELS[stage] || stage)}
      </p>

      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gradient rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-text-tertiary mt-3">
        {done ? "Preparing your report view" : "This usually takes 30-90 seconds"}
      </p>
    </div>
  );
}
