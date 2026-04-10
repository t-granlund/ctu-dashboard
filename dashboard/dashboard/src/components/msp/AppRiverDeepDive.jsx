import { useState } from 'react';
import { appRiverPermissions } from '../../data/msp-data';

const RISK_COLORS = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  low: 'text-slate-400',
};

function SPCard({ sp }) {
  const [open, setOpen] = useState(false);
  const critCount = sp.permissions.filter((p) => p.risk === 'critical').length;
  const highCount = sp.permissions.filter((p) => p.risk === 'high').length;

  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-800/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-800/50"
      >
        <div>
          <p className="text-sm font-medium text-slate-200">{sp.name}</p>
          <p className="font-mono text-[10px] text-slate-600">appId: {sp.appId}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-red-400">{critCount} critical</span>
          <span className="text-orange-400">{highCount} high</span>
          <span className="text-slate-600">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700/30 p-4">
          <div className="space-y-1.5">
            {sp.permissions.map((perm) => (
              <div key={perm.scope} className="flex items-start gap-3 text-xs">
                <span className={`w-14 shrink-0 font-semibold uppercase ${RISK_COLORS[perm.risk]}`}>
                  {perm.risk}
                </span>
                <span className="w-64 shrink-0 font-mono text-slate-400">{perm.scope}</span>
                <span className="text-slate-500">{perm.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppRiverDeepDive() {
  const { comparison } = appRiverPermissions;

  return (
    <div>
      {/* Status banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-950/10 px-5 py-3">
        <span className="text-lg">✅</span>
        <div>
          <p className="text-sm font-semibold text-green-300">Resolved — Approved for Removal</p>
          <p className="text-xs text-green-400/60">
            You confirmed AppRiver is 100% migrated to PAX8. Tyler is disabling these service principals.
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400">
        These 3 service principals had broad write permissions across HTT, FN, and TLL.
        They're being removed because the AppRiver → PAX8 migration is complete.
      </p>

      <div className="mb-6 space-y-2">
        {appRiverPermissions.sps.map((sp) => (
          <SPCard key={sp.appId} sp={sp} />
        ))}
      </div>

      {/* Comparison */}
      <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          For comparison — PAX8's permissions (what "good" looks like)
        </p>
        <div className="flex flex-wrap gap-2">
          {comparison.pax8SP.permissions.map((p) => (
            <span key={p} className="rounded-lg bg-green-500/10 px-2.5 py-1 font-mono text-xs text-green-400">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{comparison.pax8SP.note}</p>
      </div>
    </div>
  );
}
