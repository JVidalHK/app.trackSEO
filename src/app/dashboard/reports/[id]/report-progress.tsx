"use client";

import { useEffect, useState, useRef } from "react";

const STEPS = [
  { name: "Detecting your market", stage: "detecting market" },
  { name: "Scanning keywords", stage: "scanning keywords" },
  { name: "Identifying competitors", stage: "scanning keywords" },
  { name: "Crawling your pages", stage: "scanning keywords" },
  { name: "Running speed tests", stage: "running speed tests" },
  { name: "Checking AI visibility", stage: "checking ai visibility" },
  { name: "Detecting tech stack", stage: "checking ai visibility" },
  { name: "Generating recommendations", stage: "generating recommendations" },
  { name: "Scoring your site", stage: "scoring" },
  { name: "Saving report", stage: "saving report" },
];

const TIPS = [
  "Pages that load in under 3 seconds have 32% lower bounce rates.",
  "Google uses mobile speed as a direct ranking factor.",
  "The average top-ranking page has 1,447 words of content.",
  "Structured data can increase click-through rates by up to 30%.",
  "AI Overviews now appear in over 40% of Google searches.",
  "Internal linking is one of the most underused SEO strategies.",
  "The top 3 results get 54% of all clicks on a search page.",
  "HTTPS sites rank higher than HTTP for 95% of keywords.",
];

function mapStageToStep(stage: string, progress: number): number {
  // Map engine stages to step indices
  switch (stage) {
    case "detecting market": return 0;
    case "scanning keywords": {
      // Sub-steps within the parallel work phase (12-40%)
      if (progress <= 20) return 1;
      if (progress <= 30) return 2;
      return 3;
    }
    case "running speed tests": return 4;
    case "checking ai visibility": return progress <= 55 ? 5 : 6;
    case "generating recommendations": return 7;
    case "scoring": return 8;
    case "saving report": return 9;
    case "completed": return 9;
    default: {
      // Fallback to progress-based mapping
      if (progress <= 10) return 0;
      if (progress <= 30) return 2;
      if (progress <= 45) return 4;
      if (progress <= 55) return 5;
      if (progress <= 65) return 7;
      if (progress <= 90) return 8;
      return 9;
    }
  }
}

