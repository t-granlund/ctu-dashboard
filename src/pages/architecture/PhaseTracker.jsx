import { useState } from 'react';
import { PHASES } from './data';

const STATUS_STYLES = {
  complete:     { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  'in-progress': { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', bar: 'bg-amber-500' },
  'not-started': { bg: 'bg-slate-700/30', border: 'border-slate-700/50', text: 'text-slate-500', bar: 'bg-slate-700' },
};

function PhaseCard({ phase, isExpanded, onToggle }) {
  const style = STATUS_STYLES[phase.status];

  return (
    <button
        type="button"
      onClick={onToggle}
      className={`card flex-1 min-w-[160px] cursor-pointer text-left transition-all duration-200 hover:border-slate-600 ${isExpanded ? 'ring-1 ring-slate-600' : ''}`}
    >
      {/* Phase number + status */}
      <div className="flex items-center justify-between gap-2">
        <span className={`badge ${style.bg} ${style.border} border ${style.text}`}>
          Phase {phase.number}
        </span>
        <span className="text-xs text-slate-500">{phase.statusLabel}</span>
      </div>

      {/* Name */}
      <h4 className="mt-3 text-sm font-semibold text-slate-200">{phase.name}</h4>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
          style={{ width: `${phase.percent}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-slate-500">{phase.percent}%</p>

      {/* Detail (expanded) */}
      {isExpanded && (
        <p className="mt-3 border-t border-slate-700/50 pt-3 text-xs leading-relaxed text-slate-400">
          {phase.detail}
        </p>
      )}
    </button>
  );
}

export default function PhaseTracker() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <h2 className="section-title">Phase Progress Tracker</h2>

      {/* Timeline connector (desktop) */}
      <div className="relative">
        {/* Horizontal connector line - hidden on mobile */}
        <div className="absolute left-0 right-0 top-[52px] z-0 hidden h-0.5 bg-slate-800 lg:block" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:gap-3">
          {PHASES.map((phase) => (
            <PhaseCard
              key={phase.number}
              phase={phase}
              isExpanded={expanded === phase.number}
              onToggle={() => setExpanded(expanded === phase.number ? null : phase.number)}
            />
          ))}
        </div>
      </div>

      {/* Summary callout */}
      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-300">
          <span className="font-semibold">Current Position:</span>{' '}
          Phase 1 complete, Phase 2 validated and ready for live execution.
          Estimated time to Phase 2 completion: ~1.5 hours.
        </p>
      </div>
    </div>
  );
}
