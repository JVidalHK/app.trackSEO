"use client";

import { useEffect, useState, useRef } from "react";

const STEPS = [
  { name: "Detecting your market", stage: "detecting market" },
  { name: "Analysing domain authority", stage: "crawling" },
  { name: "Scanning keywords", stage: "crawling", stat: "keywords found" },
  { name: "Identifying competitors", stage: "crawling", stat: "competitors found" },
  { name: "Finding content gaps", stage: "crawling", stat: "opportunities" },
  { name: "Crawling your pages", stage: "crawling", stat: "pages checked" },
  { name: "Running speed tests", stage: "crawling" },
  { name: "Checking AI visibility", stage: "analyzing", stat: "AI analysis" },
  { name: "Detecting tech stack", stage: "analyzing" },
  { name: "Generating recommendations", stage: "scoring", stat: "quick wins found" },
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

function mapProgressToStep(progress: number): number {
  if (progress <= 5) return 0;
  if (progress <= 15) return 1;
  if (progress <= 20) return 2;
  if (progress <= 25) return 3;
  if (progress <= 30) return 4;
  if (progress <= 40) return 5;
  if (progress <= 50) return 6;
  if (progress <= 65) return 7;
  if (progress <= 75) return 8;
  if (progress <= 95) return 9;
  return 9;
}

export function ReportProgress({
  reportId,
  initialProgress,
}: {
  reportId: string;
  initialProgress: number;
  initialStage: string;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [activeStep, setActiveStep] = useState(mapProgressToStep(initialProgress));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [eta, setEta] = useState(60);
  const startTime = useRef(Date.now());

  // Poll for status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/status`);
        const data = await res.json();
        const newProgress = data.progress ?? 0;
        setProgress(newProgress);

        const newStep = mapProgressToStep(newProgress);
        if (newStep > activeStep) {
          // Mark previous steps as completed
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            for (let i = 0; i < newStep; i++) next.add(i);
            return next;
          });
          setActiveStep(newStep);
        }

        // Update ETA
        const elapsed = (Date.now() - startTime.current) / 1000;
        if (newProgress > 5) {
          const estimated = (elapsed / newProgress) * (100 - newProgress);
          setEta(Math.max(0, Math.round(estimated)));
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
      } catch {
        // Keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reportId, activeStep]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => setTipIdx((i) => i + 1), 4500);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 57;
  const offset = circumference - (progress / 100) * circumference;
  const STEP_H = 55;
  const trackY = 82 - activeStep * STEP_H;

  return (
    <div className="min-h-[500px] flex flex-col items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)" }} />

      {/* Domain name */}
      <div className="text-xs text-text-tertiary mb-1 tracking-wide">{/* domain shown in parent */}</div>

      {/* Title */}
      {!done && <h2 className="text-xl font-semibold mb-7 transition-opacity duration-500">Generating your SEO report</h2>}

      {/* Ring */}
      <div className={`transition-all duration-600 ${done ? "w-[100px] h-[100px]" : "w-[130px] h-[130px]"}`}>
        <svg width="100%" height="100%" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="57" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle cx="65" cy="65" r="57" fill="none" stroke="url(#ringGrad)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="130" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <text x="65" y="62" textAnchor="middle" dominantBaseline="middle" fill="#E2E8F0"
            fontFamily="system-ui" fontSize="32" fontWeight="600">{progress}%</text>
          {!done && <text x="65" y="82" textAnchor="middle" dominantBaseline="middle" fill="#64748B"
            fontFamily="system-ui" fontSize="10">complete</text>}
        </svg>
      </div>

      {/* Done state */}
      {done && (
        <div className="text-center mt-4 animate-in" style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div className="text-xl font-semibold">Your report is ready</div>
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
        <div className="text-xs text-text-tertiary mt-2 mb-8">
          Reports usually take 60–90 seconds depending on the site
        </div>
      )}

      {/* Step carousel */}
      {!done && (
        <div className="w-full max-w-[420px] h-[220px] relative overflow-hidden mb-7">
          {/* Fade masks */}
          <div className="absolute top-0 left-0 right-0 h-[60px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, var(--color-bg), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-[60px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, var(--color-bg), transparent)" }} />

          {/* Track */}
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
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 ${
                    isDone ? "bg-success/10 border-[1.5px] border-success"
                    : isActive ? "bg-accent/15 border-[1.5px] border-accent"
                    : "bg-white/[0.03] border-[1.5px] border-white/[0.06]"
                  }`}>
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 7l2.5 2.5 4.5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <span className="w-[7px] h-[7px] rounded-full bg-accent" style={{ animation: "dotPulse 1.2s ease-in-out infinite" }} />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2.5" fill="#334155" />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium transition-colors duration-400 ${
                      isDone ? "text-text-tertiary" : isActive ? "text-text-primary" : "text-[#334155]"
                    }`}>{step.name}</div>
                    {isDone && step.stat && (
                      <div className="text-[11px] text-[#06B6D4] font-medium mt-0.5 transition-all duration-400">
                        {step.stat}
                      </div>
                    )}
                  </div>

                  {/* Time / spinner */}
                  <div className="min-w-[32px] text-right">
                    {isActive && (
                      <svg className="inline-block" width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="7" cy="7" r="5" stroke="rgba(37,99,235,0.2)" strokeWidth="1.5" fill="none" />
                        <path d="M7 2a5 5 0 015 5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </svg>
                    )}
                    {isDone && (
                      <span className="text-[11px] text-[#334155]">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      {!done && (
        <div className="max-w-[420px] w-full p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
          <div className="text-[10px] text-text-tertiary font-medium tracking-wide mb-1">DID YOU KNOW?</div>
          <div className="text-xs text-text-tertiary leading-relaxed transition-opacity duration-300">
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
