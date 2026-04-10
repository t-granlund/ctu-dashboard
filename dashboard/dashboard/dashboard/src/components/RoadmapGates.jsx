import { useState, useEffect, useCallback } from 'react';
import { phases } from '../data/audit-data';
import SeverityBadge from './SeverityBadge';

/* ── LocalStorage persistence ───────────────────────────── */
const STORAGE_KEY = 'ctu-gate-signoffs';

function loadSignoffs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSignoffs(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Status helpers ─────────────────────────────────────── */
const STATUS_STYLES = {
  complete:  'bg-green-500',
  upcoming:  'bg-blue-500',
  locked:    'bg-slate-600',
};

const STATUS_LABELS = {
  complete:  'Complete',
  upcoming:  'Up Next',
  locked:    'Locked',
};

/* ── Timeline connector ─────────────────────────────────── */
function TimelineBar() {
  return (
    <div className="flex items-center gap-0">
      {phases.map((p, i) => (
        <div key={p.id} className="flex flex-1 items-center">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${STATUS_STYLES[p.status]}`}
          >
            {p.status === 'complete' ? '✓' : p.id}
          </div>
          {i < phases.length - 1 && (
            <div className={`h-0.5 flex-1 ${p.status === 'complete' ? 'bg-green-500' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Phase card ─────────────────────────────────────────── */
function PhaseCard({ phase, signoffs, onToggle, expanded, onExpand }) {
  const isOpen = expanded === phase.id;
  const isInteractive = phase.status !== 'locked';

  const checkedCount = phase.signOffItems.filter(
    (item) => signoffs[item.id] === true,
  ).length;

  return (
    <div
      className={`card transition-all ${isOpen ? 'ring-1 ring-slate-600' : ''}`}
    >
      {/* Header */}
      <button
        className="flex w-full items-start justify-between text-left"
        onClick={() => onExpand(isOpen ? null : phase.id)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${STATUS_STYLES[phase.status]}`}
          >
            {phase.status === 'complete' ? '✓' : phase.id}
          </div>
          <div>
            <p className="font-bold text-white">
              Phase {phase.id}: {phase.name}
              <span className="ml-2 text-xs text-slate-500">Weeks {phase.weeks}</span>
            </p>
            <p className="mt-0.5 text-sm text-slate-400">{phase.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`badge ${
              phase.status === 'complete'
                ? 'bg-green-500/20 text-green-400'
                : phase.status === 'upcoming'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-500/20 text-slate-400'
            }`}
          >
            {STATUS_LABELS[phase.status]}
          </span>
          <span className="text-slate-600">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-4 space-y-5 border-t border-slate-700/50 pt-4">
          {/* Gate info */}
          <div className="flex items-center gap-4 rounded-lg bg-slate-900/50 px-4 py-3">
            <div>
              <p className="text-xs uppercase text-slate-500">Gate</p>
              <p className="font-bold text-white">{phase.gate}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Approver</p>
              <p className="text-sm text-slate-300">{phase.gateApprover}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Sign-Off Progress</p>
              <p className="text-sm text-slate-300">
                {checkedCount} / {phase.signOffItems.length}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deliverables
            </p>
            <ul className="space-y-1">
              {phase.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1 text-slate-600">•</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Sign-off checklist */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sign-Off Checklist
            </p>
            <div className="space-y-2">
              {phase.signOffItems.map((item) => {
                const checked = signoffs[item.id] === true;
                const disabled = item.status === 'locked' && !isInteractive;

                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all ${
                      disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-slate-700/30'
                    } ${checked ? 'bg-green-500/5' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggle(item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 text-green-500 accent-green-500"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${checked ? 'text-green-300 line-through' : 'text-slate-200'}`}>
                        {item.text}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-slate-600">{item.id}</span>
                        <SeverityBadge level={item.priority} className="!text-[10px]" />
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function RoadmapGates() {
  const [signoffs, setSignoffs] = useState(loadSignoffs);
  const [expanded, setExpanded] = useState(1); // start with Phase 1 open

  useEffect(() => {
    saveSignoffs(signoffs);
  }, [signoffs]);

  const toggle = useCallback((id) => {
    setSignoffs((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <section id="roadmap" className="space-y-8">
      <h2 className="section-title">Roadmap &amp; Gates</h2>

      {/* Horizontal timeline */}
      <div className="card">
        <TimelineBar />
        <div className="mt-3 flex">
          {phases.map((p) => (
            <div key={p.id} className="flex-1 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-300">{p.name}</p>
              <p>Wk {p.weeks}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-4">
        {phases.map((p) => (
          <PhaseCard
            key={p.id}
            phase={p}
            signoffs={signoffs}
            onToggle={toggle}
            expanded={expanded}
            onExpand={setExpanded}
          />
        ))}
      </div>

      {/* Persistence note */}
      <p className="text-center text-[10px] text-slate-600">
        ✦ Sign-off checkboxes are persisted to browser localStorage — safe to close and reopen.
      </p>
    </section>
  );
}
