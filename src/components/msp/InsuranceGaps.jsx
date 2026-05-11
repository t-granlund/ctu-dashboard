import { cyberInsuranceGaps } from '../../data/msp-data';
import { Eyebrow, SectionHeader } from './atoms';

// Status dot — sequential ordinal palette, identical to the program matrix.
const STATUS_DOT = {
  pass:   { color: '#34d399', label: 'Pass' },
  fail:   { color: '#fb7185', label: 'Fail' },
  verify: { color: '#fbbf24', label: 'Verify' },
};

function StatusRow({ row }) {
  const meta = STATUS_DOT[row.status] ?? STATUS_DOT.verify;
  return (
    <li className="flex items-start gap-3">
      <span aria-hidden="true" style={{ background: meta.color }} className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" />
      <span className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">{row.tenant}</span>
      <span className="text-xs leading-5 text-slate-300">
        <span className="font-bold text-slate-100">{meta.label}.</span> {row.note}
      </span>
    </li>
  );
}

function GapCard({ gap }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h4 className="mb-4 text-sm font-bold text-white">{gap.control}</h4>
      <ul className="mb-4 space-y-2">
        {gap.status.map((s, i) => <StatusRow key={i} row={s} />)}
      </ul>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
        <Eyebrow>Still need</Eyebrow>
        <p className="mt-1 text-xs leading-5 text-slate-200">{gap.needFromMSP}</p>
      </div>
    </article>
  );
}

export default function InsuranceGaps() {
  const { gaps } = cyberInsuranceGaps;
  const passCount   = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'pass').length,   0);
  const failCount   = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'fail').length,   0);
  const verifyCount = gaps.reduce((s, g) => s + g.status.filter((x) => x.status === 'verify').length, 0);

  return (
    <div>
      <SectionHeader
        eyebrow="Cyber insurance"
        title="Cyber Insurance Controls"
        sub={
          <span className="tabular-nums">
            Status across all tenants — <span className="font-bold text-white">{passCount}</span> passing,{' '}
            <span className="font-bold text-white">{failCount}</span> failing,{' '}
            <span className="font-bold text-white">{verifyCount}</span> need verification.
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {gaps.map((gap, i) => <GapCard key={i} gap={gap} />)}
      </div>
    </div>
  );
}
