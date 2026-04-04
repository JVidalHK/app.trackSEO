"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePos = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 224;
    const margin = 12;

    // Horizontal: center on trigger, clamp to viewport
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) left = window.innerWidth - tooltipWidth - margin;

    // Vertical: prefer above, fall back to below
    // Measure actual tooltip height if rendered
    const tooltipHeight = tooltipRef.current?.offsetHeight || 48;
    const spaceAbove = rect.top;
    const showBelow = spaceAbove < tooltipHeight + margin;

    const top = showBelow
      ? rect.bottom + 6
      : rect.top - tooltipHeight - 6;

    setStyle({ position: "fixed", top, left, width: tooltipWidth, zIndex: 9999 });
  }, []);

  useEffect(() => {
    if (!open) return;
    // Delay to allow tooltip to render so we can measure height
    requestAnimationFrame(updatePos);

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => { setOpen(true); }}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
    >
      {children}
      <span className="w-3.5 h-3.5 rounded-full border border-border-light flex items-center justify-center text-[9px] text-text-tertiary flex-shrink-0">
        ?
      </span>
      {open && typeof document !== "undefined" && createPortal(
        <span
          ref={tooltipRef}
          className="px-2.5 py-1.5 text-xs text-text-primary text-left leading-relaxed font-normal rounded-lg border border-border-light bg-bg/95 backdrop-blur-xl shadow-xl shadow-black/20 pointer-events-none"
          style={style}
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
