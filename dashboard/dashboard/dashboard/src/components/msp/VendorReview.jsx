import { useState } from 'react';
import { vendors, STATUS_OPTIONS } from '../../data/msp-data';

const RISK_STYLES = {
  low:      'bg-green-500/20 text-green-300',
  medium:   'bg-yellow-500/20 text-yellow-300',
  high:     'bg-red-500/20 text-red-300',
  resolved: 'bg-slate-500/20 text-slate-400',
};

const RISK_BORDER = {
  low:      'border-green-500/30',
  medium:   'border-yellow-500/30',
  high:     'border-red-500/30',
  resolved: 'border-slate-600/30',
};

function VendorCard({
  vendor,
  vendorStatus,
  vendorNote,
  vendorQuestions,
  onStatusChange,
  onNoteChange,
  onQuestionToggle,
}) {
  const [open, setOpen] = useState(false);
  const currentStatus = vendorStatus ?? 'not_discussed';
  const statusOpt = STATUS_OPTIONS.find((s) => s.value === currentStatus);
  const isRemoved = vendor.status === 'removed';

  return (
    <div
      className={`overflow-hidden rounded-xl border backdrop-blur-sm transition-colors ${
        RISK_BORDER[vendor.riskLevel]
      } bg-slate-800/60`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-800/80"
      >
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              RISK_STYLES[vendor.riskLevel]
            }`}
          >
            {vendor.riskLevel}
          </span>
          <div>
            <h4 className="text-sm font-bold text-white">{vendor.name}</h4>
            <p className="text-xs text-slate-500">{vendor.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: `${statusOpt.color}20`, color: statusOpt.color }}
          >
            {statusOpt.label}
          </span>
          {/* Found-in pills */}
          <div className="hidden gap-1 sm:flex">
            {vendor.foundIn.map((t) => (
              <span key={t} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                {t}
              </span>
            ))}
            {vendor.notFoundIn.map((t) => (
              <span key={t} className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-600 line-through">
                {t}
              </span>
            ))}
          </div>
          <span className="text-slate-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="space-y-4 border-t border-slate-700/50 p-5">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>
              Domain: <code className="text-slate-400">{vendor.domain}</code>
            </span>
            <span>
              Tenant: <code className="text-slate-400">{vendor.tenantId.slice(0, 8)}…</code>
            </span>
          </div>

          {/* What We Found */}
          <div>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              What We Found
            </h5>
            <ul className="space-y-1.5">
              {vendor.whatWeFound.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 shrink-0 text-cyan-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What We Need to Know — with checkboxes */}
          {vendor.whatWeNeedToKnow.length > 0 && (
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                What We Need to Know
              </h5>
              <ul className="space-y-2">
                {vendor.whatWeNeedToKnow.map((q, i) => {
                  const qKey = `${vendor.id}-${i}`;
                  const checked = vendorQuestions[qKey] ?? false;
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <button
                        onClick={() => onQuestionToggle(qKey)}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-colors ${
                          checked
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-slate-600 text-transparent hover:border-cyan-500'
                        }`}
                      >
                        ✓
                      </button>
                      <span
                        className={`text-sm ${
                          checked ? 'text-green-300/60 line-through' : 'text-slate-300'
                        }`}
                      >
                        {q}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Recommended Action */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3">
            <p className="text-xs text-slate-500">
              <strong className="text-slate-400">Recommended:</strong>{' '}
              {vendor.recommendedAction}
            </p>
          </div>

          {/* Status dropdown + Notes — skipped for "removed" vendors */}
          {!isRemoved && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Status dropdown */}
              <div className="shrink-0">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => onStatusChange(vendor.id, e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes textarea */}
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Notes
                </label>
                <textarea
                  value={vendorNote ?? ''}
                  onChange={(e) => onNoteChange(vendor.id, e.target.value)}
                  placeholder="Meeting notes, MSP response…"
                  rows={2}
                  className="w-full resize-y rounded-md border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorReview({
  state,
  setVendorStatus,
  setVendorNote,
  toggleVendorQuestion,
}) {
  return (
    <div>
      <h3 className="mb-2 text-xl font-bold text-white">Vendor Review</h3>
      <p className="mb-6 text-sm text-slate-400">
        {vendors.length} external vendors/partners found across all tenants.
        Click each card to expand findings and record decisions.
      </p>
      <div className="space-y-3">
        {vendors.map((v) => (
          <VendorCard
            key={v.id}
            vendor={v}
            vendorStatus={state.vendorStatuses[v.id]}
            vendorNote={state.vendorNotes[v.id]}
            vendorQuestions={state.vendorQuestions}
            onStatusChange={setVendorStatus}
            onNoteChange={setVendorNote}
            onQuestionToggle={toggleVendorQuestion}
          />
        ))}
      </div>
    </div>
  );
}
