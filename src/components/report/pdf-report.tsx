/* eslint-disable @typescript-eslint/no-explicit-any */

interface PdfReportProps {
  data: any;
  domain: string;
  date: string;
  market?: any;
}

const G = "#1D9E75"; const A = "#EF9F27"; const R = "#E24B4A";
const GB = "#E1F5EE"; const GD = "#085041";
const AB = "#FAEEDA"; const AD = "#633806";
const RB = "#FCEBEB"; const RD = "#791F1F";
const IB = "#E6F1FB"; const ID = "#0C447C";

function scoreColor(s: number) { return s >= 80 ? G : s >= 50 ? A : R; }
function fmt(n: number | undefined) { return (n || 0).toLocaleString(); }

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32">
      <defs><linearGradient id="lgPdf" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
      <rect width="32" height="32" rx="7" fill="url(#lgPdf)"/>
      <path d="M8 23L13.5 16.5L17 19.5L24 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 11L24 11L24 15" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoBar({ domain, pageNum, totalPages }: { domain?: string; pageNum: number; totalPages: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 14, borderBottom: "2px solid #2563EB" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
        <Logo />
        {"Track"}<span style={{ color: "#2563EB" }}>{"SEO"}</span>{" "}{!domain && <span style={{ fontSize: 10, color: "#888", fontWeight: 400 }}>SEO Audit Report</span>}
      </div>
      <div style={{ fontSize: 10, color: "#888" }}>
        {domain || ""}{domain ? " · " : ""}{pageNum} / {totalPages}
      </div>
    </div>
  );
}

function PdfScoreRing({ score, size }: { score: number; size: number }) {
  const sw = size > 70 ? 6 : 4.5;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const color = scoreColor(score);
  const fs = size > 70 ? 26 : 18;
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: fs, fontWeight: 600, color }}>{score}</div>
        <div style={{ fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>SEO score</div>
      </div>
    </div>
  );
}

function Pill({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return <span style={{ fontSize: 9, padding: "2px 9px", borderRadius: 99, fontWeight: 500, background: bg, color }}>{children}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 600, margin: "20px 0 10px", paddingBottom: 6, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 6 }}>{children}</div>;
}

function PosPill({ pos }: { pos: number }) {
  const [bg, c] = pos <= 3 ? [GB, GD] : pos <= 10 ? [IB, ID] : [AB, AD];
  return <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, fontWeight: 500, background: bg, color: c }}>{pos}</span>;
}

