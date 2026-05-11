import { useState } from 'react';
import { maySevenUpdate } from '../../data/may-seven-update';
import MeganWarRoomOverview from './MeganWarRoomOverview';
import FirefliesDecision from './FirefliesDecision';
import { Eyebrow, SectionHeader, MetaPair, SeverityDot } from './atoms';

const SEVERITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };

function buildActionRegister(update) {
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
      <td className="px-5 py-3 text-xs font-bold text-slate-200">{item.owner}</td>
      <td className="px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-200">{item.target}</td>
    </tr>
  );
}

function ActionCard({ item }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <SeverityDot severity={item.severity} label={SEVERITY_LABEL[item.severity] ?? item.severity} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] tabular-nums text-slate-300">{item.target}</span>
      </div>
      <p className="text-sm font-bold leading-5 text-white">{item.text}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{item.decision}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Owner · {item.owner}</p>
    </article>
  );
}

function ActionRegister({ items }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 6);
  const hidden = items.length - visible.length;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <SectionHeader
        eyebrow="Working surface"
        title="Action register"
        sub="Top items first. Each row carries a real decision and a target."
      />

      <div tabIndex={0} aria-label="May 7 action register table scroll area" className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">May 7 action register</caption>
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-400">
              <th scope="col" className="w-[6rem] px-5 py-3 font-bold">Priority</th>
              <th scope="col" className="px-5 py-3 font-bold">Item · Decision needed</th>
              <th scope="col" className="w-[6rem] px-5 py-3 font-bold">Owner</th>
              <th scope="col" className="w-[6rem] px-5 py-3 font-bold">Target</th>
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

      {items.length > 6 && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((value) => !value)}
          className="mt-4 inline-flex min-h-10 items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 hover:bg-slate-800"
        >
          {showAll ? 'Show top items only' : `Show ${hidden} more action${hidden === 1 ? '' : 's'}`}
        </button>
      )}
    </section>
  );
}

function StatusStrip({ update }) {
  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <Eyebrow>Status update for next call</Eyebrow>
        <h3 className="mt-1 text-xl font-bold text-white">{update.callDate} · Tyler × Megan</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Snapshot of what changed since April 10, what is still open, and what we are landing today. The action register is the single working surface — owed-by-Megan and owed-by-Tyler are merged and prioritised.
        </p>
      </div>
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <MetaPair label="Brief refreshed" value={update.briefRefreshed} />
        <Eyebrow className="mt-4">Live artifacts</Eyebrow>
        <ul className="mt-2 space-y-1 text-[12px] leading-5 text-slate-300">
          <li><code className="rounded bg-slate-950 px-1.5 py-0.5 text-[12px]">{update.briefPath}</code></li>
          <li><code className="rounded bg-slate-950 px-1.5 py-0.5 text-[12px]">{update.runbookPath}</code></li>
          <li><code className="rounded bg-slate-950 px-1.5 py-0.5 text-[12px]">{update.decisionLogPath}</code></li>
        </ul>
      </aside>
    </section>
  );
}

function DeltaCrownSnapshot({ snapshot }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <SectionHeader
        eyebrow="Model tenant"
        title="Delta Crown — operating snapshot"
        sub={snapshot.summary}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Eyebrow>Live · {snapshot.live.length}</Eyebrow>
          <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-200">
            {snapshot.live.slice(0, 4).map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" style={{ color: '#34d399' }} className="mt-0.5 font-bold">●</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Eyebrow>Blocked · {snapshot.blocked.length}</Eyebrow>
          <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-200">
            {snapshot.blocked.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" style={{ color: '#fb7185' }} className="mt-0.5 font-bold">○</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default function MaySevenUpdate() {
  const u = maySevenUpdate;
  return (
    <div id="section-may7-update" className="scroll-mt-24">
      <MeganWarRoomOverview />
      <StatusStrip update={u} />
      <ActionRegister items={buildActionRegister(u)} />
      <FirefliesDecision />
      <DeltaCrownSnapshot snapshot={u.deltaCrownStatus} />
    </div>
  );
}
