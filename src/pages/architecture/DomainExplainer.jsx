import { useState } from 'react';
import { AUDIT_DOMAINS } from './data';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Critical' },
  high:     { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'High' },
  medium:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Medium' },
};

function DomainCard({ domain, isExpanded, onToggle }) {
  const sev = SEVERITY_STYLES[domain.severity];

  return (
    <div className={`card transition-all duration-200 ${isExpanded ? 'ring-1 ring-slate-600' : ''}`}>
      {/* Header row — always visible */}
      <button onClick={onToggle} className="flex w-full items-start gap-4 text-left">
        {/* Icon */}
        <span className="mt-0.5 text-2xl" role="img" aria-hidden="true">{domain.icon}</span>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-slate-100">{domain.title}</h4>
            <span className={`badge ${sev.bg} ${sev.border} border ${sev.text}`}>{sev.label}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{domain.what}</p>
        </div>

        {/* Expand chevron */}
        <svg
          className={`mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-slate-700/50 pt-4">
          <DetailSection title="What It Is" content={domain.what} />
          <DetailSection title="Why It Matters" content={domain.why} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-800/40 p-3">
              <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Current Status</h5>
              <p className="text-sm text-slate-300">{domain.currentStatus}</p>
            </div>
            <div className={`rounded-lg border ${sev.border} ${sev.bg} p-3`}>
              <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Key Metric</h5>
              <p className={`text-sm font-medium ${sev.text}`}>{domain.metric}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, content }) {
  return (
    <div>
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h5>
      <p className="text-sm leading-relaxed text-slate-300">{content}</p>
    </div>
  );
}

export default function DomainExplainer() {
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (expanded.size === AUDIT_DOMAINS.length) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(AUDIT_DOMAINS.map((d) => d.id)));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title mb-0">Understanding the 7 Audit Domains</h2>
        <button
          onClick={expandAll}
          className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
        >
          {expanded.size === AUDIT_DOMAINS.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-4">
        {AUDIT_DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            isExpanded={expanded.has(domain.id)}
            onToggle={() => toggle(domain.id)}
          />
        ))}
      </div>

      {/* Domain count summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-3">
        {Object.entries(SEVERITY_STYLES).map(([key, style]) => {
          const count = AUDIT_DOMAINS.filter((d) => d.severity === key).length;
          return (
            <div key={key} className={`rounded-xl border ${style.border} ${style.bg} p-4 text-center`}>
              <p className={`text-2xl font-extrabold ${style.text}`}>{count}</p>
              <p className="mt-1 text-xs text-slate-400">{style.label} Domains</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
