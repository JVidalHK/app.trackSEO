"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, posthog } from "@/lib/posthog";
import { createClient } from "@/lib/supabase/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();

    // Identify user if logged in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        posthog.identify(data.user.id, {
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
        });
      }
    });
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.capture("$pageview", { $current_url: window.location.href });
    }
  }, [pathname]);

  return <>{children}</>;
}
