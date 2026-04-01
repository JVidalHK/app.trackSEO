const BADGE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  first_report: { label: "First report", icon: "star", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  five_issues_fixed: { label: "5 issues fixed", icon: "check", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  score_improved: { label: "Score improved", icon: "trend", color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  score_above_85: { label: "Score above 85", icon: "trophy", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  ten_reports: { label: "10 reports run", icon: "stack", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  ai_ready_80: { label: "AI ready (80+)", icon: "ai", color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
};

export function Badge({ type, earned }: { type: string; earned: boolean }) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  if (!earned) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs opacity-40">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {config.label}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      <BadgeIcon type={config.icon} color={config.color} />
      {config.label}
    </div>
  );
}

function BadgeIcon({ type, color }: { type: string; color: string }) {
  if (type === "star") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10.5 6.5L16 7.5L12 11.5L13 16L8 13.5L3 16L4 11.5L0 7.5L5.5 6.5L8 1Z" fill={color} />
      </svg>
    );
  }
  if (type === "check") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "trend") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M2 11l4-4 3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

export const ALL_BADGE_TYPES = Object.keys(BADGE_CONFIG);
