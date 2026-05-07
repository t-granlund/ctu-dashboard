import { sourceTruthReview } from '../../data/source-truth-review';

function Pill({ children, tone = 'cyan' }) {
  const classes = {
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    green: 'border-green-400/30 bg-green-500/10 text-green-100',
    rose: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${classes[tone]}`}>
      {children}
    </span>
  );
}

function List({ items, marker = '•', markerClass = 'text-cyan-300' }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-xs leading-5 text-slate-300">
          <span className={`mt-0.5 ${markerClass}`}>{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Matrix({ columns, rows, caption }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-black">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/35">
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 leading-5 text-slate-300">
                  {cellIndex === 0 ? <strong className="text-slate-100">{cell}</strong> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewCard({ title, children, tone = 'cyan' }) {
  const borders = {
    cyan: 'border-cyan-500/30',
    amber: 'border-amber-500/30',
    green: 'border-green-500/30',
    rose: 'border-rose-500/30',
  };
  const headings = {
    cyan: 'text-cyan-200',
    amber: 'text-amber-200',
    green: 'text-green-200',
    rose: 'text-rose-200',
  };
  return (
    <section className={`rounded-2xl border ${borders[tone]} bg-slate-950/40 p-5`}>
      <h4 className={`mb-3 text-sm font-black ${headings[tone]}`}>{title}</h4>
      {children}
    </section>
  );
}

function RepoReview({ repo }) {
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-950/45 p-5">
      <div className="mb-4">
        <h4 className="text-lg font-black text-white">{repo.name}</h4>
        <code className="mt-1 block break-words text-[10px] text-slate-500">{repo.path}</code>
        <p className="mt-2 text-sm leading-6 text-slate-300">{repo.role}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCard title="Canonical files" tone="cyan">
          <List items={repo.canonical} marker="↳" />
        </ReviewCard>
        <ReviewCard title="What it proves" tone="green">
          <List items={repo.proves} marker="✓" markerClass="text-green-300" />
        </ReviewCard>
        <ReviewCard title="Current state" tone="amber">
          <List items={repo.state} marker="→" markerClass="text-amber-300" />
        </ReviewCard>
        <ReviewCard title="Risks / cleanup" tone="rose">
          <List items={repo.risks} marker="!" markerClass="text-rose-300" />
        </ReviewCard>
      </div>
    </article>
  );
}

export default function SourceTruthReview() {
  const review = sourceTruthReview;

  return (
    <section id="source-truth-review" className="scroll-mt-8 rounded-3xl border-2 border-cyan-500/35 bg-gradient-to-br from-cyan-950/25 via-slate-950/75 to-fuchsia-950/15 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Internal source-of-truth map</p>
          <h3 className="mt-1 text-2xl font-black text-white">{review.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            {review.date} · {review.purpose}
          </p>
        </div>
        <div className="flex max-w-xl flex-wrap gap-2">
          {review.scope.map((item) => <Pill key={item}>{item}</Pill>)}
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ReviewCard title="Executive verdict" tone="green">
          <List items={review.verdict} marker="✓" markerClass="text-green-300" />
        </ReviewCard>
        <ReviewCard title="Dependency graph" tone="cyan">
          <List items={review.dependencyGraph} marker="→" />
        </ReviewCard>
        <ReviewCard title="Call framing" tone="amber">
          <List items={review.callFraming} marker="★" markerClass="text-amber-300" />
        </ReviewCard>
      </div>

      <div className="mb-8 space-y-4">
        <h4 className="text-lg font-black text-white">Portfolio source-of-truth map</h4>
        <Matrix caption="Portfolio source-of-truth map" columns={['Domain', 'Source of truth', 'Supporting repos']} rows={review.sourceMap} />
      </div>

      <div className="mb-8 space-y-5">
        <h4 className="text-lg font-black text-white">Repo-by-repo review</h4>
        {review.repos.map((repo) => <RepoReview key={repo.name} repo={repo} />)}
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <section>
          <h4 className="mb-4 text-lg font-black text-white">MSP / CSP / Pax8 billing map</h4>
          <Matrix caption="MSP, CSP, and Pax8 billing map" columns={['Bucket', 'Owner', 'Current state', 'Megan ask']} rows={review.billing} />
        </section>
        <section>
          <h4 className="mb-4 text-lg font-black text-white">Unified identity model</h4>
          <Matrix caption="Unified identity model" columns={['Field', 'Purpose', 'Consumers']} rows={review.identityModel} />
        </section>
      </div>

      <div className="mb-8 space-y-4">
        <h4 className="text-lg font-black text-white">Prioritized post-call cleanup backlog</h4>
        <Matrix caption="Prioritized post-call cleanup backlog" columns={['Priority', 'Task', 'Repo']} rows={review.backlog} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCard title="Safe to screen-share / discuss" tone="green">
          <List items={review.shareGuidance.safe} marker="✓" markerClass="text-green-300" />
        </ReviewCard>
        <ReviewCard title="Keep internal or sanitized" tone="rose">
          <List items={review.shareGuidance.internal} marker="!" markerClass="text-rose-300" />
        </ReviewCard>
      </div>

      <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs leading-5 text-amber-100">
        Password-gate note: this page is protected by the dashboard passphrase, but it is still static GitHub Pages client-side protection.
        Keep secrets, raw PII, tenant-changing scripts, and tokens out of here. The dog insists. 🐶
      </p>
    </section>
  );
}
