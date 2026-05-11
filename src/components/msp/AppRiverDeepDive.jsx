import { useState } from 'react';
import { appRiverPermissions } from '../../data/msp-data';
import { Eyebrow, SeverityDot, StatusPill } from './atoms';

// Severity → SeverityDot tone. Sequential ordinal, same palette as the
// matrix / action register.
const RISK_TONE = {
  critical: 'high',
  high:     'medium',
  low:      'low',
};

function SPCard({ sp }) {
  const [open, setOpen] = useState(false);
  const critCount = sp.permissions.filter((p) => p.risk === 'critical').length;
  const highCount = sp.permissions.filter((p) => p.risk === 'high').length;
  const panelId = `sp-${sp.appId}`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-900/70"
      >
        <div>
          <p className="text-sm font-bold text-slate-100">{sp.name}</p>
          <p className="font-mono text-[10px] text-slate-500">appId: {sp.appId}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <StatusPill tone="blocked">{critCount} critical</StatusPill>
          <StatusPill tone="warn">{highCount} high</StatusPill>
          <span aria-hidden="true" className="text-slate-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div id={panelId} className="border-t border-slate-800 p-4">
          <ul className="space-y-2">
            {sp.permissions.map((perm) => (
              <li key={perm.scope} className="flex items-start gap-3 text-xs">
                <span className="w-20 shrink-0">
                  <SeverityDot severity={RISK_TONE[perm.risk] ?? 'low'} label={perm.risk} />
                </span>
                <span className="w-64 shrink-0 font-mono text-slate-300">{perm.scope}</span>
                <span className="text-slate-400">{perm.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AppRiverDeepDive() {
  const { comparison } = appRiverPermissions;

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <StatusPill tone="ok">Status</StatusPill>
          <p className="text-sm font-bold text-white">Resolved — Approved for Removal</p>
        </div>
        <p className="text-sm leading-6 text-slate-300">
          You confirmed AppRiver is 100% migrated to PAX8. Tyler is disabling these service principals.
        </p>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-300">
        These 3 service principals had broad write permissions across HTT, FN, and TLL.
        They’re being removed because the AppRiver → PAX8 migration is complete.
      </p>

      <div className="mb-6 space-y-2">
        {appRiverPermissions.sps.map((sp) => <SPCard key={sp.appId} sp={sp} />)}
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <Eyebrow>For comparison — PAX8 permissions</Eyebrow>
        <p className="mt-1 mb-3 text-sm font-bold text-white">What “good” looks like</p>
        <div className="flex flex-wrap gap-2">
          {comparison.pax8SP.permissions.map((p) => (
            <span key={p} className="rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1 font-mono text-xs text-slate-200">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">{comparison.pax8SP.note}</p>
      </section>
    </div>
  );
}
