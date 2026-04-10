import { useState } from 'react';
import {
  TENANT_KEYS,
  TENANT_NAMES,
  mspServicePrincipals,
  partnerPolicySummary,
  licenseSummary,
} from '../../data/msp-data';
import { tenantColor } from '../../data/audit-data';

// ── Reusable sub-tables ─────────────────────────────────────

function SPTable({ principals }) {
  if (!principals.length) {
    return (
      <p className="px-4 py-3 text-xs italic text-slate-500">
        No MSP service principals detected
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/40">
            {['Name', 'Owner', 'Type', 'Created'].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {principals.map((sp) => (
            <tr
              key={sp.appId}
              className="border-b border-slate-700/30 hover:bg-slate-800/40"
            >
              <td className="px-3 py-2 text-sm font-medium text-slate-200">
                {sp.name}
              </td>
              <td className="px-3 py-2 text-xs text-slate-400">{sp.owner}</td>
              <td className="px-3 py-2 text-xs text-slate-500">{sp.type}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-500">
                {sp.created}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicyTable({ policies }) {
  if (!policies.length) {
    return (
      <p className="px-4 py-3 text-xs italic text-slate-500">
        No partner policies found — verify with MSP
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/40">
            {['Partner', 'Tenant ID', 'Service Provider', 'Custom Config', 'Note'].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.map((p, i) => (
            <tr
              key={i}
              className="border-b border-slate-700/30 hover:bg-slate-800/40"
            >
              <td className="px-3 py-2 text-sm font-medium text-slate-200">
                {p.name}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-slate-500">
                {p.tenantId}
              </td>
              <td className="px-3 py-2 text-xs">
                {p.isServiceProvider === true && (
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-cyan-300">
                    Yes
                  </span>
                )}
                {p.isServiceProvider === false && (
                  <span className="text-slate-500">No</span>
                )}
                {p.isServiceProvider === null && (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-xs">
                {p.hasCustomConfig ? (
                  <span className="text-cyan-400">✓ Custom</span>
                ) : (
                  <span className="text-slate-500">Default</span>
                )}
              </td>
              <td className="max-w-[240px] truncate px-3 py-2 text-xs text-slate-400">
                {p.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LicenseBar({ license }) {
  // Skip absurd "free" pools for bar display
  const isFree = license.enabled >= 100000;
  const pct = isFree ? 0 : Math.round((license.consumed / license.enabled) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-56 truncate text-xs text-slate-300">{license.name}</span>
      {isFree ? (
        <span className="text-xs text-slate-500">
          {license.consumed.toLocaleString()} used (free pool)
        </span>
      ) : (
        <>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#06b6d4',
              }}
            />
          </div>
          <span className="w-24 text-right font-mono text-xs text-slate-400">
            {license.consumed}/{license.enabled}
          </span>
        </>
      )}
      {license.note && (
        <span className="ml-1 text-xs text-red-400">{license.note}</span>
      )}
    </div>
  );
}

// ── Per-tenant collapsible card ─────────────────────────────

function TenantCard({ tenantKey }) {
  const [open, setOpen] = useState(false);
  const color = tenantColor(tenantKey);
  const sps = mspServicePrincipals[tenantKey] ?? [];
  const policies = partnerPolicySummary[tenantKey] ?? [];
  const licenses = licenseSummary[tenantKey];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
      {/* Header — clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-b border-slate-700/50 px-5 py-3 text-left transition-colors hover:bg-slate-800/80"
        style={{ borderTopColor: color, borderTopWidth: '3px' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="rounded-lg px-2.5 py-1 text-sm font-bold text-white"
            style={{ backgroundColor: `${color}cc` }}
          >
            {tenantKey}
          </span>
          <span className="text-sm font-medium text-slate-300">
            {TENANT_NAMES[tenantKey]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-400">
            SPs: {sps.length}
          </span>
          <span className="rounded bg-slate-700 px-2 py-0.5 text-slate-300">
            Partners: {policies.length}
          </span>
          <span className="text-slate-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="space-y-4 p-4">
          {/* Service Principals */}
          <div>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Service Principals
            </h5>
            <SPTable principals={sps} />
          </div>

          {/* Partner Policies */}
          <div>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Partner Policies
            </h5>
            <PolicyTable policies={policies} />
          </div>

          {/* License Summary */}
          {licenses && (
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Key Licenses ({licenses.totalConsumed}/{licenses.totalEnabled} consumed · {licenses.totalSkus} SKUs)
              </h5>
              <div className="space-y-2">
                {licenses.keyLicenses.map((lic) => (
                  <LicenseBar key={lic.sku} license={lic} />
                ))}
              </div>
            </div>
          )}

          {/* Admin Role Status */}
          <div className="rounded-lg border border-green-500/20 bg-green-950/20 px-4 py-2">
            <p className="text-xs text-green-400">
              ✅ No MSP principals found in admin roles for {tenantKey}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────

export default function TenantFootprint() {
  return (
    <div>
      <h3 className="mb-2 text-xl font-bold text-white">
        What We Can See — Per-Tenant MSP Footprint
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        Service principals, partner policies, and license consumption across all 5 tenants.
        Click a tenant to expand.
      </p>
      <div className="space-y-3">
        {TENANT_KEYS.map((key) => (
          <TenantCard key={key} tenantKey={key} />
        ))}
      </div>
    </div>
  );
}
