import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight, ArrowRight, Lock, Unlock, Users, Key, Database, Globe, Layers, Server, Eye } from "lucide-react";

const TENANTS = [
  { id: "htt", name: "HTT Brands", domain: "httbrands.com", role: "Hub", color: "#500711", locations: "HQ", tenantId: "0c0e35dc-...", mto: "Owner" },
  { id: "bcc", name: "Bishops", domain: "bishops.co", role: "Spoke", color: "#E87722", locations: "~40", tenantId: "b5380912-...", mto: "Member" },
  { id: "fn", name: "Frenchies", domain: "frenchiesnails.com", role: "Spoke", color: "#1B3A5C", locations: "~20", tenantId: "98723287-...", mto: "Not joined" },
  { id: "tll", name: "The Lash Lounge", domain: "thelashlounge.com", role: "Spoke", color: "#6B3FA0", locations: "~140", tenantId: "3c7d2bf3-...", mto: "Not joined" },
  { id: "dce", name: "Delta Crown", domain: "deltacrown.com", role: "Spoke", color: "#C4A265", locations: "Pre-launch", tenantId: "ce62e17d-...", mto: "Not joined" },
];

const GAPS = [
  { id: "GAP-1", severity: "critical", title: "Default policy allows inbound B2B from any tenant", area: "Cross-Tenant Policy", impact: "Any M365 tenant worldwide can collaborate into HTT", remediation: "Set-DenyByDefault.ps1", phase: "Weeks 1-2" },
  { id: "GAP-2", severity: "critical", title: "TLL partner policy is unscoped (All Apps / All Users)", area: "Cross-Tenant Policy", impact: "TLL guests have access to all HTT applications, not just SP/Fabric", remediation: "Scope to SharePoint Online + SG", phase: "Weeks 1-2" },
  { id: "GAP-3", severity: "high", title: "B2B Conditional Access in report-only mode", area: "Conditional Access", impact: "External MFA not enforced — relies on partner trust only", remediation: "Switch CA policy to Enforce", phase: "Weeks 1-2" },
  { id: "GAP-4", severity: "medium", title: "Frenchies & Delta Crown spoke-side auto-redemption missing", area: "Auto-Redemption", impact: "Users see consent prompts on first access", remediation: "Admin templates exist in Convention-Page-Build", phase: "Weeks 3-6" },
  { id: "GAP-5", severity: "medium", title: "No active guest lifecycle governance", area: "Identity Governance", impact: "Stale guest accounts accumulate with no review", remediation: "CTU Phase 4 — access reviews", phase: "Weeks 3-6" },
  { id: "GAP-6", severity: "medium", title: "15+ unknown system accounts in HTT HQ SharePoint", area: "SharePoint", impact: "Unidentified access to sensitive document libraries", remediation: "sharepointagent audit tools", phase: "Weeks 3-6" },
  { id: "GAP-7", severity: "medium", title: "UserType mapping: synced users arrive as Guest", area: "Cross-Tenant Sync", impact: "Synced users treated as external in directory views", remediation: "Fix-SyncUserTypeMapping.ps1", phase: "Weeks 3-6" },
  { id: "GAP-8", severity: "low", title: "Teams federation likely open (not allowlist)", area: "Teams Federation", impact: "Any Teams tenant can chat/call into HTT", remediation: "Set-TeamsFederationAllowlist.ps1", phase: "Weeks 3-6" },
];

const PROJECTS = [
  { id: "ctu", name: "Cross-Tenant Utility", status: "Ready (not run)", patterns: ["Audit", "Remediation", "Monitoring"], color: "#2563eb" },
  { id: "convention", name: "Homecoming 2026", status: "Production Live", patterns: ["B2B Invite", "Domain Groups", "Auto-Redeem", "MFA Trust"], color: "#500711" },
  { id: "bi", name: "BI / Fabric Access", status: "Production Live", patterns: ["B2B Sync", "Domain Group", "Auto-License", "RLS/SQL"], color: "#059669" },
  { id: "fac", name: "FAC Cohorts (Wiggum)", status: "Phases 0-4 Done", patterns: ["Custom Attributes", "Attribute Groups", "Service Principal"], color: "#6B3FA0" },
  { id: "sp", name: "HTT HQ SharePoint", status: "Audit Complete", patterns: ["Permission Audit", "Page Management", "Brand System"], color: "#dc2626" },
];

