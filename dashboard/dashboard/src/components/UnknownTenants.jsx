import { unknownTenants, tenantColor } from '../data/audit-data';
import SeverityBadge from './SeverityBadge';

/* ── Alert box for critical tenants ─────────────────────── */
function CriticalAlert({ tenant }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🚨</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-red-300">CRITICAL — Immediate Investigation Required</p>
            <SeverityBadge level="critical" />
          </div>
          <p className="mt-1 break-all font-mono text-sm text-red-200">{tenant.id}</p>
          <p className="mt-2 text-sm text-red-200/80">{tenant.description}</p>
          {tenant.flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tenant.flags.map((f, i) => (
                <span key={i} className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                  {f}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {tenant.foundIn.map((t) => (
              <span
                key={t}
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: `${tenantColor(t)}33`, color: tenantColor(t) }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg bg-slate-900/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Investigation Command</p>
            <code className="mt-1 block text-xs text-emerald-400">
              Invoke-MgGraphRequest -Method GET -Uri
              "https://graph.microsoft.com/v1.0/tenantRelationships/findTenantInformationByTenantId(tenantId='{tenant.id.slice(0, 8)}...')"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Table for non-critical tenants ─────────────────────── */
function TenantTable({ items }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-800/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Tenant ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Found In
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {items.map((t) => (
            <tr key={t.id} className="hover:bg-slate-800/40">
              <td className="px-4 py-3 font-mono text-xs text-slate-300">
                {t.id.slice(0, 8)}…
                <span className="ml-1 hidden text-slate-600 lg:inline">{t.id.slice(8)}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {t.foundIn.map((tn) => (
                    <span
                      key={tn}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: `${tenantColor(tn)}33`, color: tenantColor(tn) }}
                    >
                      {tn}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge level={t.priority} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function UnknownTenants() {
  const critical = unknownTenants.filter((t) => t.priority === 'critical');
  const rest = unknownTenants.filter((t) => t.priority !== 'critical');

  return (
    <section id="unknown" className="space-y-8">
      <h2 className="section-title">Unknown Tenants Investigation</h2>

      <div className="card">
        <p className="text-sm text-slate-400">
          <span className="font-bold text-white">{unknownTenants.length}</span> tenant IDs found
          across the 5-tenant environment that do not match any known HTT partner.{' '}
          <span className="font-semibold text-red-400">{critical.length} require immediate investigation.</span>
        </p>
      </div>

      {/* Critical alerts */}
      <div className="space-y-4">
        {critical.map((t) => (
          <CriticalAlert key={t.id} tenant={t} />
        ))}
      </div>

      {/* Rest in table */}
      {rest.length > 0 && (
        <div>
          <p className="card-header">Other Unknown Tenants</p>
          <TenantTable items={rest} />
        </div>
      )}

      {/* Investigation instructions */}
      <div className="card">
        <p className="card-header">Investigation Runbook</p>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">1</span>
            <p>Run <code className="text-emerald-400">findTenantInformationByTenantId</code> for each unknown ID</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">2</span>
            <p>Cross-reference against vendor contracts and MSP agreements</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">3</span>
            <p>For unidentified tenants: <strong className="text-red-400">remove from cross-tenant access policy immediately</strong></p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">4</span>
            <p>For known vendors: scope their access to specific applications and enforce MFA trust</p>
          </div>
        </div>
      </div>
    </section>
  );
}
