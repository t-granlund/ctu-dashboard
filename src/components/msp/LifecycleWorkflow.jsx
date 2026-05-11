import { useState } from 'react';
import { lifecycleWorkflow } from '../../data/lifecycle-workflow';
import { Eyebrow, SectionHeader, MetaPair } from './atoms';

// Status uses three-channel encoding consistent with the matrix:
// position (in the stepper) + glyph (filled vs outline ring) + ordinal hue.
// Colors are inline so they survive the global accent flatten in both themes.
const STATUS = {
  complete:      { label: 'Complete',     color: '#34d399', filled: true  },
  'needs-tyler': { label: 'Needs Tyler',  color: '#94a3b8', filled: false },
  'needs-megan': { label: 'Needs Megan',  color: '#94a3b8', filled: false },
  pending:       { label: 'Pending',      color: '#fbbf24', filled: false },
  blocked:       { label: 'Blocked',      color: '#fb7185', filled: true  },
};

function StatusDot({ status, size = 8 }) {
  const meta = STATUS[status] ?? STATUS.pending;
  const style = meta.filled
    ? { background: meta.color }
    : { boxShadow: `inset 0 0 0 1.5px ${meta.color}` };
  return <span aria-hidden="true" style={{ ...style, width: size, height: size }} className="inline-block rounded-full" />;
}

function StageTile({ stage, index, isActive, onSelect }) {
  const meta = STATUS[stage.status] ?? STATUS.pending;
  const blockerCount = stage.blockers.length;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`group flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition ${
        isActive
          ? 'border-slate-300 bg-slate-900'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] tabular-nums text-slate-400">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
          <StatusDot status={stage.status} />
          {meta.label}
        </span>
      </div>
      <p className="text-sm font-bold leading-5 text-white">{stage.label}</p>
      {blockerCount > 0 && (
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
          {blockerCount} blocker{blockerCount === 1 ? '' : 's'}
        </span>
      )}
    </button>
  );
}

function StageDetail({ stage }) {
  const meta = STATUS[stage.status] ?? STATUS.pending;
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
          <StatusDot status={stage.status} size={10} />
          {meta.label}
        </span>
        <h4 className="text-xl font-bold text-white">{stage.label}</h4>
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-300">{stage.summary}</p>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <MetaPair label="Owner" value={stage.owner} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <MetaPair label="System of record" value={stage.system} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <MetaPair label="Evidence" value={stage.evidence} />
        </div>
      </div>
      {stage.blockers.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <Eyebrow>What blocks scale</Eyebrow>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {stage.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2 text-sm leading-5 text-slate-200">
                <span aria-hidden="true" style={{ color: '#fbbf24' }} className="font-bold">○</span>
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
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <SectionHeader
        eyebrow="Parallel compliance lane"
        title="Offboarding risk closure"
        sub="Fireflies Pro has no SCIM. Offboarding must include an explicit Fireflies admin/API step or accounts stay live."
      />
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        {steps.map(([step, owner], index) => (
          <li key={step} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] tabular-nums text-slate-400">
              Step {String(index + 1).padStart(2, '0')}
            </span>
            <p className="mt-1 text-sm font-bold leading-5 text-white">{step}</p>
            <p className="mt-2 text-[11px] leading-4 text-slate-400">{owner}</p>
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
    <section id="msp-lifecycle-workflow" className="scroll-mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
        <div>
          <Eyebrow>Lifecycle cockpit</Eyebrow>
          <h3 className="mt-1 text-xl font-bold text-white">{workflow.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{workflow.summary}</p>
        </div>
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Eyebrow>Scale blockers · {workflow.blockers.length}</Eyebrow>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {workflow.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2 text-xs leading-5 text-slate-200">
                <span aria-hidden="true" style={{ color: '#fbbf24' }} className="font-bold">○</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </aside>
      </header>

      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Click any stage to expand its detail
      </p>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
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

      <StageDetail stage={activeStage} />
      <OffboardingFlow steps={workflow.offboarding} />
    </section>
  );
}
