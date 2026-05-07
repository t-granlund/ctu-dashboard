import { useState } from 'react';
import { maySevenUpdate } from '../../data/may-seven-update';
import MeganWarRoomOverview from './MeganWarRoomOverview';
import FirefliesDecision from './FirefliesDecision';

const SEVERITY = {
  high: { label: 'High', dot: 'bg-rose-400', text: 'text-rose-200' },
  medium: { label: 'Med', dot: 'bg-amber-300', text: 'text-amber-100' },
  low: { label: 'Low', dot: 'bg-slate-400', text: 'text-slate-300' },
};

function buildActionRegister(update) {
  const megan = update.stillOwedByMegan.map((item) => ({
    ...item,
    owner: 'Megan',
  }));
  const tyler = update.stillOwedByTyler.map((item) => ({
    ...item,
    owner: 'Tyler',
  }));
  return [...megan, ...tyler];
}

function ActionRow({ item }) {
  const sev = SEVERITY[item.severity] ?? SEVERITY.low;
  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
          <span className={`h-2 w-2 rounded-full ${sev.dot}`} aria-hidden="true" />
          <span className={sev.text}>{sev.label}</span>
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-bold leading-5 text-white">{item.text}</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">{item.decision}</p>
      </td>
      <td className="px-4 py-3 text-xs font-bold text-slate-200">{item.owner}</td>
      <td className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{item.target}</td>
    </tr>
  );
}

function ActionCard({ item }) {
  const sev = SEVERITY[item.severity] ?? SEVERITY.low;
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-950/45 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
          <span className={`h-2 w-2 rounded-full ${sev.dot}`} aria-hidden="true" />
          <span className={sev.text}>{sev.label}</span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">{item.target}</span>
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
    <section className="mb-6 rounded-3xl border border-slate-700/50 bg-slate-950/55 p-5">
      <header className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Working surface</p>
          <h4 className="text-lg font-black text-white">Action register</h4>
        </div>
        <p className="text-xs leading-5 text-slate-300">Top items first. Each row has a real decision, not a placeholder.</p>
      </header>

      <div tabIndex={0} aria-label="May 7 action register table scroll area" className="hidden overflow-x-auto rounded-2xl border border-slate-800/70 md:block">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <caption className="sr-only">May 7 action register</caption>
          <thead className="bg-slate-950/80 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-black">Priority</th>
              <th className="px-4 py-3 font-black">Item · Decision needed</th>
              <th className="px-4 py-3 font-black">Owner</th>
              <th className="px-4 py-3 font-black">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
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
          className="mt-4 min-h-10 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-black text-slate-100 transition hover:bg-slate-800"
        >
          {showAll ? 'Show top items only' : `Show ${hidden} more action${hidden === 1 ? '' : 's'}`}
        </button>
      )}
    </section>
  );
}

export default function MaySevenUpdate() {
  const u = maySevenUpdate;
  return (
    <div id="section-may7-update" className="scroll-mt-24">
      <MeganWarRoomOverview />

      <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/35 to-slate-900/60 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Status update for next call</p>
          <h3 className="mt-1 text-2xl font-black text-white">{u.callDate} · Tyler × Megan</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Snapshot of what changed since April 10, what is still open, and what we are landing today. The action register
            is the single working surface — owed-by-Megan and owed-by-Tyler are merged and prioritised.
          </p>
        </div>
        <aside className="rounded-3xl border border-slate-700/50 bg-slate-950/55 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Brief refreshed</p>
          <p className="mt-1 text-sm font-bold text-white">{u.briefRefreshed}</p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Live artifacts</p>
          <ul className="mt-2 space-y-1 text-[11px] leading-5 text-slate-300">
            <li><code className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px]">{u.briefPath}</code></li>
            <li><code className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px]">{u.runbookPath}</code></li>
            <li><code className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px]">{u.decisionLogPath}</code></li>
          </ul>
        </aside>
      </section>

      <ActionRegister items={buildActionRegister(u)} />

      <FirefliesDecision />

      <section className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/60 p-6">
        <header className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Model tenant</p>
          <h4 className="text-xl font-black text-white">Delta Crown — operating snapshot</h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{u.deltaCrownStatus.summary}</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-green-500/30 bg-slate-950/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-300">Live · {u.deltaCrownStatus.live.length}</p>
            <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-200">
              {u.deltaCrownStatus.live.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-2"><span className="text-green-300" aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-rose-500/30 bg-slate-950/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">Blocked · {u.deltaCrownStatus.blocked.length}</p>
            <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-200">
              {u.deltaCrownStatus.blocked.map((item) => (
                <li key={item} className="flex gap-2"><span className="text-rose-300" aria-hidden="true">✕</span>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
