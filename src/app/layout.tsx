import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackSEO — Track your SEO like a Pro",
  description: "AI-powered SEO audit reports with actionable recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
