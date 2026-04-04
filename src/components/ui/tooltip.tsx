"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const isTouchDevice = useRef(false);

  const updatePos = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 224;
    const margin = 12;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) left = window.innerWidth - tooltipWidth - margin;

    const tooltipHeight = tooltipRef.current?.offsetHeight || 48;
    const showBelow = rect.top < tooltipHeight + margin;

    const top = showBelow
      ? rect.bottom + 6
      : rect.top - tooltipHeight - 6;

    setStyle({ position: "fixed", top, left, width: tooltipWidth, zIndex: 9999 });
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(updatePos);

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1 cursor-help"
      onTouchStart={() => { isTouchDevice.current = true; }}
      onMouseEnter={() => { if (!isTouchDevice.current) setOpen(true); }}
      onMouseLeave={() => { if (!isTouchDevice.current) setOpen(false); }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setOpen((prev) => !prev);
      }}
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
