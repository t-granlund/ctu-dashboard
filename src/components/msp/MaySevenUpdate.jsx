import { maySevenUpdate } from '../../data/may-seven-update';
import MeganWarRoomOverview from './MeganWarRoomOverview';
import FirefliesDecision from './FirefliesDecision';
import { Eyebrow, SectionHeader, MetaPair, StatusPill } from './atoms';

function RegisterLinks() {
  return (
    <section className="mb-8 grid gap-4 md:grid-cols-2">
      <a href="#msp-action-register" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-600">
        <Eyebrow>Working surface</Eyebrow>
        <h3 className="mt-1 text-base font-bold text-white">Open the full Action Register</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Owed-by-Megan and owed-by-Tyler work now lives as its own dashboard view instead of stretching the May 7 brief.
        </p>
        <span className="mt-3 inline-flex"><StatusPill tone="info">13 actions →</StatusPill></span>
      </a>
      <a href="#msp-decisions" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-600">
        <Eyebrow>Decision register</Eyebrow>
        <h3 className="mt-1 text-base font-bold text-white">Open Decisions & Horizon</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The hero shows a five-item slice; this view carries the open decisions, agenda context, and structural dates.
        </p>
        <span className="mt-3 inline-flex"><StatusPill tone="info">7 decisions →</StatusPill></span>
      </a>
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
      <RegisterLinks />
      <FirefliesDecision />
      <DeltaCrownSnapshot snapshot={u.deltaCrownStatus} />
    </div>
  );
}