const GROUPS_HTT = [
  { name: "SG-Homecoming-HTT-Dynamic", type: "Domain", members: 75, project: "Convention", persistent: false },
  { name: "SG-Homecoming-Bishops-Dynamic", type: "Domain", members: 12, project: "Convention", persistent: false },
  { name: "SG-Homecoming-Frenchies-Dynamic", type: "Domain", members: 21, project: "Convention", persistent: false },
  { name: "SG-Homecoming-LashLounge-Dynamic", type: "Domain", members: 218, project: "Convention", persistent: false },
  { name: "SG-Homecoming-Delta-Dynamic", type: "Domain", members: 1, project: "Convention", persistent: false },
  { name: "TLL-Franchisee-Dynamic", type: "Domain", members: 210, project: "BI Support", persistent: true },
];

const GROUPS_TLL = [
  { name: "FAC-Group-1 (Landry)", type: "Attribute", members: 20, project: "Wiggum", persistent: true },
  { name: "FAC-Group-2 (Larson)", type: "Attribute", members: 20, project: "Wiggum", persistent: true },
  { name: "FAC-Group-3 (Otero)", type: "Attribute", members: 20, project: "Wiggum", persistent: true },
  { name: "FAC-Group-4 (Jania)", type: "Attribute", members: 21, project: "Wiggum", persistent: true },
  { name: "FAC-Group-5 (Lewis-Lodhi)", type: "Attribute", members: 18, project: "Wiggum", persistent: true },
  { name: "FAC-Reps", type: "Attribute", members: 5, project: "Wiggum", persistent: true },
  { name: "FAC-AllOwners", type: "Attribute", members: 101, project: "Wiggum", persistent: true },
  { name: "TLL PBI Franchise Access", type: "Static (mail-enabled)", members: 200, project: "BI Support", persistent: true },
];

const severityColor = (s) => ({ critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#65a30d" }[s]);
const severityBg = (s) => ({ critical: "#fef2f2", high: "#fff7ed", medium: "#fffbeb", low: "#f7fee7" }[s]);

function SeverityBadge({ severity }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: severityBg(severity), color: severityColor(severity), border: `1px solid ${severityColor(severity)}33` }}>
      {severity === "critical" ? <XCircle size={12} /> : severity === "high" ? <AlertTriangle size={12} /> : <Eye size={12} />}
      {severity}
    </span>
  );
}

function StatusDot({ status }) {
  const c = status.includes("Live") ? "#059669" : status.includes("Done") ? "#2563eb" : status.includes("Complete") ? "#d97706" : "#6b7280";
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: c, marginRight: 6 }} />;
}

