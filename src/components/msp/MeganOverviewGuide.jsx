import { meganOverviewGuide } from '../../data/megan-overview-guide';

function GuideCard({ eyebrow, title, children, tone = 'cyan' }) {
  const tones = {
    cyan: ['border-cyan-500/30', 'text-cyan-300'],
    fuchsia: ['border-fuchsia-500/30', 'text-fuchsia-300'],
    amber: ['border-amber-500/30', 'text-amber-300'],
    green: ['border-green-500/30', 'text-green-300'],
  };
  const [border, heading] = tones[tone];
  return (
    <section className={`rounded-2xl border ${border} bg-slate-950/45 p-5`}>
      {eyebrow && <p className={`mb-1 text-[10px] font-black uppercase tracking-[0.2em] ${heading}`}>{eyebrow}</p>}
      <h4 className="mb-3 text-base font-black text-white">{title}</h4>
      {children}
    </section>
  );
}

function BulletList({ items, marker = '•', className = '' }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-xs leading-5 text-slate-300">
          <span className="mt-0.5 text-cyan-300">{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
        <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((column) => <th key={column} className="px-4 py-3 font-black">{column}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/35">
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="align-top">
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

function StepRail({ items }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-xl border border-slate-800/70 bg-slate-950/50 p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-black text-cyan-200">
            {index + 1}
          </span>
          <span className="text-xs leading-5 text-slate-300">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function MeganOverviewGuide() {
  const guide = meganOverviewGuide;

  return (
    <section id="megan-overview-guide" className="scroll-mt-8 rounded-3xl border-2 border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-950/30 via-slate-950/75 to-cyan-950/20 p-6 shadow-2xl shadow-fuchsia-950/20">
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">Designed call guide</p>
          <h3 className="mt-1 text-2xl font-black text-white">{guide.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{guide.purpose}</p>
          <p className="mt-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-xs leading-5 text-cyan-100">
            {guide.note}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Call details</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div><dt className="text-xs text-slate-500">Call</dt><dd className="font-bold text-white">{guide.call}</dd></div>
            <div><dt className="text-xs text-slate-500">Time</dt><dd className="font-bold text-white">{guide.time}</dd></div>
            <div><dt className="text-xs text-slate-500">Date</dt><dd className="font-bold text-white">{guide.date}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <GuideCard eyebrow="Operating model" title="HTT owns the standard" tone="cyan">
          <BulletList items={guide.operatingModel.htt} />
        </GuideCard>
        <GuideCard eyebrow="Operating model" title="Sui Generis operationalizes" tone="fuchsia">
          <BulletList items={guide.operatingModel.suiGeneris} />
        </GuideCard>
        <GuideCard eyebrow="Takeaway" title="Collaboration frame" tone="green">
          <p className="text-sm leading-6 text-slate-300">{guide.operatingModel.takeaway}</p>
        </GuideCard>
      </div>

      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-black text-white">Current priority picture</h4>
        <Table columns={['Area', 'Where we are today', 'What we need from Megan']} rows={guide.priorities} />
      </div>

      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-black text-white">Repo-backed source map</h4>
        <Table columns={['Repo', 'What it supplies', 'Relevance for Megan']} rows={guide.repoMap} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <GuideCard eyebrow="DCE model tenant" title="Live today" tone="green">
          <p className="mb-3 text-xs leading-5 text-slate-300">{guide.deltaCrown.summary}</p>
          <BulletList items={guide.deltaCrown.live} marker="✓" />
        </GuideCard>
        <GuideCard eyebrow="DCE model tenant" title="Blocked / open" tone="amber">
          <BulletList items={guide.deltaCrown.blocked} marker="!" />
        </GuideCard>
        <GuideCard eyebrow="DCE model tenant" title="Validation flow" tone="cyan">
          <StepRail items={guide.deltaCrown.validationFlow} />
        </GuideCard>
      </div>

      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-black text-white">Billing / CSP questions to land today</h4>
        <Table columns={['Topic', 'Question']} rows={guide.billingQuestions} />
        <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-100">
          Finance end goal: one clear per-tenant view of current spend, renewal dates, and projected run-rate.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GuideCard eyebrow="Security" title="Already confirmed by Megan" tone="green">
          <BulletList items={guide.security.confirmed} marker="✓" />
        </GuideCard>
        <GuideCard eyebrow="Security" title="Open asks" tone="amber">
          <BulletList items={guide.security.openAsks} marker="→" />
        </GuideCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GuideCard eyebrow="Governance" title="Groups and distribution lists" tone="cyan">
          <BulletList items={guide.groups} marker="↳" />
        </GuideCard>
        <GuideCard eyebrow="Support routing" title="How the hubs help Megan" tone="fuchsia">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <BulletList items={guide.supportHubs.groupsHub} marker="G" />
            <BulletList items={guide.supportHubs.peopleSupportHub} marker="P" />
            <BulletList items={guide.supportHubs.helpsMegan} marker="✓" />
          </div>
        </GuideCard>
      </div>

      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-black text-white">Requested outcomes before ending the call</h4>
        <Table columns={['Outcome', 'Owner', 'Target']} rows={guide.outcomes} />
      </div>

      <blockquote className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-5 text-sm leading-7 text-fuchsia-50">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Closing script</p>
        “{guide.closingScript}”
      </blockquote>
    </section>
  );
}
