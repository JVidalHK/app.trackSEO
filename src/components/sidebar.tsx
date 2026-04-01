"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

interface SidebarProps {
  user: { full_name: string; email: string; credits_remaining: number; total_reports_run: number } | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/reports", label: "My reports", icon: "list" },
  { href: "/dashboard/progress", label: "Progress tracker", icon: "clock" },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/admin", label: "Admin Dashboard", icon: "chart" },
  { href: "/dashboard/admin/users", label: "Users", icon: "users" },
  { href: "/dashboard/admin/reports", label: "Reports", icon: "list" },
  { href: "/dashboard/admin/invoices", label: "Invoices", icon: "card" },
];

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const credits = user?.credits_remaining ?? 0;
  const initials = (user?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(process.env.NEXT_PUBLIC_MARKETING_URL || "/");
  }

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
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        data-sidebar
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col bg-surface border-r border-border transition-all duration-200 overflow-y-auto
          ${collapsed ? "w-14" : "w-56"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center px-3.5 pt-3.5 pb-2 ${collapsed ? "flex-col gap-2" : "gap-2"}`}>
          <svg width="28" height="28" viewBox="0 0 32 32" className="flex-shrink-0">
            <defs><linearGradient id="lgSb" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
            <rect width="32" height="32" rx="7" fill="url(#lgSb)"/>
            <path d="M8 23L13.5 16.5L17 19.5L24 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 11L24 11L24 15" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && (
            <span className="text-sm font-medium text-text-primary flex-1">
              Track<span className={theme === "dark" ? "text-[#06B6D4]" : "text-[#2563EB]"} style={{ fontWeight: 600 }}>SEO</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-7 h-7 rounded-md border border-border items-center justify-center hover:bg-surface-hover transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
          ))}

          {/* Admin section */}
          {isAdmin(user?.email) && (
            <>
              <div className="h-px bg-border my-2 mx-2.5" />
              {!collapsed && <div className="text-[10px] text-[#06B6D4] uppercase tracking-wider px-2.5 py-1 font-medium">Admin</div>}
              {ADMIN_ITEMS.map((item) => (
                <NavItem key={item.href} {...item} active={pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href))} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
              ))}
            </>
          )}
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
                <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${Math.min(credits * 10, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-tertiary">{user?.total_reports_run || 0} reports run</span>
                <Link href="/dashboard/credits" className="text-[10px] text-[#06B6D4]">Buy more</Link>
              </div>
            </>
          )}
        </div>

        {/* User menu container */}
        <div ref={menuRef} className="relative">
          {/* User menu popup */}
          {menuOpen && !collapsed && (
            <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl p-1.5 border border-border-light bg-surface/[0.97] backdrop-blur-xl shadow-2xl z-50 animate-in"
              style={{ animation: "menuIn 0.2s ease-out" }}>
              {/* Header */}
              <div className="px-3 py-2.5">
                <div className="text-sm font-semibold">{user?.full_name || "User"}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">{user?.email}</div>
              </div>
              <div className="h-px bg-border mx-2" />

              {/* Profile */}
              <Link href="/dashboard/settings" onClick={() => { setMenuOpen(false); setMobileOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors mt-1">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Profile
              </Link>

              {/* Buy Credits */}
              <Link href="/dashboard/credits" onClick={() => { setMenuOpen(false); setMobileOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.3"/></svg>
                Buy Credits
              </Link>

              <div className="h-px bg-border mx-2 my-1" />

              {/* Theme toggle */}
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M4.1 4.1l1.1 1.1M10.8 10.8l1.1 1.1M4.1 11.9l1.1-1.1M10.8 5.2l1.1-1.1" stroke="currentColor" strokeWidth="1"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13 8.5a5.5 5.5 0 01-8-4.5 5 5 0 000 .5A5.5 5.5 0 0010.5 10 5.5 5.5 0 0013 8.5z" stroke="currentColor" strokeWidth="1.3"/></svg>
                  )}
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </div>
                <button onClick={toggleTheme} className="relative w-12 h-7 rounded-full transition-colors duration-300"
                  style={{ background: theme === "dark" ? "#2563EB" : "#CBD5E1" }}>
                  <div className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300"
                    style={{ left: theme === "dark" ? 24 : 3 }}>
                    {theme === "dark" ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="#2563EB" strokeWidth="1.5"/><path d="M8 3v1M8 12v1M3 8h1M12 8h1M4.8 4.8l.7.7M10.5 10.5l.7.7M4.8 11.2l.7-.7M10.5 5.5l.7-.7" stroke="#2563EB" strokeWidth="1"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 7a4 4 0 01-6-3.5A4 4 0 009 8a4 4 0 002-1z" stroke="#94A3B8" strokeWidth="1.3"/></svg>
                    )}
                  </div>
                </button>
              </div>

              <div className="h-px bg-border mx-2 my-1" />

              {/* Logout */}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors mb-0.5">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Log out
              </button>
            </div>
          )}

          {/* User row (clickable) */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-3.5 py-2.5 border-t border-border flex items-center gap-2 cursor-pointer hover:bg-surface-hover transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 text-xs flex-1">
                  <div className="font-medium truncate">{user?.full_name || "User"}</div>
                  <div className="text-text-secondary truncate">{user?.email}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}>
                  <path d="M4 9l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
                </svg>
              </>
            )}
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

function NavItem({ href, label, icon, active, collapsed, onClick }: { href: string; label: string; icon: string; active: boolean; collapsed: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
        active ? "bg-accent/10 text-[#60A5FA] font-medium" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}>
      <NavIcon name={icon} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function NavIcon({ name }: { name: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none" as const };
  switch (name) {
    case "grid": return <svg {...p}><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>;
    case "list": return <svg {...p}><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "clock": return <svg {...p}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "card": return <svg {...p}><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6h12" stroke="currentColor" strokeWidth="1.2"/></svg>;
    case "chart": return <svg {...p}><path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 5h3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "users": return <svg {...p}><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1"/><path d="M11 10c1.5 0 3.5 1 3.5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>;
    default: return <div className="w-4 h-4" />;
  }
}
