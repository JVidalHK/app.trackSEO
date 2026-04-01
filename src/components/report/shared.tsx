"use client";

import { useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { TOOLTIPS } from "./tooltips";

export function Tip({ k, children }: { k: string; children: React.ReactNode }) {
  return <Tooltip text={TOOLTIPS[k] || k}>{children}</Tooltip>;
}

export function PositionPill({ position }: { position: number }) {
  // Top 5: green, 6-20: blue, 21-60: amber, 61-99: red
  const style =
    position <= 5
      ? { bg: "#10B981", text: "#fff" }
      : position <= 20
      ? { bg: "#2563EB", text: "#fff" }
      : position <= 60
      ? { bg: "#F59E0B", text: "#fff" }
      : { bg: "#EF4444", text: "#fff" };
  return (
    <span
      className="text-[11px] font-semibold inline-flex items-center justify-center rounded-full"
      style={{ background: style.bg, color: style.text, minWidth: 28, height: 22, padding: "0 6px" }}
    >
      {position}
    </span>
  );
}

export function TrendPill({ value }: { value: number }) {
  const cls =
    value > 10
      ? "bg-[#ECFDF5] text-[#065F46]"
      : value < -10
      ? "bg-[#FEE2E2] text-[#991B1B]"
      : "bg-surface text-text-secondary";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block ${cls}`}>
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

export function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" className="flex-shrink-0">
        <circle cx="8" cy="8" r="6" fill="none" stroke="#10B981" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "warn") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" className="flex-shrink-0">
        <circle cx="8" cy="8" r="6" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <rect x="7.2" y="4.5" width="1.6" height="4" rx="0.8" fill="#F59E0B" />
        <circle cx="8" cy="10.5" r="0.7" fill="#F59E0B" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" className="flex-shrink-0">
      <circle cx="8" cy="8" r="6" fill="none" stroke="#EF4444" strokeWidth="1.5" />
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === "high"
      ? "bg-[#ECFDF5] text-[#065F46]"
      : priority === "medium"
      ? "bg-[#FAEEDA] text-[#633806]"
      : "bg-surface text-text-secondary";
  const label = priority === "high" ? "High impact" : priority === "medium" ? "Medium" : "Low";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export function ExpandableCard({
  priority,
  title,
  description,
  timeEstimate,
  steps,
  expectedImpact,
}: {
  priority: string;
  title: string;
  description: string;
  timeEstimate?: string;
  steps?: string[];
  expectedImpact?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={() => setOpen(!open)}
      className="rounded-lg p-3 cursor-pointer border border-border hover:border-border-light transition-colors"
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <PriorityBadge priority={priority} />
        <span className="text-xs font-medium flex-1 min-w-[180px]">{title}</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      {timeEstimate && (
        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
          timeEstimate.toLowerCase().includes("quick") ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
        }`}>
          {timeEstimate}
        </span>
      )}
      {open && (steps || expectedImpact) && (
        <div className="mt-2 pt-2 border-t border-border text-xs text-text-secondary leading-relaxed">
          {steps && steps.length > 0 && (
            <>
              <span className="font-medium text-text-primary">How to fix this:</span>
              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </>
          )}
          {expectedImpact && (
            <p className="text-success font-medium mt-2">{expectedImpact}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ScoreColor({ score }: { score: number }) {
  if (score >= 80) return <span className="text-success">{score}</span>;
  if (score >= 50) return <span className="text-warning">{score}</span>;
  return <span className="text-danger">{score}</span>;
}

export function FactorBar({ label, tipKey, score }: { label: string; tipKey: string; score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0 text-xs">
      <span className="min-w-[100px]">
        <Tip k={tipKey}>{label}</Tip>
      </span>
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="min-w-[28px] text-right font-medium" style={{ color }}>{score}</span>
    </div>
  );
}

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-text-secondary mt-1">{description || "In development — coming soon"}</div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="text-sm font-medium mb-2 flex items-center gap-2 flex-wrap">
      {children}
      {action && <span className="ml-auto text-xs text-info cursor-pointer font-normal">{action}</span>}
    </div>
  );
}
