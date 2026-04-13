import { complianceControls, tenants, TENANT_KEYS } from '../data/audit-data';

/* ── Phase grouping ─────────────────────────────────────── */
const PHASE_LABELS = {
  done: { label: 'Completed ✓', color: 'text-green-400', bg: 'bg-green-500/10' },
  2:    { label: 'Phase 2 — Quick Wins', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  3:    { label: 'Phase 3 — Policy Hardening', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  4:    { label: 'Phase 4 — Governance', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  5:    { label: 'Phase 5 — Monitoring', color: 'text-teal-400', bg: 'bg-teal-500/10' },
};

function groupByPhase(controls) {
  const groups = {};
  for (const c of controls) {
    const key = String(c.phase);
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  return groups;
}

/* ── Compliance stats ───────────────────────────────────── */
function ComplianceStats() {
  const perTenant = TENANT_KEYS.map((key) => {
    const passing = complianceControls.filter((c) => c[key]).length;
    return { key, passing, pct: Math.round((passing / complianceControls.length) * 100) };
  });

  const overallPassing = complianceControls.filter((c) =>
    TENANT_KEYS.every((t) => c[t]),
  ).length;
  const overallPct = Math.round((overallPassing / complianceControls.length) * 100);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {perTenant.map((t) => {
        const tenant = tenants.find((tn) => tn.key === t.key);
        return (
          <div key={t.key} className="card text-center">
            <p className="text-2xl font-extrabold" style={{ color: tenant.color }}>
              {t.pct}%
            </p>
            <p className="text-xs font-semibold text-slate-400">{t.key}</p>
            <p className="text-[10px] text-slate-600">{t.passing}/{complianceControls.length}</p>
          </div>
        );
      })}
      <div className="card text-center">
        <p className={`text-2xl font-extrabold ${overallPct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
          {overallPct}%
        </p>
        <p className="text-xs font-semibold text-slate-400">ALL</p>
        <p className="text-[10px] text-slate-600">{overallPassing}/{complianceControls.length}</p>
      </div>
    </div>
  );
}

/* ── Matrix table ───────────────────────────────────────── */
function MatrixTable() {
  const groups = groupByPhase(complianceControls);
  const phaseOrder = ['done', '2', '3', '4', '5'];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-800/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Control
            </th>
            {tenants.map((t) => (
              <th
                key={t.key}
                className="px-3 py-3 text-center text-xs font-semibold uppercase"
                style={{ color: t.color }}
              >
                {t.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {phaseOrder.map((phase) => {
            const controls = groups[phase];
            if (!controls) return null;
            const meta = PHASE_LABELS[phase] || { label: `Phase ${phase}`, color: 'text-slate-400', bg: 'bg-slate-800/40' };
            return (
              <Fragment key={phase}>
                <tr>
                  <td
                    colSpan={6}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${meta.color} ${meta.bg}`}
                  >
                    {meta.label}
                  </td>
                </tr>
                {controls.map((c, i) => (
                  <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-slate-300">{c.control}</td>
                    {TENANT_KEYS.map((t) => (
                      <td key={t} className="px-3 py-2.5 text-center">
                        {c[t] ? (
                          <span className="text-green-400 text-base">✓</span>
                        ) : (
                          <span className="text-red-400 text-base">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Need Fragment import ───────────────────────────────── */
import { Fragment } from 'react';

/* ── Main component ─────────────────────────────────────── */
export default function ComplianceMatrix() {
  return (
    <section id="compliance" className="space-y-8">
      <h2 className="section-title">Compliance Matrix</h2>

      <ComplianceStats />

      <div className="card p-0">
        <MatrixTable />
      </div>

      <div className="card">
        <p className="text-xs text-slate-500">
          <span className="text-green-400">✓</span> = meets baseline target &nbsp;|&nbsp;
          <span className="text-red-400">✗</span> = remediation required &nbsp;|&nbsp;
          Controls grouped by remediation phase
        </p>
      </div>
    </section>
  );
}
