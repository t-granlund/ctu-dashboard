import {
  guestInventory,
  tenants,
  tenantColor,
  TENANT_KEYS,
} from '../data/audit-data';
import BarChart from './BarChart';

/* ── Big stat card ──────────────────────────────────────── */
function BigStat({ value, label, accent, sub }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-extrabold" style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ── Per-tenant guest bars ──────────────────────────────── */
function TenantGuestBar({ tenantKey }) {
  const g = guestInventory[tenantKey];
  const active = Math.max(0, g.total - g.neverSignedIn - g.stale90d);
  const color = tenantColor(tenantKey);

  const segments = [
    { value: g.neverSignedIn, color: '#ef4444', label: 'Never signed in' },
    { value: g.stale90d,      color: '#f97316', label: 'Stale >90d' },
    { value: active,          color: '#22c55e', label: 'Active / recent' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {tenantKey}
      </span>
      <div className="flex-1">
        <BarChart segments={segments} height="h-6" />
      </div>
      <span className="w-14 text-right text-sm font-bold text-slate-200">
        {g.total}
      </span>
    </div>
  );
}

/* ── TLL callout ────────────────────────────────────────── */
function TLLCallout() {
  const tll = guestInventory.TLL;
  const neverPct = ((tll.neverSignedIn / tll.total) * 100).toFixed(1);
  const pendingPct = ((tll.pending / tll.total) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚨</span>
        <div>
          <p className="font-bold text-purple-300">
            TLL: {tll.total} guests — {neverPct}% never signed in
          </p>
          <p className="mt-1 text-sm text-purple-200/60">
            {tll.pending} ({pendingPct}%) in pending acceptance state. {tll.stale90d} stale beyond
            90 days. This is the largest single-tenant guest remediation target.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-purple-900/30 p-3 text-center">
          <p className="text-xl font-bold text-white">{tll.total}</p>
          <p className="text-[10px] uppercase text-purple-300">Total</p>
        </div>
        <div className="rounded-lg bg-red-900/30 p-3 text-center">
          <p className="text-xl font-bold text-red-400">{tll.neverSignedIn}</p>
          <p className="text-[10px] uppercase text-red-300">Never Signed In</p>
        </div>
        <div className="rounded-lg bg-orange-900/30 p-3 text-center">
          <p className="text-xl font-bold text-orange-400">{tll.stale90d}</p>
          <p className="text-[10px] uppercase text-orange-300">Stale &gt;90d</p>
        </div>
        <div className="rounded-lg bg-yellow-900/30 p-3 text-center">
          <p className="text-xl font-bold text-yellow-400">{tll.pending}</p>
          <p className="text-[10px] uppercase text-yellow-300">Pending</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function GuestInventory() {
  const t = guestInventory.totals;

  return (
    <section id="guests" className="space-y-8">
      <h2 className="section-title">Guest Inventory</h2>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <BigStat value={t.total} label="Total Guests" accent="#f97316" />
        <BigStat value={t.neverSignedIn} label="Never Signed In" accent="#ef4444" sub={`${((t.neverSignedIn / t.total) * 100).toFixed(0)}% of total`} />
        <BigStat value={t.stale90d} label="Stale >90d" accent="#eab308" sub={`${((t.stale90d / t.total) * 100).toFixed(0)}% of total`} />
        <BigStat value={t.pending} label="Pending Acceptance" accent="#f97316" sub={`${((t.pending / t.total) * 100).toFixed(0)}% of total`} />
        <BigStat
          value={t.privilegedRoles}
          label="In Privileged Roles"
          accent="#22c55e"
          sub="✓ Zero — compliant"
        />
      </div>

      {/* Per-tenant bars */}
      <div className="card">
        <p className="card-header">Guests by Tenant</p>
        <div className="space-y-3">
          {TENANT_KEYS.map((key) => (
            <TenantGuestBar key={key} tenantKey={key} />
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-500" />
            Never signed in
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-orange-500" />
            Stale &gt;90d
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-green-500" />
            Active / recent
          </span>
        </div>
      </div>

      {/* TLL callout */}
      <TLLCallout />

      {/* Zero priv roles callout */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-xl">
            ✅
          </span>
          <div>
            <p className="font-bold text-green-300">Zero guests in privileged roles</p>
            <p className="text-sm text-green-200/60">
              Across all 722 guest accounts in 5 tenants, none hold any admin directory role.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