function Card({ children, style, ...props }) {
  return <div style={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", padding: 16, ...style }} {...props}>{children}</div>;
}

function TenantTopology() {
  return (
    <Card>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#111" }}>Tenant Topology</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TENANTS.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 6, backgroundColor: t.role === "Hub" ? "#fef3f2" : "#f9fafb", border: `1px solid ${t.role === "Hub" ? "#fecaca" : "#e5e7eb"}` }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: t.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{t.domain} — {t.locations} locations</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: t.role === "Hub" ? "#991b1b" : "#4b5563", backgroundColor: t.role === "Hub" ? "#fee2e2" : "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{t.role}</div>
              <div style={{ fontSize: 10, color: t.mto === "Owner" || t.mto === "Member" ? "#059669" : "#d97706", marginTop: 2 }}>MTO: {t.mto}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PartnerPolicyMatrix() {
  const fields = [
    { key: "b2bScope", label: "B2B Collab Scope" },
    { key: "autoRedeem", label: "Auto-Redeem (Both)" },
    { key: "mfaTrust", label: "MFA Trust" },
    { key: "identitySync", label: "Identity Sync" },
    { key: "mto", label: "MTO Member" },
  ];
  const data = {
    bcc: { b2bScope: "scoped", autoRedeem: true, mfaTrust: true, identitySync: true, mto: true },
    fn: { b2bScope: "scoped", autoRedeem: false, mfaTrust: true, identitySync: false, mto: false },
    tll: { b2bScope: "open", autoRedeem: true, mfaTrust: true, identitySync: true, mto: false },
    dce: { b2bScope: "scoped", autoRedeem: false, mfaTrust: true, identitySync: false, mto: false },
  };
  const spokes = TENANTS.filter((t) => t.role === "Spoke");
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#111" }}>Partner Policy Matrix (Hub-Side)</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 500 }}>Setting</th>
              {spokes.map((t) => <th key={t.id} style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600, color: t.color }}>{t.name.split(" ")[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.key} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "6px 8px", fontWeight: 500, color: "#374151" }}>{f.label}</td>
                {spokes.map((t) => {
                  const v = data[t.id][f.key];
                  const isGap = (f.key === "b2bScope" && v === "open") || (f.key === "autoRedeem" && !v) || (f.key === "identitySync" && !v) || (f.key === "mto" && !v);
                  return (
                    <td key={t.id} style={{ textAlign: "center", padding: "6px 8px" }}>
                      {typeof v === "boolean" ? (
                        v ? <CheckCircle size={14} color="#059669" /> : <XCircle size={14} color={isGap ? "#dc2626" : "#9ca3af"} />
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4, backgroundColor: v === "open" ? "#fef2f2" : "#f0fdf4", color: v === "open" ? "#dc2626" : "#059669" }}>
                          {v === "open" ? "ALL APPS" : "Scoped"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, padding: "8px 10px", backgroundColor: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca", fontSize: 11, color: "#991b1b" }}>
        <strong>Default policy:</strong> Inbound B2B Collab + Direct Connect = All Apps / All Users (OPEN to any tenant worldwide)
      </div>
    </Card>
  );
}

function GapList() {
  const [expanded, setExpanded] = useState(null);
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#111" }}>
        <Shield size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Security Gap Analysis ({GAPS.length} findings)
      </h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["critical", "high", "medium", "low"].map((s) => {
          const count = GAPS.filter((g) => g.severity === s).length;
          return count > 0 ? (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, backgroundColor: severityBg(s), color: severityColor(s) }}>
              {count} {s}
            </span>
          ) : null;
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {GAPS.map((g) => (
          <div key={g.id} style={{ borderRadius: 6, border: `1px solid ${severityColor(g.severity)}22`, backgroundColor: expanded === g.id ? severityBg(g.severity) : "#fff", cursor: "pointer", transition: "background-color 0.15s" }}
            onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
              {expanded === g.id ? <ChevronDown size={14} color="#6b7280" /> : <ChevronRight size={14} color="#6b7280" />}
              <SeverityBadge severity={g.severity} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#111", flex: 1 }}>{g.id}: {g.title}</span>
              <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>{g.phase}</span>
            </div>
            {expanded === g.id && (
              <div style={{ padding: "0 10px 10px 36px", fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                <div><strong>Area:</strong> {g.area}</div>
                <div><strong>Impact:</strong> {g.impact}</div>
                <div><strong>Remediation:</strong> <code style={{ fontSize: 11, backgroundColor: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>{g.remediation}</code></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProjectOverview() {
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#111" }}>
        <Layers size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Active Projects Touching Identity
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PROJECTS.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ width: 4, minHeight: 40, borderRadius: 2, backgroundColor: p.color, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{p.name}</span>
                <StatusDot status={p.status} />
                <span style={{ fontSize: 11, color: "#6b7280" }}>{p.status}</span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {p.patterns.map((pat) => (
                  <span key={pat} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, backgroundColor: "#f3f4f6", color: "#4b5563" }}>{pat}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GroupInventory() {
  const [showTenant, setShowTenant] = useState("htt");
  const groups = showTenant === "htt" ? GROUPS_HTT : GROUPS_TLL;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111" }}>
          <Users size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Dynamic Group Inventory
        </h3>
        <div style={{ display: "flex", gap: 4 }}>
          {[["htt", "HTT Hub"], ["tll", "TLL Spoke"]].map(([k, l]) => (
            <button key={k} onClick={() => setShowTenant(k)} style={{ fontSize: 11, fontWeight: showTenant === k ? 600 : 400, padding: "4px 10px", borderRadius: 4, border: "1px solid #d1d5db", backgroundColor: showTenant === k ? "#111" : "#fff", color: showTenant === k ? "#fff" : "#374151", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {groups.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, backgroundColor: "#f9fafb", border: "1px solid #f3f4f6" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{g.project} — {g.type}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", minWidth: 36, textAlign: "right" }}>{g.members}</span>
            <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, backgroundColor: g.persistent ? "#f0fdf4" : "#fef3c7", color: g.persistent ? "#059669" : "#92400e", fontWeight: 500 }}>{g.persistent ? "Persistent" : "Sunset"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Roadmap() {
  const phases = [
    { name: "Immediate", time: "Weeks 1–2", color: "#dc2626", items: ["Run CTU full audit", "Scope TLL partner policy", "Apply deny-by-default", "Enforce B2B CA policy"] },
    { name: "Short-Term", time: "Weeks 3–6", color: "#ea580c", items: ["Complete FN/DCE auto-redeem", "Fix userType mapping", "SP unknown accounts audit", "Teams federation allowlist"] },
    { name: "Medium-Term", time: "Weeks 7–12", color: "#2563eb", items: ["Persistent brand groups", "Migrate Fabric group", "HTT tenant attributes", "Evaluate MTO expansion"] },
    { name: "Long-Term", time: "Weeks 13–24", color: "#6B3FA0", items: ["Full user property audit", "Multi-tenant attributes", "Role-based groups", "HQ SP permission redesign"] },
  ];
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#111" }}>
        <ArrowRight size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Prioritized Roadmap
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {phases.map((p, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 12, paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: p.color }}>{p.name}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{p.time}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {p.items.map((item, j) => (
                <span key={j} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151" }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PatternDivergence() {
  const dims = [
    { label: "How users arrive", convention: "B2B invite", bi: "B2B sync", fac: "N/A (TLL-only)" },
    { label: "Grouping method", convention: "Domain match", bi: "Domain match", fac: "Attribute match" },
    { label: "Group tenant", convention: "HTT (hub)", bi: "HTT (hub)", fac: "TLL (spoke)" },
    { label: "Custom attributes", convention: "None", bi: "None", fac: "5 extension attrs" },
    { label: "Automation", convention: "GitHub Actions", bi: "GitHub Actions", fac: "Python (manual)" },
  ];
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#111" }}>
        <Key size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Identity Pattern Divergence
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 500, width: "28%" }}>Dimension</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600, color: "#500711" }}>Convention</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600, color: "#059669" }}>BI / Fabric</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600, color: "#6B3FA0" }}>FAC Cohorts</th>
          </tr>
        </thead>
        <tbody>
          {dims.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "6px 8px", fontWeight: 500, color: "#374151" }}>{d.label}</td>
              <td style={{ textAlign: "center", padding: "6px 8px", color: "#6b7280" }}>{d.convention}</td>
              <td style={{ textAlign: "center", padding: "6px 8px", color: "#6b7280" }}>{d.bi}</td>
              <td style={{ textAlign: "center", padding: "6px 8px", color: "#6b7280" }}>{d.fac}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function IdentityVision() {
  return (
    <Card style={{ border: "1px solid #c4b5fd", backgroundColor: "#faf5ff" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600, color: "#5b21b6" }}>
        <Globe size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Target: Unified Identity Architecture
      </h3>
      <p style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.6, margin: "0 0 12px" }}>
        One set of custom attributes per user drives access everywhere — Power BI, SharePoint, Teams, conventions, and every future platform. Domain groups gate brand-level access; attribute groups enable role, region, and location scoping.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { icon: <Lock size={14} />, title: "Deny-by-Default", desc: "Block all, whitelist partners" },
          { icon: <Users size={14} />, title: "Persistent Brand Groups", desc: "One per brand, reusable everywhere" },
          { icon: <Database size={14} />, title: "Custom Attributes", desc: "htt_role, htt_brand, htt_region, location_ids" },
          { icon: <Server size={14} />, title: "All Brands in MTO", desc: "Seamless identity across portfolio" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px", borderRadius: 6, backgroundColor: "#ede9fe" }}>
            <div style={{ color: "#6d28d9", marginTop: 2 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#4c1d95" }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#6d28d9" }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "security", label: "Security" },
    { id: "architecture", label: "Architecture" },
    { id: "roadmap", label: "Roadmap" },
  ];
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111" }}>HTT Brands — Cross-Tenant Identity Analysis</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>5 tenants — 200+ locations — 4 active cross-tenant implementations</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ fontSize: 13, fontWeight: tab === t.id ? 600 : 400, padding: "6px 14px", borderRadius: "6px 6px 0 0", border: "none", backgroundColor: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? "#111" : "#6b7280", cursor: "pointer", borderBottom: tab === t.id ? "2px solid #111" : "2px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <TenantTopology />
          <ProjectOverview />
          <div style={{ gridColumn: "1 / -1" }}><PartnerPolicyMatrix /></div>
          <div style={{ gridColumn: "1 / -1" }}><IdentityVision /></div>
        </div>
      )}

      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "Critical", count: GAPS.filter((g) => g.severity === "critical").length, color: "#dc2626", bg: "#fef2f2" },
              { label: "High", count: GAPS.filter((g) => g.severity === "high").length, color: "#ea580c", bg: "#fff7ed" },
              { label: "Medium", count: GAPS.filter((g) => g.severity === "medium").length, color: "#d97706", bg: "#fffbeb" },
              { label: "Low", count: GAPS.filter((g) => g.severity === "low").length, color: "#65a30d", bg: "#f7fee7" },
            ].map((s, i) => (
              <Card key={i} style={{ textAlign: "center", backgroundColor: s.bg, borderColor: `${s.color}22` }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <GapList />
        </div>
      )}

      {tab === "architecture" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PatternDivergence />
          <GroupInventory />
        </div>
      )}

      {tab === "roadmap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Roadmap />
          <IdentityVision />
        </div>
      )}
    </div>
  );
}
