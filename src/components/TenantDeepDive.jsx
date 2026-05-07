import { useState } from 'react';
import {
  tenants,
  findingsByTenant,
  guestInventory,
  complianceControls,
  unknownTenants,
  SEVERITY_COLORS,
  SEVERITY_ORDER,
  TENANT_KEYS,
} from '../data/audit-data';
import BarChart from './BarChart';
import { RiskBadge } from './SeverityBadge';

/* ── Mini stat ──────────────────────────────────────────── */
function MiniStat({ label, value, accent }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

/* ── Control checklist ──────────────────────────────────── */
function ControlChecklist({ tenantKey }) {
  const passing = complianceControls.filter((c) => c[tenantKey]);
  const failing = complianceControls.filter((c) => !c[tenantKey]);
  const pct = Math.round((passing.length / complianceControls.length) * 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Compliance Controls
        </p>
        <span className={`text-sm font-bold ${pct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
          {pct}% ({passing.length}/{complianceControls.length})
        </span>
      </div>
      <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
        {complianceControls.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c[tenantKey] ? (
              <span className="text-green-400">✓</span>
            ) : (
              <span className="text-red-400">✗</span>
            )}
            <span className={c[tenantKey] ? 'text-slate-400' : 'text-slate-300'}>
              {c.control}
            </span>
            {c.phase !== 'done' && !c[tenantKey] && (
              <span className="ml-auto shrink-0 text-[10px] text-slate-600">
                Phase {c.phase}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Single tenant panel ────────────────────────────────── */
function TenantPanel({ tenant }) {
  const findings = findingsByTenant[tenant.key];
  const guests = guestInventory[tenant.key];
  const unknowns = unknownTenants.filter((u) => u.foundIn.includes(tenant.key));

  const findingSegments = SEVERITY_ORDER.map((sev) => ({
    value: findings[sev] ?? 0,
    color: SEVERITY_COLORS[sev],
    label: sev,
  }));

  const guestSegments = [
    { value: guests.neverSignedIn, color: '#ef4444', label: 'Never Signed In' },
    { value: guests.stale90d, color: '#f97316', label: 'Stale >90d' },
    { value: guests.pending, color: '#eab308', label: 'Pending' },
    { value: Math.max(0, guests.total - guests.neverSignedIn - guests.stale90d - guests.pending), color: '#22c55e', label: 'Active' },
  ];

  return (
    <div
      className="space-y-5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-6"
      style={{ borderTopWidth: '3px', borderTopColor: tenant.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{tenant.name}</h3>
          <p className="text-xs text-slate-400">{tenant.role} · {tenant.domain}</p>
        </div>
        <RiskBadge risk={tenant.risk} />
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-5 gap-2 rounded-lg bg-slate-900/50 p-3">
        <MiniStat label="Findings" value={findings.total} accent="#ef4444" />
        <MiniStat label="Guests" value={guests.total} accent="#f97316" />
        <MiniStat label="Stale" value={guests.stale90d} accent="#eab308" />
        <MiniStat label="Never In" value={guests.neverSignedIn} accent="#f97316" />
        <MiniStat label="Unknown Tnts" value={unknowns.length} accent="#eab308" />
      </div>

      {/* Findings bar */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Finding Breakdown</p>
        <BarChart segments={findingSegments} height="h-5" />
        <div className="mt-1.5 flex gap-3 text-[10px] text-slate-500">
          {SEVERITY_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: SEVERITY_COLORS[s] }} />
              {s}: {findings[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Guest bar */}
      {guests.total > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Guest Status</p>
          <BarChart segments={guestSegments} height="h-5" />
          <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-slate-500">
            {guestSegments.map((s) => (
              <span key={s.label} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}: {s.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <ControlChecklist tenantKey={tenant.key} />

      {/* Unknown tenants */}
      {unknowns.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Unknown Tenant Connections
          </p>
          <div className="space-y-1.5">
            {unknowns.map((u) => (
              <div
                key={u.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  u.priority === 'critical'
                    ? 'bg-red-500/10 text-red-300'
                    : u.priority === 'high'
                    ? 'bg-orange-500/10 text-orange-300'
                    : 'bg-slate-700/30 text-slate-400'
                }`}
              >
                <span className="font-mono">{u.id.slice(0, 8)}…</span>
                <span className="ml-2">{u.description.slice(0, 80)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function TenantDeepDive() {
  const [activeTab, setActiveTab] = useState('HTT');

  return (
    <section id="tenants" className="space-y-6">
      <h2 className="section-title">Tenant Deep Dives</h2>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-900/50 p-1">
        {tenants.map((t) => (
          <button
        type="button"
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={activeTab === t.key ? { borderBottom: `2px solid ${t.color}` } : {}}
          >
            {t.key}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <TenantPanel tenant={tenants.find((t) => t.key === activeTab)} />
    </section>
  );
}
