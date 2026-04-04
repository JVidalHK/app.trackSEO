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
function fmtSize(kb: number) { return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`; }

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
        {"Track"}<span style={{ color: "#2563EB" }}>{"SEO"}</span>
        {!domain && <span style={{ fontSize: 10, color: "#888", fontWeight: 400, marginLeft: 6 }}>SEO Audit Report</span>}
      </div>
      <div style={{ fontSize: 10, color: "#888" }}>{domain || ""}{domain ? " · " : ""}{pageNum} / {totalPages}</div>
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
  return <div style={{ fontSize: 13, fontWeight: 600, margin: "18px 0 8px", paddingBottom: 5, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 6 }}>{children}</div>;
}

function PosPill({ pos }: { pos: number }) {
  const [bg, c] = pos <= 3 ? [GB, GD] : pos <= 10 ? [IB, ID] : pos <= 20 ? [AB, AD] : [RB, RD];
  return <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, fontWeight: 500, background: bg, color: c }}>{pos}</span>;
}

function KdPill({ kd }: { kd: number }) {
  const [bg, c] = kd < 30 ? [GB, GD] : kd < 60 ? [AB, AD] : [RB, RD];
  return <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, fontWeight: 500, background: bg, color: c }}>{kd}</span>;
}

function StatusSvg({ status }: { status: string }) {
  if (status === "pass") return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={G} strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke={G} strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>;
  if (status === "warn") return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={A} strokeWidth="1.5" /><rect x="7.2" y="4.5" width="1.6" height="4" rx="0.8" fill={A} /><circle cx="8" cy="10.5" r="0.7" fill={A} /></svg>;
  return <svg width="10" height="10" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke={R} strokeWidth="1.5" /><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke={R} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const th: React.CSSProperties = { textAlign: "left", fontWeight: 500, color: "#888", padding: "5px 4px", borderBottom: "1px solid #eee", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 };
const td: React.CSSProperties = { padding: "5px 4px", borderBottom: "1px solid #f5f5f3", fontSize: 10 };
const pageStyle: React.CSSProperties = { background: "#fff", padding: "36px 40px", position: "relative", minHeight: 780, maxWidth: 620, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a1a", pageBreakAfter: "always" };

export function PdfReport({ data, domain, date, market }: PdfReportProps) {
  const scores = data?.scores || {};
  const overview = data?.overview || {};
  const kws = data?.keywords?.items?.slice(0, 10) || [];
  const actions = data?.action_plan || [];
  const contentRoadmap = data?.content_roadmap || [];
  const kwOpps = data?.keyword_opportunities?.slice(0, 8) || [];
  const pageMapping = data?.page_keyword_mapping?.slice(0, 8) || [];
  const ai = data?.ai_visibility || {};
  const factors = ai.factors || {};
  const lh = data?.lighthouse || {};
  const cwv = data?.core_web_vitals || {};
  const checklist = data?.audit_checklist || [];
  const imageAudit = data?.image_audit || {};
  const techEnriched = data?.tech_stack_enriched || {};
  const techCats = techEnriched.categories || data?.tech_stack || {};
  const perfIssues = (data?.tech_performance_issues || []).filter((i: any) => i.status === "issue");
  const speedEst = data?.tech_speed_estimate;
  const linkSuggestions = data?.internal_linking_suggestions || [];
  const competitors = data?.competitors || [];
  const bl = data?.backlinks || {};
  const pages = data?.pages?.slice(0, 8) || [];
  const overall = scores.overall || 0;
  const aiScore = ai.readiness_score ?? scores.ai_readiness ?? 0;
  const failCount = checklist.filter((c: any) => c.status === "fail").length;
  const warnCount = checklist.filter((c: any) => c.status === "warn").length;
  const quickWins = actions.filter((a: any) => a.priority === "high").length;
  const cms = techCats.cms?.[0] || "";
  const platform = techEnriched.platform || "";
  const countryInfo = market?.primary_country_name || "";
  const reportShortId = data?.reportId?.slice(0, 8)?.toUpperCase() || "RPT";
  const totalPages = 5;

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a1a" }}>

      {/* ═══ PAGE 1: OVERVIEW + KEYWORDS ═══ */}
      <div style={pageStyle}>
        <LogoBar pageNum={1} totalPages={totalPages} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "16px 0 14px" }}>
          <PdfScoreRing score={overall} size={84} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 3 }}>{domain}</div>
            <div style={{ fontSize: 10, color: "#777", lineHeight: 1.6 }}>
              {date}{countryInfo ? ` · ${countryInfo}` : ""}{platform && platform !== "unknown" ? ` · ${platform}` : cms ? ` · ${cms}` : ""}
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
              <Pill bg={overall >= 80 ? GB : overall >= 50 ? AB : RB} color={overall >= 80 ? GD : overall >= 50 ? AD : RD}>{overall >= 80 ? "Good health" : overall >= 50 ? "Needs attention" : "Poor health"}</Pill>
              {(failCount + warnCount) > 0 && <Pill bg={AB} color={AD}>{failCount + warnCount} issues</Pill>}
              {quickWins > 0 && <Pill bg={GB} color={GD}>{quickWins} quick wins</Pill>}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, margin: "12px 0" }}>
          <MetricBox label="Organic traffic" value={fmt(overview.organic_traffic)} change={overview.traffic_change_pct ? `${overview.traffic_change_pct > 0 ? "+" : ""}${overview.traffic_change_pct}%` : undefined} />
          <MetricBox label="Keywords" value={fmt(overview.total_keywords)} />
          <MetricBox label="DA / PA" value={`${overview.domain_authority || 0} / ${overview.page_authority || 0}`} />
          <MetricBox label="Speed (mobile)" value={String(scores.performance_mobile || 0)} change={scores.performance_mobile >= 90 ? "Great" : scores.performance_mobile >= 50 ? "Needs work" : "Poor"} warn={scores.performance_mobile < 90} />
        </div>

        {/* Top Keywords */}
        <SectionTitle>Top ranking keywords</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Keyword</th><th style={th}>Pos</th><th style={th}>Monthly searches</th><th style={th}>Your traffic</th><th style={th}>Intent</th></tr></thead>
          <tbody>
            {kws.map((kw: any, i: number) => (
              <tr key={i}><td style={{ ...td, fontWeight: 500 }}>{kw.keyword}</td><td style={td}><PosPill pos={kw.position || 0} /></td><td style={td}>{fmt(kw.volume)}</td><td style={td}>{fmt(kw.traffic)}</td><td style={{ ...td, color: "#888", textTransform: "capitalize" }}>{kw.intent || "—"}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 9, color: "#aaa", marginTop: 3 }}>Showing top {kws.length} of {fmt(data?.keywords?.total)} keywords</div>

        {/* Keyword Opportunities */}
        {kwOpps.length > 0 && (
          <>
            <SectionTitle>Keyword opportunities <Pill bg={GB} color={GD}>{kwOpps.length} gaps</Pill></SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Keyword gap</th><th style={th}>Volume</th><th style={th}>KD</th><th style={th}>Opp. score</th><th style={th}>Est. traffic</th></tr></thead>
              <tbody>
                {kwOpps.map((o: any, i: number) => (
                  <tr key={i}><td style={{ ...td, fontWeight: 500 }}>{o.keyword}</td><td style={td}>{fmt(o.volume)}</td><td style={td}><KdPill kd={o.difficulty || 0} /></td><td style={{ ...td, fontWeight: 500, color: (o.opportunity_score || 0) > 80 ? G : A }}>{o.opportunity_score}</td><td style={{ ...td, color: G, fontWeight: 500 }}>~{fmt(o.potential_traffic)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div style={{ position: "absolute", bottom: 14, right: 40, fontSize: 9, color: "#bbb" }}>Generated {date} · {reportShortId}</div>
      </div>

      {/* ═══ PAGE 2: AI ACTION PLAN + CONTENT ROADMAP ═══ */}
      <div style={pageStyle}>
        <LogoBar domain={domain} pageNum={2} totalPages={totalPages} />
        <SectionTitle>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.5 6.5L16 7.5L12 11.5L13 16L8 13.5L3 16L4 11.5L0 7.5L5.5 6.5L8 1Z" fill={A} /></svg>
          AI action plan
          {quickWins > 0 && <Pill bg={GB} color={GD}>{quickWins} quick wins</Pill>}
        </SectionTitle>
        {actions.map((a: any, i: number) => (
          <div key={i} style={{ padding: "7px 10px", border: "1px solid #eee", borderRadius: 6, marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, fontWeight: 500, background: a.priority === "high" ? GB : AB, color: a.priority === "high" ? GD : AD }}>{a.priority === "high" ? "High impact" : "Medium"}</span>
              <span style={{ fontSize: 11, fontWeight: 500, flex: 1 }}>{a.title}</span>
            </div>
            <div style={{ fontSize: 9, color: "#666", lineHeight: 1.5 }}>{a.description}</div>
            {a.expected_impact && <div style={{ fontSize: 9, color: G, fontWeight: 500, marginTop: 2 }}>{a.expected_impact}</div>}
          </div>
        ))}

        {/* Tech stack issues */}
        {perfIssues.length > 0 && (
          <>
            <SectionTitle>Tech stack issues <Pill bg={RB} color={RD}>{perfIssues.length} found</Pill></SectionTitle>
            {perfIssues.slice(0, 4).map((issue: any, i: number) => (
              <div key={i} style={{ padding: "7px 10px", border: "1px solid #eee", borderLeft: `3px solid ${issue.impact === "high" ? R : A}`, borderRadius: "0 6px 6px 0", marginBottom: 5 }}>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{issue.title}</div>
                <div style={{ fontSize: 9, color: "#666", lineHeight: 1.5, marginTop: 1 }}>{issue.description}</div>
                {issue.fix_instructions && <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}><strong>Fix:</strong> {issue.fix_instructions.slice(0, 150)}{issue.fix_instructions.length > 150 ? "..." : ""}</div>}
              </div>
            ))}
          </>
        )}

        {/* Content Roadmap */}
        {contentRoadmap.length > 0 && (
          <>
            <SectionTitle>Content roadmap <Pill bg={IB} color={ID}>{contentRoadmap.length} opportunities</Pill></SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Suggested content</th><th style={th}>Target keyword</th><th style={th}>Est. traffic</th></tr></thead>
              <tbody>
                {contentRoadmap.map((item: any, i: number) => (
                  <tr key={i}><td style={{ ...td, fontWeight: 500 }}>{item.title}<div style={{ fontSize: 8, color: "#888", marginTop: 1 }}>{item.word_count_recommendation ? `${item.word_count_recommendation}+ words` : ""} {item.content_type || ""}</div></td><td style={{ ...td, color: "#666" }}>{item.target_keyword}</td><td style={{ ...td, color: G, fontWeight: 500 }}>+{fmt(item.estimated_traffic_monthly)}/mo</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ═══ PAGE 3: AI VISIBILITY + TECHNICAL AUDIT ═══ */}
      <div style={pageStyle}>
        <LogoBar domain={domain} pageNum={3} totalPages={totalPages} />
        <SectionTitle>AI visibility</SectionTitle>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 14 }}>
          <PdfScoreRing score={aiScore} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 5 }}>AI readiness: {aiScore >= 80 ? "excellent" : aiScore >= 50 ? "moderate" : "needs work"}</div>
            {(["content_depth", "topical_authority", "eeat_signals", "structured_data", "qa_format", "entity_clarity"] as const).map((key) => {
              const labels: Record<string, string> = { content_depth: "Content depth", topical_authority: "Topical authority", eeat_signals: "E-E-A-T signals", structured_data: "Structured data", qa_format: "Q&A format", entity_clarity: "Entity clarity" };
              const val = factors[key] || 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 9 }}>
                  <span style={{ minWidth: 85, color: "#666" }}>{labels[key]}</span>
                  <div style={{ flex: 1, height: 4, background: "#f0f0ee", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${val}%`, background: scoreColor(val), borderRadius: 3 }} /></div>
                  <span style={{ minWidth: 20, textAlign: "right", fontWeight: 500, color: scoreColor(val) }}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Speed scores */}
        <SectionTitle>Page Speed scores</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <LhBox label="Mobile (used for rankings)" data={lh.mobile} />
          <LhBox label="Desktop" data={lh.desktop} />
        </div>

        {/* Core Web Vitals */}
        <SectionTitle>Core Web Vitals (mobile)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          <CwvBox label="LCP" value={cwv.lcp_ms ? `${(cwv.lcp_ms / 1000).toFixed(1)}s` : "—"} good={cwv.lcp_ms < 2500} />
          <CwvBox label="FID" value={cwv.fid_ms ? `${cwv.fid_ms}ms` : "—"} good={cwv.fid_ms < 100} />
          <CwvBox label="CLS" value={cwv.cls != null ? String(cwv.cls) : "—"} good={cwv.cls < 0.1} />
          <CwvBox label="TTFB" value={cwv.ttfb_ms ? `${cwv.ttfb_ms}ms` : "—"} good={cwv.ttfb_ms < 800} />
        </div>

        {/* Audit checklist */}
        <SectionTitle>
          Audit checklist
          <Pill bg={GB} color={GD}>{checklist.filter((c: any) => c.status === "pass").length} pass</Pill>
          {warnCount > 0 && <Pill bg={AB} color={AD}>{warnCount} warn</Pill>}
          {failCount > 0 && <Pill bg={RB} color={RD}>{failCount} errors</Pill>}
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          {checklist.slice(0, 12).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, padding: "3px 0" }}><StatusSvg status={item.status} />{item.item}</div>
          ))}
        </div>

        {/* Speed gains estimate */}
        {speedEst && perfIssues.length > 0 && (
          <>
            <SectionTitle>Estimated speed gains</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              <MetricBox label="Current load time" value={`${(speedEst.current_load_time_ms / 1000).toFixed(1)}s`} warn />
              <MetricBox label="Projected" value={`${(speedEst.projected_load_time_ms / 1000).toFixed(1)}s`} change="after fixes" />
              <MetricBox label="Lighthouse est." value={String(speedEst.lighthouse_projected)} change={`+${speedEst.lighthouse_projected - speedEst.lighthouse_current} pts`} />
            </div>
          </>
        )}
      </div>

      {/* ═══ PAGE 4: PAGES + TECH STACK + IMAGES ═══ */}
      <div style={pageStyle}>
        <LogoBar domain={domain} pageNum={4} totalPages={totalPages} />

        {/* Page performance */}
        {pages.length > 0 && (
          <>
            <SectionTitle>Page performance <Pill bg="#f5f5f3" color="#888">{pages.length} pages</Pill></SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Page</th><th style={th}>Score</th><th style={th}>Load time</th><th style={th}>Size</th><th style={th}>Words</th></tr></thead>
              <tbody>
                {pages.map((p: any, i: number) => (
                  <tr key={i}><td style={{ ...td, color: "#2563EB", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.url}</td><td style={td}><span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, fontWeight: 500, background: p.seo_score >= 80 ? GB : p.seo_score >= 50 ? AB : RB, color: p.seo_score >= 80 ? GD : p.seo_score >= 50 ? AD : RD }}>{p.seo_score}</span></td><td style={td}>{p.load_time_ms ? `${(p.load_time_ms / 1000).toFixed(1)}s` : "—"}</td><td style={td}>{p.size_bytes ? (p.size_bytes > 1048576 ? `${(p.size_bytes / 1048576).toFixed(1)}MB` : `${Math.round(p.size_bytes / 1024)}KB`) : "—"}</td><td style={td}>{p.word_count || 0}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Page keyword mapping */}
        {pageMapping.length > 0 && (
          <>
            <SectionTitle>Page keyword mapping</SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Page</th><th style={th}>Keywords</th><th style={th}>Top keyword</th><th style={th}>In title?</th><th style={th}>Issue</th></tr></thead>
              <tbody>
                {pageMapping.map((m: any, i: number) => (
                  <tr key={i}><td style={{ ...td, color: "#2563EB" }}>{m.page}</td><td style={td}>{m.keyword_count}</td><td style={{ ...td, fontWeight: 500 }}>{m.top_keyword}</td><td style={td}>{m.in_title ? "✓" : "✗"}</td><td style={{ ...td, fontSize: 9, color: m.issue === "Well optimised" ? G : R }}>{m.issue}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Internal linking */}
        {linkSuggestions.length > 0 && (
          <>
            <SectionTitle>Internal linking opportunities <Pill bg={IB} color={ID}>{linkSuggestions.length} suggestions</Pill></SectionTitle>
            {linkSuggestions.slice(0, 3).map((link: any, i: number) => (
              <div key={i} style={{ fontSize: 10, padding: "5px 0", borderBottom: "1px solid #f5f5f3" }}>
                <span style={{ color: "#2563EB", fontWeight: 500 }}>{link.from_page}</span>
                <span style={{ color: "#888" }}> → </span>
                <span style={{ color: "#2563EB", fontWeight: 500 }}>{link.to_page}</span>
                <div style={{ fontSize: 9, color: "#888", marginTop: 1 }}>{link.reason}</div>
              </div>
            ))}
          </>
        )}

        {/* Tech stack */}
        <SectionTitle>Detected tech stack <Pill bg="#f5f5f3" color="#888">{techEnriched.detected_count || 0} detected</Pill></SectionTitle>
        <div style={{ fontSize: 10, lineHeight: 1.8, color: "#444" }}>
          {Object.entries(techCats).filter(([k, v]) => k !== "missing_recommended" && Array.isArray(v) && (v as string[]).length > 0).map(([cat, items]) => (
            <div key={cat}><span style={{ fontWeight: 500, color: "#888", textTransform: "capitalize" }}>{cat.replace(/_/g, " ")}:</span> {(items as string[]).join(" · ")}</div>
          ))}
          {techCats.missing_recommended?.length > 0 && (
            <div><span style={{ fontWeight: 500, color: R }}>Missing:</span> <span style={{ color: R }}>{techCats.missing_recommended.join(" · ")}</span></div>
          )}
        </div>

        {/* Image audit */}
        {(imageAudit.oversized_count > 0 || imageAudit.missing_alt_count > 0) && (
          <>
            <SectionTitle>Image SEO audit {imageAudit.missing_alt_count > 0 && <Pill bg={RB} color={RD}>{imageAudit.missing_alt_count} no alt</Pill>} {imageAudit.oversized_count > 0 && <Pill bg={AB} color={AD}>{imageAudit.oversized_count} oversized</Pill>}</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 9 }}>
              {imageAudit.oversized_count > 0 && (
                <div>
                  <div style={{ fontWeight: 500, color: "#888", marginBottom: 3 }}>Oversized images</div>
                  {(imageAudit.oversized || []).slice(0, 4).map((img: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #f5f5f3" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{img.url?.split("/").pop()}</span>
                      <span style={{ color: R, fontWeight: 500 }}>{fmtSize(img.size_kb)}</span>
                    </div>
                  ))}
                  {imageAudit.total_savings_kb > 0 && <div style={{ color: G, marginTop: 2 }}>Potential savings: ~{fmtSize(imageAudit.total_savings_kb)}</div>}
                </div>
              )}
              {imageAudit.missing_alt_count > 0 && (
                <div>
                  <div style={{ fontWeight: 500, color: "#888", marginBottom: 3 }}>Missing alt text</div>
                  {(imageAudit.missing_alt || []).slice(0, 4).map((img: any, i: number) => (
                    <div key={i} style={{ padding: "2px 0", borderBottom: "1px solid #f5f5f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.url?.split("/").pop() || img.url}</div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══ PAGE 5: COMPETITORS + BACKLINKS + CTA ═══ */}
      <div style={{ ...pageStyle, pageBreakAfter: undefined }}>
        <LogoBar domain={domain} pageNum={5} totalPages={totalPages} />
        <SectionTitle>Competitor comparison</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Website</th><th style={th}>Traffic</th><th style={th}>Keywords</th><th style={th}>Overlap</th><th style={th}>Avg Pos</th></tr></thead>
          <tbody>
            <tr style={{ fontWeight: 500, background: "#f0faf5" }}><td style={{ ...td, color: "#0F6E56" }}>{domain} (you)</td><td style={td}>{fmt(overview.organic_traffic)}</td><td style={td}>{fmt(overview.total_keywords)}</td><td style={td}>—</td><td style={td}>—</td></tr>
            {competitors.slice(0, 5).map((c: any, i: number) => (
              <tr key={i}><td style={td}>{c.domain}</td><td style={td}>{fmt(c.traffic)}</td><td style={td}>{fmt(c.keywords)}</td><td style={td}>{c.overlap_pct || 0}%</td><td style={td}>{c.avg_position || "—"}</td></tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>Backlink profile</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          <MetricBox label="Domain Authority" value={String(bl.domain_authority || 0)} change="/100" neutral />
          <MetricBox label="Total backlinks" value={bl.total ? fmt(bl.total) : "N/A"} />
          <MetricBox label="Referring domains" value={bl.referring_domains ? fmt(bl.referring_domains) : "N/A"} />
          <MetricBox label="Dofollow ratio" value={bl.dofollow_ratio ? `${bl.dofollow_ratio}%` : "N/A"} />
        </div>

        {/* CTA */}
        <div style={{ background: "#f0faf5", border: "1px solid #c8edd9", borderRadius: 6, padding: "14px", textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F6E56" }}>Track your progress over time</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 3, lineHeight: 1.5 }}>Implement the recommendations in this report, then run another audit to measure your improvement. Most changes take 2-4 weeks to show results in Google.</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#0F6E56", marginTop: 8 }}>trackseo.pro</div>
        </div>

        <div style={{ fontSize: 9, color: "#aaa", textAlign: "center", marginTop: 20, paddingTop: 10, borderTop: "1px solid #f0f0ee" }}>
          This report was generated by TrackSEO (trackseo.pro) using live data from Google search results.<br />
          Data is accurate as of the generation date. Search rankings and traffic estimates change daily.
        </div>
        <div style={{ fontSize: 9, color: "#bbb", textAlign: "center", marginTop: 6 }}>© 2026 PostReach AI Limited · trackseo.pro · Track your SEO like a Pro</div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, change, neutral, warn }: { label: string; value: string; change?: string; neutral?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{label}</div>
      {change && <div style={{ fontSize: 9, marginTop: 1, color: neutral ? "#888" : warn ? A : G }}>{change}</div>}
    </div>
  );
}

function LhBox({ label, data }: { label: string; data: any }) {
  if (!data) return <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "10px 12px", textAlign: "center", fontSize: 10, color: "#888" }}>{label}: No data</div>;
  return (
    <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 9, color: "#888", marginBottom: 6, textAlign: "center", fontWeight: 500 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {(["performance", "accessibility", "seo", "best_practices"] as const).map((key) => {
          const labels: Record<string, string> = { performance: "Performance", accessibility: "Accessibility", seo: "SEO", best_practices: "Best practices" };
          const val = data[key] || 0;
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "#888" }}>{labels[key]}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: scoreColor(val) }}>{val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CwvBox({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div style={{ background: "#f8f8f6", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 8, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: good ? G : A, marginTop: 1 }}>{value}</div>
    </div>
  );
}
