import { cyberInsuranceGaps } from '../../data/msp-data';

const STATUS_STYLE = {
  pass: { dot: 'bg-green-400', text: 'text-green-400', label: 'Pass' },
  fail: { dot: 'bg-red-400', text: 'text-red-400', label: 'Fail' },
  verify: { dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'Verify' },
};

function GapCard({ gap }) {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-5">
      <h4 className="mb-4 text-sm font-semibold text-white">{gap.control}</h4>

      {/* Per-tenant status — simple dots */}
      <div className="mb-4 space-y-2">
        {gap.status.map((s, i) => {
          const style = STATUS_STYLE[s.status] || STATUS_STYLE.verify;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 flex items-center gap-2">
                <div className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                <span className="w-8 text-[10px] font-bold text-slate-500">{s.tenant}</span>
              </div>
              <p className="text-xs text-slate-400">{s.note}</p>
            </div>
          );
        })}
      </div>

      {/* What we still need */}
      <div className="rounded-lg bg-slate-900/50 px-3 py-2">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Still need: </span>
          {gap.needFromMSP}
        </p>
      </div>
    </div>
  );
}

export default function InsuranceGaps() {
  const { gaps } = cyberInsuranceGaps;
  const passCount = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'pass').length, 0);
  const failCount = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'fail').length, 0);
  const verifyCount = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'verify').length, 0);

  return (
    <div>
      <h4 className="mb-2 text-base font-semibold text-white">Cyber Insurance Controls</h4>
      <p className="mb-4 text-sm text-slate-500">
        Status across all tenants — {passCount} passing, {failCount} failing, {verifyCount} need verification.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {gaps.map((gap, i) => (
          <GapCard key={i} gap={gap} />
        ))}
      </div>
    </div>
  );
}