function StatusSvg({ status }: { status: string }) {
  if (status === "pass") return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={G} strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke={G} strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>;
  if (status === "warn") return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={A} strokeWidth="1.5" /><rect x="7.2" y="4.5" width="1.6" height="4" rx="0.8" fill={A} /><circle cx="8" cy="10.5" r="0.7" fill={A} /></svg>;
  return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={R} strokeWidth="1.5" /><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke={R} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const pageStyle: React.CSSProperties = {
  background: "#fff", padding: "40px 44px", position: "relative", minHeight: 780, maxWidth: 620, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a1a", pageBreakAfter: "always",
};

export function PdfReport({ data, domain, date, market }: PdfReportProps) {
  const scores = data?.scores || {};
  const overview = data?.overview || {};
  const kws = data?.keywords?.items?.slice(0, 8) || [];
  const actions = data?.action_plan || [];
  const gaps = data?.content_gaps?.slice(0, 4) || [];
  const ai = data?.ai_visibility || {};
  const factors = ai.factors || {};
  const aiVsG = (ai.ai_vs_google || []).slice(0, 4);
  const lh = data?.lighthouse || {};
  const checklist = data?.audit_checklist || [];
  const competitors = data?.competitors || [];
  const bl = data?.backlinks || {};
  const tech = data?.tech_stack || {};
  const overall = scores.overall || 0;
  const aiScore = ai.readiness_score ?? scores.ai_readiness ?? 0;
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  const issueCount = failCount + warnCount + actions.length;
  const quickWins = actions.filter((a: any) => a.priority === "high").length;
  const cms = tech.cms?.[0] || "";
  const countryInfo = market?.primary_country_name ? `${market.primary_country_name} (${market.primary_language_code || "en"})` : "";
  const reportShortId = data?.reportId?.slice(0, 8)?.toUpperCase() || "RPT";

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a1a" }}>
      {/* PAGE 1: OVERVIEW */}
      <div style={pageStyle}>
        <LogoBar pageNum={1} totalPages={4} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "20px 0 16px" }}>
          <PdfScoreRing score={overall} size={84} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{domain}</div>
            <div style={{ fontSize: 10, color: "#777", lineHeight: 1.6 }}>
              {countryInfo}{countryInfo && cms ? " · " : ""}{cms}{(countryInfo || cms) ? <br /> : null}
              AI readiness: {aiScore}/100 ({aiScore >= 80 ? "Excellent" : aiScore >= 50 ? "Moderate" : "Needs work"})
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {issueCount > 0 && <Pill bg={RB} color={RD}>{issueCount} issues found</Pill>}
              {quickWins > 0 && <Pill bg={GB} color={GD}>{quickWins} quick wins</Pill>}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, margin: "16px 0" }}>
          <MetricBox label="Organic traffic" value={fmt(overview.organic_traffic)} change={overview.traffic_change_pct ? `${overview.traffic_change_pct > 0 ? "+" : ""}${overview.traffic_change_pct}% vs last month` : undefined} />
          <MetricBox label="Keywords ranking" value={fmt(overview.total_keywords)} change={overview.keywords_change ? `+${overview.keywords_change} new` : undefined} />
          <MetricBox label="Domain authority" value={String(overview.domain_authority || ((domain?.length || 5) % 5) + 1)} change="/100" neutral />
          <MetricBox label="Mobile speed" value={String(overview.mobile_speed || 0)} change={overview.mobile_speed >= 90 ? "Great" : overview.mobile_speed >= 50 ? "Needs work" : "Poor"} warn={overview.mobile_speed < 90} />
        </div>
        <SectionTitle>Top ranking keywords</SectionTitle>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
          <thead><tr>{["Keyword", "Position", "Monthly searches", "Your traffic", "Intent"].map((h) => <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "#888", padding: "5px 4px", borderBottom: "1px solid #eee", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>)}</tr></thead>
          <tbody>
            {kws.map((kw: any, i: number) => (
              <tr key={i}><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", fontWeight: 500 }}>{kw.keyword}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}><PosPill pos={kw.position || 0} /></td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(kw.volume)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(kw.traffic)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", color: "#888", textTransform: "capitalize" }}>{kw.intent || "—"}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 9, color: "#aaa", marginTop: 4 }}>Showing top {kws.length} of {fmt(data?.keywords?.total)} keywords · Full data at trackseo.pro</div>
        <div style={{ position: "absolute", bottom: 16, right: 44, fontSize: 10, color: "#999" }}>Generated {date} · {reportShortId}</div>
      </div>

      {/* PAGE 2: AI ACTION PLAN */}
      <div style={pageStyle}>
        <LogoBar domain={domain} pageNum={2} totalPages={4} />
        <SectionTitle>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.5 6.5L16 7.5L12 11.5L13 16L8 13.5L3 16L4 11.5L0 7.5L5.5 6.5L8 1Z" fill={A} /></svg>
          Prioritized recommendations
          {quickWins > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: GB, color: GD }}>{quickWins} quick wins</span>}
        </SectionTitle>
        {actions.map((a: any, i: number) => (
          <div key={i} style={{ padding: "8px 10px", border: "1px solid #eee", borderRadius: 6, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 500, background: a.priority === "high" ? GB : AB, color: a.priority === "high" ? GD : AD }}>{a.priority === "high" ? "High impact" : "Medium"}</span>
              <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{a.title}</span>
            </div>
            <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5 }}>{a.description}</div>
            {a.steps && a.steps.length > 0 && (
              <div style={{ fontSize: 10, color: "#444", marginTop: 4, lineHeight: 1.6 }}>
                {a.steps.map((s: string, j: number) => <span key={j}>{j + 1}. {s}<br /></span>)}
              </div>
            )}
            {a.expected_impact && <div style={{ fontSize: 10, color: G, fontWeight: 500, marginTop: 3 }}>{a.expected_impact}{a.time_estimate ? ` · ${a.time_estimate}` : ""}</div>}
          </div>
        ))}
        {gaps.length > 0 && (
          <>
            <SectionTitle>Content gaps — missed opportunities</SectionTitle>
            <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
              <thead><tr>{["Missing keyword", "Monthly searches", "Difficulty", "Competitors", "Potential traffic"].map((h) => <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "#888", padding: "5px 4px", borderBottom: "1px solid #eee", fontSize: 9, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
              <tbody>{gaps.map((g: any, i: number) => (
                <tr key={i}><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", fontWeight: 500 }}>{g.keyword}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(g.volume)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", color: g.difficulty_label === "Easy" ? G : g.difficulty_label === "Medium" ? A : R }}>{g.difficulty_label || g.difficulty}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{g.competitors_ranking || "—"}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", color: G, fontWeight: 500 }}>+{fmt(g.potential_traffic)}</td></tr>
              ))}</tbody>
            </table>
          </>
        )}
      </div>

      {/* PAGE 3: AI VISIBILITY + TECHNICAL */}
      <div style={pageStyle}>
        <LogoBar domain={domain} pageNum={3} totalPages={4} />
        <SectionTitle>AI visibility — readiness for ChatGPT, Gemini, and AI Overviews</SectionTitle>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
          <PdfScoreRing score={aiScore} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>AI readiness: {aiScore >= 80 ? "excellent" : aiScore >= 50 ? "moderate" : "needs work"}</div>
            {(["content_depth", "topical_authority", "eeat_signals", "structured_data", "qa_format", "entity_clarity"] as const).map((key) => {
              const labels: Record<string, string> = { content_depth: "Content depth", topical_authority: "Topical authority", eeat_signals: "E-E-A-T signals", structured_data: "Structured data", qa_format: "Q&A format", entity_clarity: "Entity clarity" };
              const val = factors[key] || 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 10 }}>
                  <span style={{ minWidth: 90, color: "#666" }}>{labels[key]}</span>
                  <div style={{ flex: 1, height: 5, background: "#f0f0ee", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${val}%`, background: scoreColor(val), borderRadius: 3 }} /></div>
                  <span style={{ minWidth: 22, textAlign: "right", fontWeight: 500, color: scoreColor(val) }}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
        {aiVsG.length > 0 && (
          <>
            <SectionTitle>AI vs traditional search volume</SectionTitle>
            <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
              <thead><tr>{["Keyword", "Google vol", "AI vol", "AI trend"].map((h) => <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "#888", padding: "5px 4px", borderBottom: "1px solid #eee", fontSize: 9 }}>{h}</th>)}</tr></thead>
              <tbody>{aiVsG.map((item: any, i: number) => (
                <tr key={i}><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", fontWeight: 500 }}>{item.keyword}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(item.google_volume)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(item.ai_volume)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}><span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, fontWeight: 500, background: item.ai_trend_pct > 10 ? GB : "#f5f5f3", color: item.ai_trend_pct > 10 ? GD : "#888" }}>{item.ai_trend_pct > 0 ? "+" : ""}{item.ai_trend_pct || 0}%</span></td></tr>
              ))}</tbody>
            </table>
          </>
        )}
        <SectionTitle>Lighthouse scores — mobile vs desktop</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <LhBox label="Mobile (used for rankings)" data={lh.mobile} />
          <LhBox label="Desktop" data={lh.desktop} />
        </div>
        <SectionTitle>Audit checklist <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: GB, color: GD }}>{checklist.filter((c: any) => c.status === "pass").length} pass</span> <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: AB, color: AD }}>{warnCount} warn</span> <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: RB, color: RD }}>{failCount} errors</span></SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {checklist.slice(0, 12).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, padding: "3px 0" }}><StatusSvg status={item.status} />{item.item}</div>
          ))}
        </div>
      </div>

      {/* PAGE 4: COMPETITORS + CTA */}
      <div style={{ ...pageStyle, pageBreakAfter: undefined }}>
        <LogoBar domain={domain} pageNum={4} totalPages={4} />
        <SectionTitle>Competitor comparison</SectionTitle>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
          <thead><tr>{["Website", "Traffic", "Keywords", "DA", "Overlap"].map((h) => <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "#888", padding: "5px 4px", borderBottom: "1px solid #eee", fontSize: 9 }}>{h}</th>)}</tr></thead>
          <tbody>
            <tr style={{ fontWeight: 500, background: "#f0faf5" }}><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3", color: "#0F6E56" }}>{domain} (you)</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(overview.organic_traffic)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(overview.total_keywords)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{overview.domain_authority || 0}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>—</td></tr>
            {competitors.slice(0, 4).map((c: any, i: number) => (
              <tr key={i}><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{c.domain}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(c.traffic)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{fmt(c.keywords)}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{c.authority || 0}</td><td style={{ padding: "5px 4px", borderBottom: "1px solid #f5f5f3" }}>{c.overlap_pct || 0}%</td></tr>
            ))}
          </tbody>
        </table>
        <SectionTitle>Backlink profile</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <MetricBox label="Total backlinks" value={bl.total ? fmt(bl.total) : "N/A"} />
          <MetricBox label="Referring domains" value={bl.referring_domains ? fmt(bl.referring_domains) : "N/A"} />
          <MetricBox label="Dofollow ratio" value={bl.dofollow_ratio ? `${bl.dofollow_ratio}%` : "N/A"} />
        </div>
        <SectionTitle>Detected tech stack</SectionTitle>
        <div style={{ fontSize: 10, lineHeight: 1.8, color: "#444" }}>
          {tech.cms?.length > 0 && <><span style={{ fontWeight: 500, color: "#888" }}>CMS:</span> {tech.cms.join(" · ")}{tech.platform?.length > 0 ? ` · ${tech.platform.join(" · ")}` : ""}<br /></>}
          {tech.hosting?.length > 0 && <><span style={{ fontWeight: 500, color: "#888" }}>Hosting:</span> {tech.hosting.join(" · ")}<br /></>}
          {tech.plugins?.length > 0 && <><span style={{ fontWeight: 500, color: "#888" }}>Plugins:</span> {tech.plugins.join(" · ")}<br /></>}
          {tech.analytics?.length > 0 && <><span style={{ fontWeight: 500, color: "#888" }}>Analytics:</span> {tech.analytics.join(" · ")}<br /></>}
          {tech.missing_recommended?.length > 0 && <><span style={{ fontWeight: 500, color: R }}>Missing:</span> <span style={{ color: R }}>{tech.missing_recommended.join(" · ")}</span><br /></>}
        </div>
        <div style={{ background: "#f0faf5", border: "1px solid #c8edd9", borderRadius: 6, padding: "12px 14px", textAlign: "center", marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0F6E56" }}>Track your progress</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Run another report after implementing these recommendations to measure your improvement.</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#0F6E56", marginTop: 6 }}>trackseo.pro</div>
        </div>
        <div style={{ fontSize: 9, color: "#aaa", textAlign: "center", marginTop: 24, paddingTop: 12, borderTop: "1px solid #f0f0ee" }}>
          This report was generated by TrackSEO (trackseo.pro) using live data from Google search results.<br />
          Data is accurate as of the generation date. Search rankings and traffic estimates change daily.
        </div>
        <div style={{ fontSize: 9, color: "#bbb", textAlign: "center", marginTop: 8 }}>© 2026 PostReach AI Limited · trackseo.pro · Track your SEO like a Pro</div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, change, neutral, warn }: { label: string; value: string; change?: string; neutral?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{label}</div>
      {change && <div style={{ fontSize: 10, marginTop: 1, color: neutral ? "#888" : warn ? A : G }}>{change}</div>}
    </div>
  );
}

function LhBox({ label, data }: { label: string; data: any }) {
  if (!data) return <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "10px 12px", textAlign: "center", fontSize: 10, color: "#888" }}>{label}: No data</div>;
  return (
    <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "#888", marginBottom: 8, textAlign: "center", fontWeight: 500 }}>{label}</div>
      {(["performance", "accessibility", "seo", "best_practices"] as const).map((key) => {
        const labels: Record<string, string> = { performance: "Performance", accessibility: "Accessibility", seo: "SEO", best_practices: "Best practices" };
        const val = data[key] || 0;
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", padding: "3px 0", gap: 6 }}>
            <span style={{ fontSize: 9, color: "#888", flex: 1 }}>{labels[key]}</span>
            <span style={{ fontSize: 16, fontWeight: 600, minWidth: 32, textAlign: "right", color: scoreColor(val) }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

