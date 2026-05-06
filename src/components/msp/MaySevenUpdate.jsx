import { maySevenUpdate } from '../../data/msp-data';

const SEVERITY = {
  high: { dot: 'bg-red-400', text: 'text-red-300', label: 'High' },
  medium: { dot: 'bg-yellow-400', text: 'text-yellow-300', label: 'Medium' },
  low: { dot: 'bg-slate-500', text: 'text-slate-400', label: 'Low' },
};

function OwedList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const sev = SEVERITY[item.severity] ?? SEVERITY.low;
        return (
          <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-700/30 bg-slate-900/40 px-3 py-2">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
            <p className="flex-1 text-sm text-slate-300">{item.text}</p>
            <span className={`shrink-0 text-[10px] font-bold uppercase ${sev.text}`}>{sev.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function MaySevenUpdate() {
  const u = maySevenUpdate;
  return (
    <div id="section-may7-update" className="scroll-mt-24">
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
            <code className="mt-1 text-[10px] text-slate-500">{u.briefPath}</code>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Snapshot of what's changed since the April 10 call, what each side still owes, and the agenda
          for tomorrow's session. The full brief is the canonical source of truth — this is the dashboard mirror.
        </p>
      </div>

      {/* Resolved + new agenda — two-column on lg */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-500/30 bg-green-950/10 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-400">
            <span>✅</span> Resolved since April 10 ({u.resolvedSinceApr10.length})
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

      {/* Owed lists — two columns */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/50 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <span>📥</span> Still owed by Megan ({u.stillOwedByMegan.length})
          </h4>
          <OwedList items={u.stillOwedByMegan} />
        </div>
        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/50 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <span>📤</span> Still owed by Tyler ({u.stillOwedByTyler.length})
          </h4>
          <OwedList items={u.stillOwedByTyler} />
        </div>
      </div>

      {/* Delta Crown spotlight */}
      <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/60 p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h4 className="text-base font-bold text-amber-300">Delta Crown — Golden Child Status</h4>
            <p className="text-xs text-slate-500">First-greenfield instance of the hub-and-spoke architecture</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-300">{u.deltaCrownStatus.summary}</p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-400">
              Live ({u.deltaCrownStatus.live.length})
            </h5>
            <ul className="space-y-1.5">
              {u.deltaCrownStatus.live.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-green-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              Blocked ({u.deltaCrownStatus.blocked.length})
            </h5>
            <ul className="space-y-1.5">
              {u.deltaCrownStatus.blocked.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-orange-400">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
