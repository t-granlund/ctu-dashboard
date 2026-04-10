import { cyberInsuranceGaps } from '../../data/msp-data';

const STATUS_BADGE = {
  pass:    { bg: 'bg-green-500/20', text: 'text-green-300', label: 'PASS' },
  fail:    { bg: 'bg-red-500/20',   text: 'text-red-300',   label: 'FAIL' },
  verify:  { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'VERIFY' },
  unknown: { bg: 'bg-slate-600/30', text: 'text-slate-400',  label: 'UNKNOWN' },
};

function GapCard({ gap }) {
  const failCount = gap.status.filter((s) => s.status === 'fail').length;
  const hasUnknown = gap.status.some((s) => s.status === 'unknown');

  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm ${
      failCount > 2
        ? 'border-red-500/40 bg-red-950/15'
        : hasUnknown
          ? 'border-yellow-500/30 bg-yellow-950/10'
          : 'border-slate-700/50 bg-slate-800/60'
    }`}>
      {/* Header */}
      <h4 className="mb-3 text-sm font-bold text-white">{gap.control}</h4>

      {/* Per-tenant status */}
      <div className="mb-4 space-y-1.5">
        {gap.status.map((s, i) => {
          const badge = STATUS_BADGE[s.status];
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="w-10 shrink-0 text-[10px] font-bold text-slate-400">{s.tenant}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
              <span className="text-xs text-slate-400">{s.note}</span>
            </div>
          );
        })}
      </div>

      {/* Need from MSP */}
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2">
        <p className="text-xs text-cyan-300">
          <strong>Need from MSP:</strong> {gap.needFromMSP}
        </p>
      </div>
    </div>
  );
}

export default function InsuranceGaps() {
  const { gaps, auditDate, overallVerdict } = cyberInsuranceGaps;
  const totalFails = gaps.reduce(
    (sum, g) => sum + g.status.filter((s) => s.status === 'fail').length,
    0,
  );

  return (
    <div id="section-insurance" className="scroll-mt-24">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
        <span>🛡️</span> Cyber Insurance Gaps
      </h3>
      <p className="mb-2 text-sm text-slate-400">
        Audit date: {auditDate} · {gaps.length} controls evaluated
      </p>

      {/* Overall verdict */}
      <div className="mb-6 rounded-xl border-2 border-red-500/40 bg-red-950/20 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-red-300">
          <span className="text-lg">🚨</span>
          {overallVerdict}
        </p>
      </div>

      {/* Gap cards grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {gaps.map((gap, i) => (
          <GapCard key={i} gap={gap} />
        ))}
      </div>
    </div>
  );
}
