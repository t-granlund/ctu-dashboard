import { lifecycleWorkflow } from '../../data/lifecycle-workflow';

const STATUS = {
  complete: { label: 'Complete', className: 'border-green-400/40 bg-green-500/15 text-green-100', dot: 'bg-green-300' },
  'needs-megan': { label: 'Needs Megan', className: 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100', dot: 'bg-fuchsia-300' },
  'needs-tyler': { label: 'Needs Tyler', className: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100', dot: 'bg-cyan-300' },
  pending: { label: 'Pending', className: 'border-amber-400/40 bg-amber-500/15 text-amber-100', dot: 'bg-amber-300' },
  blocked: { label: 'Blocked', className: 'border-rose-400/40 bg-rose-500/15 text-rose-100', dot: 'bg-rose-300' },
};

function StatusBadge({ status }) {
  const current = STATUS[status] ?? STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${current.className}`}>
      <span className={`h-2 w-2 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

function StageCard({ stage, index }) {
  return (
    <article className="group relative rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4 shadow-xl shadow-slate-950/25 transition hover:-translate-y-1 hover:border-cyan-300/60">
      <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/40 bg-slate-950 text-xs font-black text-cyan-100 shadow-lg shadow-cyan-950/30">
        {index + 1}
      </div>
      <div className="pt-5">
        <StatusBadge status={stage.status} />
        <h4 className="mt-3 text-base font-black text-white">{stage.label}</h4>
        <p className="mt-2 text-xs leading-5 text-slate-300">{stage.summary}</p>
        <dl className="mt-4 space-y-2 text-[11px] leading-5">
          <div>
            <dt className="font-black uppercase tracking-[0.16em] text-slate-500">Owner</dt>
            <dd className="text-slate-200">{stage.owner}</dd>
          </div>
          <div>
            <dt className="font-black uppercase tracking-[0.16em] text-slate-500">System</dt>
            <dd className="text-slate-200">{stage.system}</dd>
          </div>
          <div>
            <dt className="font-black uppercase tracking-[0.16em] text-slate-500">Evidence</dt>
            <dd className="text-slate-300">{stage.evidence}</dd>
          </div>
        </dl>
        {stage.blockers.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Blocks scale</p>
            <ul className="mt-2 space-y-1">
              {stage.blockers.map((blocker) => (
                <li key={blocker} className="text-xs leading-5 text-amber-100">• {blocker}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function OffboardingRail({ steps }) {
  return (
    <section className="rounded-3xl border border-rose-400/30 bg-rose-950/20 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-200">Parallel compliance lane</p>
          <h4 className="text-xl font-black text-white">Offboarding risk closure</h4>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          This is where SaaS lifecycle gaps become real. Fireflies Pro has no SCIM, so offboarding must include an explicit Fireflies admin/API step.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {steps.map(([step, owner, system, note], index) => (
          <article key={step} className="relative rounded-2xl border border-slate-700/60 bg-slate-950/65 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-xs font-black text-rose-100">{index + 1}</span>
              <h5 className="text-sm font-black text-white">{step}</h5>
            </div>
            <p className="text-[11px] font-bold text-slate-300">{owner}</p>
            <p className="mt-1 text-[11px] text-slate-400">{system}</p>
            <p className="mt-3 text-xs leading-5 text-rose-100">{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function LifecycleWorkflow() {
  const workflow = lifecycleWorkflow;
  return (
    <section id="msp-lifecycle-workflow" className="scroll-mt-8 rounded-3xl border-2 border-cyan-400/35 bg-gradient-to-br from-cyan-950/25 via-slate-950/85 to-fuchsia-950/25 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Lifecycle cockpit</p>
          <h3 className="mt-1 text-3xl font-black text-white">{workflow.title}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{workflow.summary}</p>
        </div>
        <aside className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">Scale blockers</p>
          <ul className="mt-3 space-y-2">
            {workflow.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2 text-xs leading-5 text-amber-100">
                <span aria-hidden="true">⚠</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="relative mb-6">
        <div aria-hidden="true" className="absolute left-6 top-8 hidden h-1 w-[calc(100%-3rem)] rounded-full bg-gradient-to-r from-green-300 via-cyan-300 via-fuchsia-300 to-amber-300 opacity-60 xl:block" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">
          {workflow.stages.map((stage, index) => <StageCard key={stage.id} stage={stage} index={index} />)}
        </div>
      </div>

      <OffboardingRail steps={workflow.offboarding} />
    </section>
  );
}
