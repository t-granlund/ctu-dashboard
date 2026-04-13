import { useState } from 'react';
import { appRiverPermissions } from '../../data/msp-data';

const RISK_BADGE = {
  critical: 'bg-red-500/25 text-red-300 ring-1 ring-red-500/40',
  high:     'bg-orange-500/20 text-orange-300',
  low:      'bg-green-500/20 text-green-300',
};

function PermissionRow({ perm }) {
  return (
    <tr className="border-b border-red-900/20 hover:bg-red-950/30">
      <td className="px-3 py-1.5 font-mono text-xs text-red-200">{perm.scope}</td>
      <td className="px-3 py-1.5">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${RISK_BADGE[perm.risk]}`}>
          {perm.risk}
        </span>
      </td>
      <td className="px-3 py-1.5 text-xs text-red-300/70">{perm.desc}</td>
    </tr>
  );
}

function SPCard({ sp, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const critCount = sp.permissions.filter((p) => p.risk === 'critical').length;
  const highCount = sp.permissions.filter((p) => p.risk === 'high').length;

  return (
    <div className="rounded-xl border border-red-500/40 bg-red-950/25 backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-red-950/40"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🔴</span>
          <div>
            <h5 className="text-sm font-bold text-red-200">{sp.name}</h5>
            <span className="font-mono text-[10px] text-red-400/60">appId: {sp.appId}…</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {critCount > 0 && (
            <span className="rounded-full bg-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300">
              {critCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300">
              {highCount} high
            </span>
          )}
          <div className="flex gap-1">
            {sp.foundIn.map((t) => (
              <span key={t} className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                {t}
              </span>
            ))}
          </div>
          <span className="text-red-400/60">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-red-500/20 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-900/30 bg-red-950/40">
                  {['Permission Scope', 'Risk', 'What It Can Do'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-red-400/60">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sp.permissions.map((perm) => (
                  <PermissionRow key={perm.scope} perm={perm} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Pax8Comparison() {
  const { pax8SP } = appRiverPermissions.comparison;
  return (
    <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-5 backdrop-blur-sm">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-300">
        <span>✅</span> {pax8SP.name} — For Comparison
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {pax8SP.permissions.map((p) => (
          <span key={p} className="rounded bg-green-500/20 px-2 py-0.5 font-mono text-[10px] text-green-300">
            {p}
          </span>
        ))}
      </div>
      <p className="text-xs text-green-300/70">{pax8SP.note}</p>
      <div className="mt-2">
        <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-green-300">
          {pax8SP.riskLevel} risk
        </span>
      </div>
    </div>
  );
}

export default function AppRiverDeepDive() {
  return (
    <div id="section-appriver" className="scroll-mt-24">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-red-300">
        <span>🔴</span> AppRiver Service Principals — DANGER ZONE
      </h3>
      <p className="mb-4 text-sm text-red-300/70">{appRiverPermissions.summary}</p>

      {/* Giant callout */}
      <div className="mb-6 rounded-xl border-2 border-red-500/60 bg-red-950/40 p-5">
        <h4 className="mb-2 text-base font-bold text-red-200">
          ⚠️ These 3 SPs can write CA policies, modify GDAP, disable users, and reset MFA across 3 tenants
        </h4>
        <p className="mb-3 text-sm text-red-300/80">
          Even if the AppRiver → PAX8 migration is complete, <strong className="text-red-200">these permissions are LIVE</strong> until
          we explicitly remove the service principals. Any compromise of AppRiver's tenant
          gives an attacker full administrative control over HTT, FN, and TLL.
        </p>
        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3">
          <p className="text-sm font-medium text-red-200">
            👉 Ask Megan: "Is the AppRiver → PAX8 migration complete? Can we disable these SPs today?"
          </p>
        </div>
      </div>

      {/* SP Cards */}
      <div className="mb-6 space-y-3">
        {appRiverPermissions.sps.map((sp, i) => (
          <SPCard key={sp.appId} sp={sp} defaultOpen={i === 0} />
        ))}
      </div>

      {/* Comparison with Pax8 */}
      <div className="mb-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          What "Good" Looks Like — Pax8 SP for Comparison
        </h4>
        <Pax8Comparison />
      </div>
    </div>
  );
}
