export const SAMPLE_REPORT_DOMAIN = "trackseo.pro";

export const sampleReportData = {
  scores: {
    overall: 92,
    ai_readiness: 88,
  },
  overview: {
    organic_traffic: 14820,
    total_keywords: 342,
    domain_authority: 38,
    mobile_speed: 95,
    traffic_change_pct: 24,
    keywords_change: 67,
  },
  traffic_trend: [
    { month: "2025-07", traffic: 3200 },
    { month: "2025-08", traffic: 3850 },
    { month: "2025-09", traffic: 4600 },
    { month: "2025-10", traffic: 5100 },
    { month: "2025-11", traffic: 5900 },
    { month: "2025-12", traffic: 6800 },
    { month: "2026-01", traffic: 8200 },
    { month: "2026-02", traffic: 9700 },
    { month: "2026-03", traffic: 12400 },
    { month: "2026-04", traffic: 14820 },
  ],
  traffic_by_country: [
    { country_name: "United States", country_code: "US", traffic: 6450 },
    { country_name: "United Kingdom", country_code: "GB", traffic: 2180 },
    { country_name: "Germany", country_code: "DE", traffic: 1340 },
    { country_name: "Canada", country_code: "CA", traffic: 1120 },
    { country_name: "Australia", country_code: "AU", traffic: 890 },
    { country_name: "France", country_code: "FR", traffic: 720 },
    { country_name: "India", country_code: "IN", traffic: 680 },
    { country_name: "Netherlands", country_code: "NL", traffic: 440 },
  ],
  keywords: {
    total: 342,
    items: [
      { keyword: "seo audit tool", position: 4, traffic: 1840, search_volume: 3600, cpc: 17.42, url: "https://trackseo.pro", competition: 0.32 },
      { keyword: "cheap seo tools", position: 6, traffic: 720, search_volume: 880, cpc: 11.70, url: "https://trackseo.pro/blog/cheap-seo-tools", competition: 0.28 },
      { keyword: "website seo checker", position: 3, traffic: 1450, search_volume: 5400, cpc: 7.81, url: "https://trackseo.pro", competition: 0.41 },
      { keyword: "seo report tool", position: 2, traffic: 890, search_volume: 1200, cpc: 14.50, url: "https://trackseo.pro", competition: 0.25 },
      { keyword: "best seo tools for small business", position: 8, traffic: 320, search_volume: 590, cpc: 28.75, url: "https://trackseo.pro/blog/best-seo-tools-small-business", competition: 0.35 },
      { keyword: "ahrefs alternative", position: 7, traffic: 480, search_volume: 1000, cpc: 19.78, url: "https://trackseo.pro/blog/ahrefs-alternatives", competition: 0.30 },
      { keyword: "seo audit report", position: 5, traffic: 390, search_volume: 720, cpc: 19.51, url: "https://trackseo.pro", competition: 0.22 },
      { keyword: "free seo checker", position: 12, traffic: 280, search_volume: 5400, cpc: 7.81, url: "https://trackseo.pro", competition: 0.45 },
      { keyword: "semrush alternative", position: 9, traffic: 350, search_volume: 1900, cpc: 27.93, url: "https://trackseo.pro/blog/semrush-alternatives", competition: 0.38 },
      { keyword: "keyword research tool", position: 15, traffic: 210, search_volume: 8100, cpc: 13.41, url: "https://trackseo.pro/blog/keyword-research-tools", competition: 0.52 },
    ],
  },
  tech_stack: {
    cms: ["Next.js"],
    server: ["Vercel"],
    analytics: [],
    javascript: ["React"],
    cdn: ["Vercel Edge Network"],
    security: ["HTTPS", "HSTS"],
  },
  audit_checklist: [
    { id: "title-tag", category: "On-Page SEO", item: "Title tag", status: "pass", detail: "Title tag is present and within optimal length (57 characters)." },
    { id: "meta-desc", category: "On-Page SEO", item: "Meta description", status: "pass", detail: "Meta description is present and 143 characters — ideal length." },
    { id: "h1-tag", category: "On-Page SEO", item: "H1 heading", status: "pass", detail: "Single H1 tag found — correctly structured." },
    { id: "og-tags", category: "On-Page SEO", item: "Open Graph tags", status: "pass", detail: "OG title, description, and URL are properly set." },
    { id: "canonical", category: "On-Page SEO", item: "Canonical URL", status: "pass", detail: "Canonical tag is correctly set to https://trackseo.pro." },
    { id: "robots-txt", category: "Technical", item: "Robots.txt", status: "pass", detail: "Robots.txt is present and correctly configured." },
    { id: "sitemap", category: "Technical", item: "XML Sitemap", status: "pass", detail: "Sitemap found at /sitemap.xml with 14 URLs." },
    { id: "https", category: "Technical", item: "HTTPS", status: "pass", detail: "Site is served over HTTPS with a valid SSL certificate." },
    { id: "mobile", category: "Performance", item: "Mobile friendly", status: "pass", detail: "Site is mobile responsive with proper viewport meta tag." },
    { id: "speed", category: "Performance", item: "Page speed", status: "pass", detail: "Mobile speed score: 95/100. Fast initial load." },
    { id: "core-web", category: "Performance", item: "Core Web Vitals", status: "pass", detail: "LCP: 1.2s, FID: 12ms, CLS: 0.02 — all within good thresholds." },
    { id: "structured-data", category: "On-Page SEO", item: "Structured data", status: "pass", detail: "Article schema found on blog pages." },
    { id: "img-alt", category: "On-Page SEO", item: "Image alt text", status: "pass", detail: "SVG illustrations used — no raster images without alt text." },
    { id: "og-image", category: "On-Page SEO", item: "OG Image", status: "warn", detail: "No Open Graph image specified. Social shares won't show a preview image." },
    { id: "hreflang", category: "Technical", item: "Hreflang tags", status: "warn", detail: "No hreflang tags found. Consider adding if targeting multiple regions." },
    { id: "broken-links", category: "Technical", item: "Broken links", status: "pass", detail: "No broken internal or external links found." },
  ],
  action_plan: [
    { priority: "high", category: "Social", title: "Add Open Graph image", description: "Create a 1200x630px OG image for social share previews. This significantly improves click-through rates from social media." },
    { priority: "medium", category: "Content", title: "Add more long-tail blog content", description: "Target 20+ additional long-tail keywords to grow organic traffic. Focus on comparison and how-to articles." },
    { priority: "medium", category: "Technical", title: "Add hreflang tags", description: "If targeting users in multiple countries, add hreflang tags to help search engines serve the right content." },
    { priority: "low", category: "Performance", title: "Optimize font loading", description: "Consider self-hosting Google Fonts to reduce DNS lookups and improve loading performance." },
  ],
  ai_visibility: {
    readiness_score: 88,
    factors: [
      { name: "Structured data", score: 95, description: "Article schema is well-implemented on blog pages." },
      { name: "Content clarity", score: 90, description: "Content is well-organized with clear headings and concise answers." },
      { name: "Authority signals", score: 82, description: "Growing domain authority (DA 38). Continue building quality backlinks." },
      { name: "FAQ coverage", score: 75, description: "Some questions are answered but dedicated FAQ sections could improve AI citations." },
      { name: "Entity mentions", score: 88, description: "Brand entity is clearly defined with consistent NAP information." },
    ],
  },
  competitors: [
    { domain: "seoptimer.com", overall_score: 85, organic_traffic: 89000, total_keywords: 4200, domain_authority: 62 },
    { domain: "seobility.net", overall_score: 81, organic_traffic: 67000, total_keywords: 3800, domain_authority: 58 },
    { domain: "sitechecker.pro", overall_score: 78, organic_traffic: 52000, total_keywords: 2900, domain_authority: 54 },
  ],
  backlinks: {
    total: 1240,
    referring_domains: 186,
    dofollow: 980,
    nofollow: 260,
    top_anchors: [
      { anchor: "trackseo", count: 42 },
      { anchor: "seo audit tool", count: 28 },
      { anchor: "trackseo.pro", count: 24 },
      { anchor: "cheap seo tool", count: 18 },
      { anchor: "website seo checker", count: 14 },
    ],
    top_referring: [
      { domain: "producthunt.com", authority: 91, links: 3 },
      { domain: "reddit.com", authority: 99, links: 8 },
      { domain: "indiehackers.com", authority: 72, links: 5 },
      { domain: "twitter.com", authority: 99, links: 12 },
      { domain: "medium.com", authority: 95, links: 4 },
    ],
  },
};

