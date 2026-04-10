import { useState } from 'react';
import {
  findingsByTenant,
  findingsByDomain,
  topFindings,
  tenants,
  SEVERITY_COLORS,
  SEVERITY_ORDER,
  tenantColor,
} from '../data/audit-data';
import { LabeledBar } from './BarChart';
import SeverityBadge from './SeverityBadge';

/* ── Helpers ────────────────────────────────────────────── */
function buildSegments(data) {
  return SEVERITY_ORDER.map((sev) => ({
    value: data[sev] ?? 0,
    color: SEVERITY_COLORS[sev],
    label: sev,
  }));
}

/* ── Filter bar ─────────────────────────────────────────── */
function FilterPills({ options, selected, onToggle, colorFn }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              active
                ? 'ring-1 ring-white/20 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={active ? { backgroundColor: `${colorFn(opt)}33`, color: colorFn(opt) } : {}}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── Expandable finding card ────────────────────────────── */
function FindingCard({ finding }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="card cursor-pointer transition-all hover:border-slate-600"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-300">
            #{finding.rank}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{finding.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <SeverityBadge level={finding.severity} />
              <span className="text-xs text-slate-500">{finding.domain}</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">{finding.phase}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {finding.tenants.map((t) => (
            <span
              key={t}
              className="flex h-6 w-8 items-center justify-center rounded text-[10px] font-bold"
              style={{ backgroundColor: `${tenantColor(t)}33`, color: tenantColor(t) }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-300">{finding.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Remediation</p>
            <p className="mt-1 text-sm font-mono text-emerald-400">{finding.remediation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function FindingsExplorer() {
  const [sevFilter, setSevFilter] = useState([...SEVERITY_ORDER]);
  const [tenantFilter, setTenantFilter] = useState(tenants.map((t) => t.key));

  const toggle = (arr, setArr) => (val) => {
    setArr((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const filteredFindings = topFindings.filter(
    (f) =>
      sevFilter.includes(f.severity) &&
      f.tenants.some((t) => tenantFilter.includes(t)),
  );

  return (
    <section id="findings" className="space-y-8">
      <h2 className="section-title">Findings Explorer</h2>

      {/* Filters */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="mb-1 text-[10px] uppercase text-slate-600">Severity</p>
            <FilterPills
              options={SEVERITY_ORDER}
              selected={sevFilter}
              onToggle={toggle(sevFilter, setSevFilter)}
              colorFn={(s) => SEVERITY_COLORS[s]}
            />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase text-slate-600">Tenant</p>
            <FilterPills
              options={tenants.map((t) => t.key)}
              selected={tenantFilter}
              onToggle={toggle(tenantFilter, setTenantFilter)}
              colorFn={tenantColor}
            />
          </div>
        </div>
      </div>

      {/* Charts side-by-side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <p className="card-header">Findings by Tenant</p>
          <div className="space-y-3">
            {Object.entries(findingsByTenant).map(([key, data]) => (
              <LabeledBar
                key={key}
                label={key}
                segments={buildSegments(data)}
                total={data.total}
              />
            ))}
          </div>
        </div>
        <div className="card">
          <p className="card-header">Findings by Domain</p>
          <div className="space-y-3">
            {Object.entries(findingsByDomain).map(([key, data]) => (
              <LabeledBar
                key={key}
                label={key}
                segments={buildSegments(data)}
                total={data.total}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 findings */}
      <div>
        <p className="card-header">
          Top 10 Critical Findings
          <span className="ml-2 text-xs text-slate-600">
            (click to expand)
          </span>
        </p>
        <div className="space-y-3">
          {filteredFindings.map((f) => (
            <FindingCard key={f.rank} finding={f} />
          ))}
          {filteredFindings.length === 0 && (
            <p className="text-sm text-slate-500 italic">
              No findings match the current filters.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
