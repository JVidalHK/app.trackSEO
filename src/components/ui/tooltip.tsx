"use client";

import { useState, useRef, useEffect } from "react";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      {children}
      <span className="w-3.5 h-3.5 rounded-full border border-border-light flex items-center justify-center text-[9px] text-text-tertiary flex-shrink-0">
        ?
      </span>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-xs text-text-primary w-56 text-left z-[999] leading-relaxed font-normal rounded-lg border border-border-light bg-bg/95 backdrop-blur-xl shadow-xl shadow-black/20">
          {text}
        </span>
      )}
    </span>
  );
}
