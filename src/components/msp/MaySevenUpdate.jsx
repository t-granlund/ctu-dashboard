import { useState } from 'react';
import { maySevenUpdate } from '../../data/may-seven-update';
import MeganWarRoomOverview from './MeganWarRoomOverview';
import FirefliesDecision from './FirefliesDecision';

const SEVERITY = {
  high: { dot: 'bg-red-400', text: 'text-red-300', label: 'High' },
  medium: { dot: 'bg-yellow-400', text: 'text-yellow-300', label: 'Medium' },
  low: { dot: 'bg-slate-500', text: 'text-slate-400', label: 'Low' },
};

function ShowMoreButton({ expanded, remaining, label, onClick }) {
  if (remaining <= 0 && !expanded) return null;
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="mt-3 min-h-10 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs font-black text-slate-100 transition hover:bg-slate-800"
    >
      {expanded ? `Show fewer ${label}` : `Show ${remaining} more ${label}`}
    </button>
  );
}

function buildActionRegister(update) {
  const megan = update.stillOwedByMegan.map((item) => ({
    ...item,
    owner: 'Megan / Sui Generis',
    decision: item.text.includes('Teams Premium') ? 'Superseded by Fireflies decision; confirm no replacement purchase.' : 'Confirm owner, answer, or target date.',
    target: item.severity === 'high' ? 'May 7 call' : 'Next MSP sync',
    status: item.text.includes('Teams Premium') ? 'Superseded' : 'Needs Megan',
  }));
  const tyler = update.stillOwedByTyler.map((item) => ({
    ...item,
    owner: 'Tyler / HTT',
    decision: item.text.includes('runbook') ? 'Validate with Megan and convert to final SOP.' : 'Complete or confirm dependency.',
    target: item.severity === 'high' ? 'May 7 call' : 'This week',
    status: 'Needs Tyler',
  }));
  return [...megan, ...tyler];
}

function ActionRegister({ items }) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-700/40 bg-slate-900/50 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Working surface</p>
          <h4 className="text-lg font-black text-white">May 7 action register</h4>
        </div>
        <p className="max-w-xl text-xs leading-5 text-slate-400">
          One table beats two owed-item piles. Megan can scan owner, decision, target, and status without spelunking.
        </p>
      </div>
      <div tabIndex={0} aria-label="May 7 action register table scroll area" className="hidden overflow-x-auto rounded-2xl border border-slate-800/70 md:block">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
          <caption className="sr-only">May 7 action register</caption>
          <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              {['Priority', 'Item', 'Owner', 'Decision needed', 'Due / target', 'Status'].map((column) => <th key={column} className="px-4 py-3 font-black">{column}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/35">
            {items.map((item) => {
              const sev = SEVERITY[item.severity] ?? SEVERITY.low;
              return (
                <tr key={`${item.owner}-${item.text}`} className="align-top">
                  <td className={`px-4 py-3 font-black uppercase ${sev.text}`}>{sev.label}</td>
                  <td className="px-4 py-3 leading-5 text-slate-200">{item.text}</td>
                  <td className="px-4 py-3 leading-5 text-slate-300">{item.owner}</td>
                  <td className="px-4 py-3 leading-5 text-slate-300">{item.decision}</td>
                  <td className="px-4 py-3 leading-5 text-slate-300">{item.target}</td>
                  <td className="px-4 py-3"><span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-black uppercase text-cyan-100">{item.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const sev = SEVERITY[item.severity] ?? SEVERITY.low;
          return (
            <article key={`${item.owner}-${item.text}`} className="rounded-2xl border border-slate-700/50 bg-slate-950/45 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`text-[10px] font-black uppercase ${sev.text}`}>{sev.label}</span>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-black uppercase text-cyan-100">{item.status}</span>
              </div>
              <p className="text-sm font-bold leading-6 text-white">{item.text}</p>
              <p className="mt-2 text-xs leading-5 text-slate-300"><strong>Owner:</strong> {item.owner}</p>
              <p className="text-xs leading-5 text-slate-300"><strong>Decision:</strong> {item.decision}</p>
              <p className="text-xs leading-5 text-slate-300"><strong>Target:</strong> {item.target}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StatusList({ items, icon, iconClass, initialVisible = 4, label }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialVisible);
  const remaining = items.length - visibleItems.length;

  return (
    <div>
      <ul className="space-y-1.5">
        {visibleItems.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-start gap-2 text-xs text-slate-300">
            <span className={iconClass}>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <ShowMoreButton
        expanded={expanded}
        remaining={remaining}
        label={label}
        onClick={() => setExpanded((value) => !value)}
      />
    </div>
  );
}

export default function MaySevenUpdate() {
  const u = maySevenUpdate;
  return (
    <div id="section-may7-update" className="scroll-mt-24">
      <MeganWarRoomOverview />

      {/* Banner */}
      <div className="mb-6 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
              Status update for next call
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              {u.callDate} · {u.callTime} — Tyler × Megan, Review Tenants
            </h3>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
              Brief refreshed {u.briefRefreshed}
            </span>
            <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-slate-500">
              <code>{u.briefPath}</code>
              <code>{u.runbookPath}</code>
              <code>{u.decisionLogPath}</code>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Snapshot of what's changed since the April 10 call, what each side still owes, and the agenda
          for this session. The full brief is the canonical source of truth; the DCE runbook and decision log
          are the two live working artifacts.
        </p>
      </div>

      {/* Resolved + new agenda — two-column on lg */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-500/30 bg-green-950/10 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-400">
            <span>✅</span> Closed since April 10 ({u.resolvedSinceApr10.length})
          </h4>
          <ul className="space-y-2">
            {u.resolvedSinceApr10.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <code className="mt-0.5 shrink-0 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-300">
                  {r.date}
                </code>
                <p className="text-slate-300">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-400">
            <span>🗒️</span> New on the agenda
          </h4>
          <ul className="space-y-2">
            {u.newAgendaTopics.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ActionRegister items={buildActionRegister(u)} />

      <FirefliesDecision />

      <div className="my-6 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-50">
        <strong>Lifecycle pointer:</strong> Delta Crown’s open blockers should be judged against the onboarding/offboarding workflow below, not as isolated tasks.
      </div>

      {/* Delta Crown spotlight */}
      <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/60 p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h4 className="text-base font-bold text-amber-300">Delta Crown — Model Tenant Status</h4>
            <p className="text-xs text-slate-500">First-greenfield instance of the hub-and-spoke architecture</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-300">{u.deltaCrownStatus.summary}</p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-400">
              Live ({u.deltaCrownStatus.live.length})
            </h5>
            <StatusList
              items={u.deltaCrownStatus.live}
              icon="✓"
              iconClass="text-green-400"
              initialVisible={4}
              label="live items"
            />
          </div>
          <div>
            <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              Blocked ({u.deltaCrownStatus.blocked.length})
            </h5>
            <StatusList
              items={u.deltaCrownStatus.blocked}
              icon="✗"
              iconClass="text-orange-400"
              initialVisible={3}
              label="blocked items"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
