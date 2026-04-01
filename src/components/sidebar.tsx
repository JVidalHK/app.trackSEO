"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: { full_name: string; email: string; credits_remaining: number; total_reports_run: number } | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/reports", label: "My reports", icon: "list" },
  { href: "/dashboard/progress", label: "Progress tracker", icon: "clock" },
];

const ACCOUNT_ITEMS = [
  { href: "/dashboard/credits", label: "Buy credits", icon: "card" },
  { href: "/dashboard/settings", label: "Settings", icon: "gear" },
];

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const credits = user?.credits_remaining ?? 0;
  const initials = (user?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        data-sidebar
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col bg-surface border-r border-border transition-all duration-200 overflow-y-auto
          ${collapsed ? "w-14" : "w-56"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
          <svg width="28" height="28" viewBox="0 0 32 32" className="flex-shrink-0">
            <defs><linearGradient id="lgSb" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
            <rect width="32" height="32" rx="7" fill="url(#lgSb)"/>
            <path d="M8 23L13.5 16.5L17 19.5L24 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 11L24 11L24 15" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span className="text-sm font-medium">Track<span className="text-[#06B6D4] font-semibold">SEO</span></span>}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex mx-3.5 mb-2 w-7 h-7 rounded-md border border-border items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          >
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          ))}

          <div className="h-px bg-border my-2 mx-2.5" />
          {!collapsed && (
            <div className="text-[11px] text-text-tertiary uppercase tracking-wider px-2.5 py-1">
              Account
            </div>
          )}

          {ACCOUNT_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Credits box */}
        <div className={`mx-2 mb-2 bg-bg rounded-lg border border-border ${collapsed ? "p-1.5" : "p-2.5"}`}>
          {collapsed ? (
            <div className="text-center text-xs font-medium">{credits}</div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-medium">{credits}</span>
                <span className="text-[11px] text-text-secondary">reports remaining</span>
              </div>
              <div className="h-1 bg-border rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full"
                  style={{ width: `${Math.min(credits * 10, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-tertiary">
                  {user?.total_reports_run || 0} reports run
                </span>
                <Link href="/dashboard/credits" className="text-[10px] text-[#06B6D4]">
                  Buy more
                </Link>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="px-3.5 py-2.5 border-t border-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[11px] font-medium text-[#60A5FA] flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 text-xs">
              <div className="font-medium truncate">{user?.full_name || "User"}</div>
              <div className="text-text-secondary truncate">{user?.email}</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
        active
          ? "bg-bg text-text-primary font-medium"
          : "text-text-secondary hover:bg-bg hover:text-text-primary"
      }`}
    >
      <NavIcon name={icon} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function NavIcon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none" as const };
  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "list":
      return (
        <svg {...props}>
          <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6h12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "gear":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return <div className="w-4 h-4" />;
  }
}
