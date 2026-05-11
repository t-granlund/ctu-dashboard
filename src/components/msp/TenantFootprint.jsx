import { useState } from 'react';
import {
  TENANT_KEYS,
  TENANT_NAMES,
  mspServicePrincipals,
  partnerPolicySummary,
  licenseSummary,
} from '../../data/msp-data';
import { Eyebrow, SectionHeader, StatusPill } from './atoms';

// License-bar hue uses sequential ordinal: rose (over 90% used) →
// amber (over 75%) → slate (healthy). Same palette as the program matrix.
function licenseBarColor(pct) {
  if (pct > 90) return '#fb7185';
  if (pct > 75) return '#fbbf24';
  return '#94a3b8';
}

function SPTable({ principals }) {
  if (!principals.length) {
    return <p className="px-4 py-3 text-xs italic text-slate-400">No MSP service principals detected.</p>;
  }
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="MSP service principals table scroll area"
      className="overflow-x-auto rounded-2xl border border-slate-800"
    >
      <table className="w-full text-sm">
        <caption className="sr-only">MSP service principals</caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60">
            {['Name', 'Owner', 'Type', 'Created'].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {principals.map((sp) => (
            <tr key={sp.appId} className="hover:bg-slate-900/60">
              <td className="px-3 py-2 text-sm font-bold text-slate-100">{sp.name}</td>
              <td className="px-3 py-2 text-xs text-slate-300">{sp.owner}</td>
              <td className="px-3 py-2 text-xs text-slate-400">{sp.type}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-400">{sp.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicyTable({ policies }) {
  if (!policies.length) {
    return <p className="px-4 py-3 text-xs italic text-slate-400">No partner policies found — verify with MSP.</p>;
  }
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Partner policies table scroll area"
      className="overflow-x-auto rounded-2xl border border-slate-800"
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Partner policies</caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60">
            {['Partner', 'Tenant ID', 'Service Provider', 'Custom Config', 'Note'].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {policies.map((p, i) => (
            <tr key={i} className="hover:bg-slate-900/60">
              <td className="px-3 py-2 text-sm font-bold text-slate-100">{p.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-400">{p.tenantId}</td>
              <td className="px-3 py-2 text-xs">
                {p.isServiceProvider === true  && <StatusPill tone="ok">Yes</StatusPill>}
                {p.isServiceProvider === false && <span className="text-slate-400">No</span>}
                {p.isServiceProvider === null  && <span aria-hidden="true" className="text-slate-500">—</span>}
              </td>
              <td className="px-3 py-2 text-xs">
                {p.hasCustomConfig
                  ? <span className="text-slate-100">✓ Custom</span>
                  : <span className="text-slate-400">Default</span>}
              </td>
              <td className="max-w-[240px] truncate px-3 py-2 text-xs text-slate-300">{p.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LicenseBar({ license }) {
  const isFree = license.enabled >= 100000;
  const pct = isFree ? 0 : Math.round((license.consumed / license.enabled) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-56 truncate text-xs text-slate-200">{license.name}</span>
      {isFree ? (
        <span className="text-xs text-slate-400 tabular-nums">{license.consumed.toLocaleString()} used (free pool)</span>
      ) : (
        <>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label={`${license.name} consumption`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: licenseBarColor(pct) }} />
          </div>
          <span className="w-24 text-right font-mono text-xs text-slate-300 tabular-nums">
            {license.consumed}/{license.enabled}
          </span>
        </>
      )}
      {license.note && <span className="ml-1 text-xs text-slate-400">{license.note}</span>}
    </div>
  );
}

function TenantCard({ tenantKey }) {
  const [open, setOpen] = useState(false);
  const sps = mspServicePrincipals[tenantKey] ?? [];
  const policies = partnerPolicySummary[tenantKey] ?? [];
  const licenses = licenseSummary[tenantKey];
  const panelId = `tenant-${tenantKey}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-800 px-5 py-3 text-left transition-colors hover:bg-slate-900/70"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-sm font-bold text-white">
            {tenantKey}
          </span>
          <span className="text-sm font-bold text-slate-200">{TENANT_NAMES[tenantKey]}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <StatusPill tone="info">SPs · {sps.length}</StatusPill>
          <StatusPill tone="info">Partners · {policies.length}</StatusPill>
          <span aria-hidden="true" className="text-slate-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div id={panelId} className="space-y-5 p-5">
          <div>
            <Eyebrow>Service principals</Eyebrow>
            <div className="mt-2"><SPTable principals={sps} /></div>
          </div>
          <div>
            <Eyebrow>Partner policies</Eyebrow>
            <div className="mt-2"><PolicyTable policies={policies} /></div>
          </div>
          {licenses && (
            <div>
              <Eyebrow>Key licenses · {licenses.totalConsumed}/{licenses.totalEnabled} consumed · {licenses.totalSkus} SKUs</Eyebrow>
              <div className="mt-2 space-y-2">
                {licenses.keyLicenses.map((lic) => <LicenseBar key={lic.sku} license={lic} />)}
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-slate-200">
              <span aria-hidden="true" style={{ background: '#34d399' }} className="inline-block h-2 w-2 rounded-full" />
              No MSP principals found in admin roles for {tenantKey}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantFootprint() {
  return (
    <div>
      <SectionHeader
        eyebrow="Per-tenant footprint"
        title="What We Can See — Per-Tenant MSP Footprint"
        sub="Service principals, partner policies, and license consumption across all 5 tenants. Click a tenant to expand."
      />
      <div className="space-y-3">
        {TENANT_KEYS.map((key) => <TenantCard key={key} tenantKey={key} />)}
      </div>
    </div>
  );
}
