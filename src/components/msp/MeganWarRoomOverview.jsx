import { maySevenUpdate } from '../../data/may-seven-update';

function MiniCard({ title, children, accent = 'cyan' }) {
  const border = accent === 'amber' ? 'border-amber-500/30' : accent === 'green' ? 'border-green-500/30' : 'border-cyan-500/30';
  const heading = accent === 'amber' ? 'text-amber-300' : accent === 'green' ? 'text-green-300' : 'text-cyan-300';
  return (
    <section className={`rounded-2xl border ${border} bg-slate-950/40 p-4`}>
      <h4 className={`mb-2 text-sm font-bold ${heading}`}>{title}</h4>
      {children}
    </section>
  );
}

function BulletList({ items, marker = '•' }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
          <span className="mt-0.5 text-cyan-300">{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MeganWarRoomOverview() {
  const w = maySevenUpdate.warRoom;

  return (
    <div className="mb-6 rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/30 via-slate-950/60 to-cyan-950/20 p-6 shadow-2xl shadow-fuchsia-950/20">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">May 7 War Room</p>
          <h3 className="mt-1 text-2xl font-black text-white">Tyler × Megan Alignment Brief</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{w.objective}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="./MEGAN-OVERVIEW-GUIDE-2026-05-07.md"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/25"
          >
            Open Megan Overview Guide
          </a>
          <a
            href="#source-truth-review"
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/25"
          >
            Jump to Embedded Source-of-Truth Review
          </a>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <MiniCard title="Decisions to land" accent="cyan">
          <BulletList items={w.decisionTopics} />
        </MiniCard>
        <MiniCard title="Billing / CSP snapshot" accent="amber">
          <BulletList items={w.billingSnapshot} marker="→" />
        </MiniCard>
        <MiniCard title="Collaborative framing" accent="green">
          <BulletList items={w.talkTrack} marker="✓" />
        </MiniCard>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
        <h4 className="mb-3 text-sm font-bold text-white">Repo-backed source map</h4>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {w.repoContext.map((repo) => (
            <article key={repo.name} className="rounded-xl border border-slate-700/40 bg-slate-950/50 p-3">
              <h5 className="text-sm font-bold text-cyan-200">{repo.name}</h5>
              <code className="mt-1 block break-words text-[10px] text-slate-500">{repo.path}</code>
              <p className="mt-2 text-xs leading-5 text-slate-300">{repo.relevance}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MiniCard title="Support + access request context" accent="cyan">
          <BulletList items={w.supportRouting} marker="↳" />
        </MiniCard>
        <MiniCard title="What this lets Megan do better" accent="green">
          <p className="text-sm leading-6 text-slate-300">
            Give Sui Generis clear runbooks, clean ticket context, finance-ready billing exports, and a reference tenant
            where onboarding/offboarding can be tested before rolling the pattern across HTT, TLL, BCC, and Frenchies.
          </p>
        </MiniCard>
      </div>
    </div>
  );
}
