import { maySevenUpdate } from '../../data/may-seven-update';
import { SectionHeader, SeverityDot, StatusPill } from './atoms';

const SEVERITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };
const OWNER_TONE = { Megan: 'info', Tyler: 'info', Both: 'info' };

export function buildActionRegister(update = maySevenUpdate) {
  return [
    ...update.stillOwedByMegan.map((item) => ({ ...item, owner: 'Megan' })),
    ...update.stillOwedByTyler.map((item) => ({ ...item, owner: 'Tyler' })),
  ];
}

function ActionRow({ item }) {
  return (
    <tr className="align-top">
      <td className="px-5 py-3">
        <SeverityDot severity={item.severity} label={SEVERITY_LABEL[item.severity] ?? item.severity} />
      </td>
      <td className="px-5 py-3">
        <p className="text-sm font-bold leading-5 text-white">{item.text}</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">{item.decision}</p>
      </td>
      <td className="px-5 py-3">
        <StatusPill tone={OWNER_TONE[item.owner] ?? 'info'}>{item.owner}</StatusPill>
      </td>
      <td className="px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-200">
        {item.target}
      </td>
    </tr>
  );
}

function ActionCard({ item }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <SeverityDot severity={item.severity} label={SEVERITY_LABEL[item.severity] ?? item.severity} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] tabular-nums text-slate-300">
          {item.target}
        </span>
      </div>
      <p className="text-sm font-bold leading-5 text-white">{item.text}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{item.decision}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Owner · {item.owner}</p>
    </article>
  );
}

export default function MspActionRegister({ compact = false }) {
  const items = buildActionRegister();
  const visible = compact ? items.slice(0, 5) : items;
  const high = items.filter((i) => i.severity === 'high').length;
  const medium = items.filter((i) => i.severity === 'medium').length;
  const low = items.filter((i) => i.severity === 'low').length;

  return (
    <section id="msp-action-register" className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <SectionHeader
        eyebrow="MSP working surface"
        title="Action Register"
        sub="All owed-by-Megan and owed-by-Tyler work in one target-date table. The May 7 brief links here instead of carrying the full register inline."
        action={
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="blocked">{high} high</StatusPill>
            <StatusPill tone="warn">{medium} med</StatusPill>
            <StatusPill tone="info">{low} low</StatusPill>
          </div>
        }
      />

      <div
        tabIndex={0}
        role="region"
        aria-label="Full MSP action register table scroll area"
        className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block"
      >
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Full MSP action register</caption>
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-400">
              <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Priority</th>
              <th scope="col" className="px-5 py-3 font-bold">Item · Decision needed</th>
              <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Owner</th>
              <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {visible.map((item) => <ActionRow key={`${item.owner}-${item.text}`} item={item} />)}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {visible.map((item) => <ActionCard key={`${item.owner}-${item.text}`} item={item} />)}
      </div>

      {compact && items.length > visible.length && (
        <a href="#msp-action-register" className="mt-4 inline-flex min-h-10 items-center rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-100 hover:bg-slate-800">
          Open all {items.length} actions →
        </a>
      )}
    </section>
  );
}
