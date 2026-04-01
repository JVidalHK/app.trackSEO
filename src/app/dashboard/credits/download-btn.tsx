"use client";

import { useState } from "react";

export function DownloadInvoiceBtn({ purchaseId }: { purchaseId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      // Open invoice in a hidden iframe, capture it, generate PDF
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.width = "700px";
      iframe.style.height = "1200px";
      iframe.src = `/dashboard/invoice/${purchaseId}?embed=true`;
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise<void>((resolve) => {
        iframe.onload = () => setTimeout(resolve, 1500);
      });

      const invoiceEl = iframe.contentDocument?.querySelector("[data-invoice]") as HTMLElement;
      if (!invoiceEl) {
        // Fallback: open in new tab
        window.open(`/dashboard/invoice/${purchaseId}?download=true`, "_blank");
        document.body.removeChild(iframe);
        setLoading(false);
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`TrackSEO_Invoice_${purchaseId.slice(0, 8)}.pdf`);

      document.body.removeChild(iframe);
    } catch {
      // Fallback: open in new tab with auto-download
      window.open(`/dashboard/invoice/${purchaseId}?download=true`, "_blank");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-[#06B6D4] hover:text-[#2563EB] hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50"
      title="Download invoice PDF"
    >
      {loading ? (
        <svg width="15" height="15" viewBox="0 0 16 16" className="animate-spin">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="8" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}
      PDF
    </button>
  );
}
