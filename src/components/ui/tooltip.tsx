"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null);

  const updatePos = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 224; // w-56 = 14rem = 224px
    const tooltipHeight = 60; // approximate tooltip height
    const margin = 8;

    // Calculate horizontal position, clamped to viewport
    let left = rect.left + rect.width / 2;
    const halfWidth = tooltipWidth / 2;
    if (left - halfWidth < margin) left = halfWidth + margin;
    if (left + halfWidth > window.innerWidth - margin) left = window.innerWidth - halfWidth - margin;

    // Show below if not enough space above
    const spaceAbove = rect.top;
    const below = spaceAbove < tooltipHeight + margin;

    setPos({
      top: below
        ? rect.bottom + window.scrollY + 6
        : rect.top + window.scrollY - 6,
      left,
      below,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => { setOpen(true); updatePos(); }}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen(!open); updatePos(); }}
    >
      {children}
      <span className="w-3.5 h-3.5 rounded-full border border-border-light flex items-center justify-center text-[9px] text-text-tertiary flex-shrink-0">
        ?
      </span>
      {open && pos && typeof document !== "undefined" && createPortal(
        <span
          className="fixed px-2.5 py-1.5 text-xs text-text-primary w-56 text-left z-[9999] leading-relaxed font-normal rounded-lg border border-border-light bg-bg/95 backdrop-blur-xl shadow-xl shadow-black/20 pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            transform: pos.below ? "translateX(-50%)" : "translate(-50%, -100%)",
          }}
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