export const sampleScores = sampleReportData.scores;
export const sampleOverview = sampleReportData.overview;
export const sampleMarket = { primary_country_name: "United States" };

export async function seedSampleReport(userId: string) {
  try {
    // Dynamic import to avoid pulling supabase server into client bundles
    const { createServiceClient } = await import("@/lib/supabase/server");
    const svc = createServiceClient();

    // Wait for profile to exist (created by database trigger)
    let profileExists = false;
    for (let i = 0; i < 8; i++) {
      const { count } = await svc
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("id", userId);

      if (count && count > 0) {
        profileExists = true;
        break;
      }
      console.log(`Waiting for profile... attempt ${i + 1}`);
      await new Promise((r) => setTimeout(r, 600));
    }

    if (!profileExists) {
      console.error("Sample seed: profile never appeared for", userId);
      return false;
    }

    // Check if user already has reports
    const { count: reportCount } = await svc
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    console.log("Sample seed check:", { userId, reportCount, profileExists });

    if (reportCount && reportCount > 0) {
      console.log("Sample seed: user already has reports, skipping");
      return false;
    }

    const { error } = await svc.from("reports").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      domain: SAMPLE_REPORT_DOMAIN,
      status: "completed",
      progress: 100,
      stage: "completed",
      report_data: sampleReportData,
      scores: sampleScores,
      overview: sampleOverview,
      market: sampleMarket,
      is_sample: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Sample seed insert error:", error);
      return false;
    }

    console.log("Sample report seeded for user:", userId);
    return true;
  } catch (err) {
    console.error("Sample seed error:", err);
    return false;
  }
}
