import { cyberInsuranceGaps } from '../data/msp-data';

/* ── Status badge ─────────────────────────────────────── */
function GapBadge({ status }) {
  const map = {
    pass:    { bg: 'bg-green-500/10', text: 'text-green-400', label: '✅ Pass' },
    fail:    { bg: 'bg-rose-500/10',  text: 'text-rose-400',  label: '❌ Fail' },
    verify:  { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '🔍 Verify' },
    partial: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '⚠️ Partial' },
  };
  const s = map[status] || map.verify;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* ── Tenant chip ──────────────────────────────────────── */
function TenantChip({ tenant, status, note }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <GapBadge status={status} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-200">{tenant}</p>
        <p className="text-[11px] leading-tight text-slate-500">{note}</p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function InsuranceEvidence() {
  const { gaps, overallVerdict, auditDate } = cyberInsuranceGaps;

  /* Count statuses */
  let passCount = 0;
  let failCount = 0;
  let verifyCount = 0;
  gaps.forEach(g =>
    g.status.forEach(s => {
      if (s.status === 'pass') passCount++;
      else if (s.status === 'fail') failCount++;
      else verifyCount++;
    })
  );

  return (
    <section id="insurance-evidence" className="space-y-8">
      <h2 className="section-title">🛡️ Insurance Evidence</h2>

      {/* Verdict banner */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-6 py-4">
        <p className="text-sm font-bold text-rose-400">{overallVerdict}</p>
        <p className="mt-1 text-xs text-slate-500">
          Audit date: {auditDate} · {passCount} pass · {failCount} fail · {verifyCount} need verification
        </p>
      </div>

      {/* Control cards */}
      <div className="space-y-6">
        {gaps.map((gap) => {
          const hasFail = gap.status.some(s => s.status === 'fail');
          const hasVerify = gap.status.some(s => s.status === 'verify');
          const borderColor = hasFail
            ? 'border-rose-500/20'
            : hasVerify
              ? 'border-amber-500/20'
              : 'border-green-500/20';

          return (
            <details key={gap.control} className={`group rounded-xl border ${borderColor} bg-slate-900/60`}>
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-slate-200 hover:text-white">
                <span className="flex items-center gap-3">
                  <span className="text-base">{hasFail ? '🔴' : hasVerify ? '🟡' : '🟢'}</span>
                  {gap.control}
                </span>
                <span className="text-xs text-slate-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="border-t border-slate-800 px-6 py-4 space-y-4">
                {/* Per-tenant status grid */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {gap.status.map((s) => (
                    <TenantChip
                      key={`${gap.control}-${s.tenant}`}
                      tenant={s.tenant}
                      status={s.status}
                      note={s.note}
                    />
                  ))}
                </div>

                {/* What we need from MSP */}
                {gap.needFromMSP && (
                  <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/10 px-4 py-3">
                    <p className="text-xs font-semibold text-cyan-400 mb-1">Needed from MSP</p>
                    <p className="text-xs text-slate-400">{gap.needFromMSP}</p>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {/* Key risks */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 space-y-2">
        <h3 className="text-sm font-bold text-amber-400">⚠️ Key Risks for Insurance Renewal</h3>
        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
          <li><strong>MFA overstated:</strong> Insurance form claims "all five tenants" but BCC/FN are admin-only, TLL is group-scoped with unproven coverage</li>
          <li><strong>EDR overstated:</strong> Form claims "all company-owned endpoints" but IT Director + Ops Lead + personal-device users are excluded</li>
          <li><strong>No backup:</strong> Three explicit "No" answers on Exchange/SharePoint/Teams backup — likely premium impact</li>
          <li><strong>No security training:</strong> Dropped KnowBe4 when moving to Sui Generis; replacement pricing pending</li>
          <li><strong>Self-attested only:</strong> All evidence is internally produced — no third-party audit, no penetration test, no SOC 2</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-4 space-y-2">
        <h3 className="text-sm font-bold text-fuchsia-400">📋 Required Actions Before Submission</h3>
        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
          <li>Correct MFA claim to reflect admin-only in BCC/FN and group-scoped in TLL</li>
          <li>Correct EDR claim with device counts and exclusions</li>
          <li>Obtain signed attestation from Sui Generis (template in docs/INSURANCE-ATTESTATION-TEMPLATE.md)</li>
          <li>Procure M365 backup solution — no paid backup is a likely disqualifier</li>
          <li>Deploy security awareness training — Sui Generis willing to provide; pricing pending</li>
        </ul>
      </div>
    </section>
  );
}
