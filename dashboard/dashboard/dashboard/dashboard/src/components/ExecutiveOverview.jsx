import {
  findingsByLevel,
  guestInventory,
  unknownTenants,
  complianceControls,
  tenants,
  SEVERITY_COLORS,
  SEVERITY_ORDER,
  TENANT_KEYS,
} from '../data/audit-data';
import { RiskBadge } from './SeverityBadge';

/* ── Donut chart (SVG) ──────────────────────────────────── */
function SeverityDonut() {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const data = SEVERITY_ORDER.map((sev) => ({
    label: sev,
    value: findingsByLevel[sev],
    color: SEVERITY_COLORS[sev],
  }));
  const total = findingsByLevel.total;

  let cumulative = 0;
  const arcs = data.map((d) => {
    const pct = d.value / total;
    const offset = cumulative;
    cumulative += pct;
    return { ...d, pct, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="18"
              strokeDasharray={`${arc.pct * circumference} ${circumference}`}
              strokeDashoffset={-arc.offset * circumference}
              strokeLinecap="butt"
              className="transition-all duration-700"
              transform="rotate(-90 70 70)"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400">Findings</span>
        </div>
      </div>
      {/* Legend */}
      <div className="space-y-1.5">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: arc.color }}
            />
            <span className="capitalize text-slate-300">{arc.label}</span>
            <span className="font-bold text-white">{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
function StatCard({ value, label, accent, sub }) {
  return (
    <div className="card flex flex-col">
      <p className="stat-big" style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ── Tenant mini-card ───────────────────────────────────── */
function TenantCard({ tenant }) {
  return (
    <div
      className="card group cursor-default transition-all hover:border-slate-600"
      style={{ borderLeftWidth: '3px', borderLeftColor: tenant.color }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-white">{tenant.key}</p>
          <p className="text-xs text-slate-400">{tenant.name}</p>
        </div>
        <RiskBadge risk={tenant.risk} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span>{tenant.role}</span>
        <span className="text-slate-600">·</span>
        <span>{tenant.locations} locations</span>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function ExecutiveOverview() {
  const compliancePassed = complianceControls.filter((c) =>
    TENANT_KEYS.every((t) => c[t] === true),
  ).length;
  const compliancePct = Math.round((compliancePassed / complianceControls.length) * 100);

  return (
    <section id="overview" className="space-y-8">
      {/* Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-bold text-amber-300">
              Phase 1 Audit Complete — Gate G1 Review Required
            </p>
            <p className="mt-0.5 text-sm text-amber-200/60">
              7-domain audit across 5 tenants finalized. Tyler + Dustin sign-off needed before Phase 2.
            </p>
          </div>
        </div>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          value={findingsByLevel.total}
          label="Total Findings"
          accent="#ef4444"
          sub={`${findingsByLevel.critical} critical · ${findingsByLevel.high} high`}
        />
        <StatCard
          value={guestInventory.totals.total.toLocaleString()}
          label="Guest Accounts"
          accent="#f97316"
          sub={`${guestInventory.totals.stale90d} stale · ${guestInventory.totals.neverSignedIn} never signed in`}
        />
        <StatCard
          value={unknownTenants.length}
          label="Unknown Tenants"
          accent="#eab308"
          sub={`${unknownTenants.filter((t) => t.priority === 'critical').length} critical priority`}
        />
        <StatCard
          value={`${compliancePct}%`}
          label="Baseline Compliance"
          accent={compliancePct > 30 ? '#22c55e' : '#ef4444'}
          sub={`${compliancePassed} of ${complianceControls.length} controls met`}
        />
      </div>

      {/* Donut + tenant cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <p className="card-header">Severity Distribution</p>
          <SeverityDonut />
        </div>
        <div className="card">
          <p className="card-header">Tenant Risk Overview</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {tenants.map((t) => (
              <TenantCard key={t.key} tenant={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
