import { useState } from 'react';
import { lifecycleWorkflow } from '../../data/lifecycle-workflow';

const STATUS = {
  complete: { label: 'Complete', tile: 'border-green-400/50 bg-green-500/15', text: 'text-green-100', dot: 'bg-green-300' },
  'needs-megan': { label: 'Needs Megan', tile: 'border-fuchsia-400/50 bg-fuchsia-500/15', text: 'text-fuchsia-100', dot: 'bg-fuchsia-300' },
  'needs-tyler': { label: 'Needs Tyler', tile: 'border-cyan-400/50 bg-cyan-500/15', text: 'text-cyan-100', dot: 'bg-cyan-300' },
  pending: { label: 'Pending', tile: 'border-amber-400/50 bg-amber-500/15', text: 'text-amber-100', dot: 'bg-amber-300' },
  blocked: { label: 'Blocked', tile: 'border-rose-400/50 bg-rose-500/15', text: 'text-rose-100', dot: 'bg-rose-300' },
};

function StageTile({ stage, index, isActive, onSelect }) {
  const status = STATUS[stage.status] ?? STATUS.pending;
  const blockerCount = stage.blockers.length;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`group relative flex w-full flex-col gap-2 rounded-2xl border-2 p-4 text-left transition ${
        isActive
          ? `${status.tile} shadow-lg shadow-slate-950/30`
          : 'border-slate-700/50 bg-slate-950/55 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600/60 bg-slate-950/80 text-xs font-black text-white">
          {index + 1}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${status.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
        </span>
      </div>
      <p className="text-sm font-black leading-5 text-white">{stage.label}</p>
      {blockerCount > 0 && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
          ⚠ {blockerCount} blocker{blockerCount === 1 ? '' : 's'}
        </span>
      )}
    </button>
  );
}

function StageDetail({ stage }) {
  const status = STATUS[stage.status] ?? STATUS.pending;
  return (
    <article className={`rounded-3xl border-2 ${status.tile} p-6`}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${status.text}`}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
        </span>
        <h4 className="text-xl font-black text-white">{stage.label}</h4>
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-200">{stage.summary}</p>
      <dl className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Owner</dt>
          <dd className="mt-1 text-sm font-bold text-white">{stage.owner}</dd>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">System of record</dt>
          <dd className="mt-1 text-sm font-bold text-white">{stage.system}</dd>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Evidence</dt>
          <dd className="mt-1 text-sm font-bold text-white">{stage.evidence}</dd>
        </div>
      </dl>
      {stage.blockers.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">What blocks scale</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {stage.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2 text-sm leading-5 text-amber-50">
                <span aria-hidden="true">⚠</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function OffboardingFlow({ steps }) {
  return (
    <section className="mt-6 rounded-3xl border border-rose-400/30 bg-rose-950/20 p-6">
      <header className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-200">Parallel compliance lane</p>
          <h4 className="text-xl font-black text-white">Offboarding risk closure</h4>
        </div>
        <p className="max-w-xl text-xs leading-5 text-rose-100">
          Fireflies Pro has no SCIM. Offboarding must include an explicit Fireflies admin/API step or accounts stay live.
        </p>
      </header>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        {steps.map(([step, owner], index) => (
          <li key={step} className="flex flex-col rounded-xl border border-slate-700/60 bg-slate-950/65 px-3 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-200">Step {index + 1}</span>
            <p className="mt-1 text-sm font-black leading-5 text-white">{step}</p>
            <p className="mt-2 text-[11px] leading-4 text-slate-300">{owner}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function LifecycleWorkflow() {
  const workflow = lifecycleWorkflow;
  const [activeId, setActiveId] = useState(workflow.stages[1]?.id ?? workflow.stages[0].id);
  const activeStage = workflow.stages.find((stage) => stage.id === activeId) ?? workflow.stages[0];

  return (
    <section id="msp-lifecycle-workflow" className="scroll-mt-8 rounded-3xl border-2 border-cyan-400/35 bg-gradient-to-br from-cyan-950/25 via-slate-950/85 to-fuchsia-950/25 p-6 shadow-2xl shadow-cyan-950/20">
      <header className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Lifecycle cockpit</p>
          <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">{workflow.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{workflow.summary}</p>
        </div>
        <aside className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">Scale blockers · {workflow.blockers.length}</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {workflow.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2 text-[12px] leading-4 text-amber-50">
                <span aria-hidden="true">⚠</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </aside>
      </header>

      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        Click any stage to expand its detail
      </p>
      <div className="relative mb-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-7 hidden h-[2px] bg-gradient-to-r from-green-400/60 via-cyan-400/60 to-amber-400/60 xl:block" />
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
          {workflow.stages.map((stage, index) => (
            <StageTile
              key={stage.id}
              stage={stage}
              index={index}
              isActive={stage.id === activeId}
              onSelect={() => setActiveId(stage.id)}
            />
          ))}
        </div>
      </div>

      <StageDetail stage={activeStage} />

      <OffboardingFlow steps={workflow.offboarding} />
    </section>
  );
}