export function ReportProgress({
  reportId,
  initialProgress,
  initialStage,
}: {
  reportId: string;
  initialProgress: number;
  initialStage: string;
}) {
  const initStage = initialStage || "detecting market";
  const initStep = mapStageToStep(initStage, initialProgress);
  const [progress, setProgress] = useState(initialProgress);
  const [stage, setStage] = useState(initStage);
  const [activeStep, setActiveStep] = useState(initStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const s = new Set<number>();
    for (let i = 0; i < initStep; i++) s.add(i);
    return s;
  });
  const [done, setDone] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/status`);
        const data = await res.json();
        const newProgress = data.progress ?? 0;
        const newStage = data.stage ?? stage;
        setProgress(newProgress);
        setStage(newStage);
        const newStep = mapStageToStep(newStage, newProgress);
        if (newStep > activeStep) {
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            for (let i = 0; i < newStep; i++) next.add(i);
            return next;
          });
          setActiveStep(newStep);
        }
        if (data.status === "completed") {
          setCompletedSteps(new Set(STEPS.map((_, i) => i)));
          setProgress(100);
          clearInterval(interval);
          setDone(true);
          setTimeout(() => window.location.reload(), 2000);
        }
        if (data.status === "failed") {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [reportId, activeStep, stage]);

  useEffect(() => {
    const interval = setInterval(() => setTipIdx((i) => i + 1), 4500);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 57;
  const ringOffset = circumference - (progress / 100) * circumference;
  const STEP_H = 55;
  const trackY = 82 - activeStep * STEP_H;

  return (
    <div className="min-h-[500px] flex flex-col items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)" }} />

      {/* Title */}
      {!done && <h2 className="text-xl font-semibold mb-7 text-text-primary">Generating your SEO report</h2>}

      {/* Ring */}
      <div className={`transition-all duration-600 ${done ? "w-[100px] h-[100px]" : "w-[130px] h-[130px]"}`}>
        <svg width="100%" height="100%" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="57" fill="none" stroke="var(--color-border)" strokeWidth="5" />
          <circle cx="65" cy="65" r="57" fill="none" stroke="url(#ringGrad)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={ringOffset}
            transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="130" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <text x="65" y="62" textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)"
            fontFamily="system-ui" fontSize="32" fontWeight="600">{progress}%</text>
          {!done && <text x="65" y="82" textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-tertiary)"
            fontFamily="system-ui" fontSize="10">complete</text>}
        </svg>
      </div>

      {/* Done state */}
      {done && (
        <div className="text-center mt-4" style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div className="text-xl font-semibold text-text-primary">Your report is ready</div>
          <div className="text-sm text-text-tertiary mt-1">Loading your results...</div>
          <div className="flex gap-1 justify-center mt-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
                style={{ animation: `dotPulse 1.2s ease-in-out infinite ${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Info text */}
      {!done && (
        <div className="text-sm text-text-tertiary mt-3 mb-8 text-center max-w-[420px]">
          Reports usually take 60–90 seconds, though some larger sites need a few minutes. Go grab a coffee or switch tabs, we&apos;ll keep working in the background.
        </div>
      )}

      {/* Step carousel */}
      {!done && (
        <div className="w-full max-w-[420px] h-[220px] relative overflow-hidden mb-7">
          <div className="absolute top-0 left-0 right-0 h-[60px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, var(--color-bg), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-[60px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, var(--color-bg), transparent)" }} />

          <div className="absolute left-0 right-0 transition-transform duration-600"
            style={{ transform: `translateY(${trackY}px)`, transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}>
            {STEPS.map((step, i) => {
              const isActive = i === activeStep;
              const isDone = completedSteps.has(i);
              const dist = i - activeStep;
              const cls = dist < -1 ? "opacity-[0.08] scale-[0.92]"
                : dist === -1 ? "opacity-25 scale-[0.96]"
                : dist === 0 ? "opacity-100 scale-100"
                : dist === 1 ? "opacity-25 scale-[0.96]"
                : "opacity-[0.08] scale-[0.92]";

              return (
                <div key={i} className={`flex items-center gap-3.5 px-5 transition-all duration-500 ${cls}`}
                  style={{ height: STEP_H }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 border-[1.5px] ${
                    isDone ? "bg-success/10 border-success"
                    : isActive ? "bg-accent/15 border-accent"
                    : "bg-border/30 border-border"
                  }`}>
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 7l2.5 2.5 4.5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <span className="w-[7px] h-[7px] rounded-full bg-accent" style={{ animation: "dotPulse 1.2s ease-in-out infinite" }} />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2.5" fill="var(--color-text-tertiary)" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-medium transition-colors duration-400 ${
                      isDone ? "text-text-tertiary" : isActive ? "text-text-primary" : "text-text-hint"
                    }`}>{step.name}</div>
                  </div>

                  <div className="min-w-[32px] text-right">
                    {isActive && (
                      <svg className="inline-block" width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="7" cy="7" r="5" stroke="var(--color-border)" strokeWidth="1.5" fill="none" />
                        <path d="M7 2a5 5 0 015 5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </svg>
                    )}
                    {isDone && <span className="text-[11px] text-text-tertiary">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      {!done && (
        <div className="max-w-[420px] w-full p-4 bg-surface border border-border rounded-xl text-center">
          <div className="text-[11px] text-text-tertiary font-medium tracking-wide mb-1.5">DID YOU KNOW?</div>
          <div className="text-sm text-text-secondary leading-relaxed transition-opacity duration-300">
            {TIPS[tipIdx % TIPS.length]}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.6); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
