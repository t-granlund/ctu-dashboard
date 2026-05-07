import { vendors, blindSpots } from '../../data/msp-data';

const GROUP_META = {
  confirmed_remove: { label: 'Remove', icon: '🗑️', color: 'text-red-400', border: 'border-red-500/30' },
  confirmed_keep:   { label: 'Keep & Scope', icon: '✅', color: 'text-green-400', border: 'border-green-500/30' },
  needs_followup:   { label: 'Needs Follow-up', icon: '⏳', color: 'text-yellow-400', border: 'border-yellow-500/30' },
  not_discussed:    { label: 'Not Discussed', icon: '❓', color: 'text-slate-400', border: 'border-slate-600/30' },
};

const GROUP_ORDER = ['confirmed_remove', 'confirmed_keep', 'needs_followup', 'not_discussed'];

function VendorGroup({ groupKey, vendorList }) {
  const meta = GROUP_META[groupKey];
  if (!vendorList.length) return null;

  return (
    <div className={`rounded-xl border ${meta.border} bg-slate-800/60 p-4 backdrop-blur-sm`}>
      <h4 className={`mb-3 flex items-center gap-2 text-sm font-bold ${meta.color}`}>
        <span>{meta.icon}</span>
        <span>{meta.label}</span>
        <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
          {vendorList.length}
        </span>
      </h4>
      <ul className="space-y-2">
        {vendorList.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2">
            <div>
              <span className="text-sm font-medium text-slate-200">{v.name}</span>
              <span className="ml-2 text-xs text-slate-500">{v.category}</span>
            </div>
            <div className="flex gap-1">
              {v.foundIn.map((t) => (
                <span key={t} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  {t}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ActionItems({ state, exportNotes }) {
  // Group vendors by status (exclude "removed" vendors like Franworth)
  const activeVendors = vendors.filter((v) => v.status !== 'removed');
  const grouped = {};
  for (const key of GROUP_ORDER) grouped[key] = [];

  for (const v of activeVendors) {
    const status = state.vendorStatuses[v.id] ?? 'not_discussed';
    (grouped[status] ??= []).push(v);
  }

  // Count questions
  const totalBlindSpotQ = blindSpots.reduce((s, c) => s + c.items.length, 0);
  const answeredBlindSpotQ = Object.values(state.askedQuestions).filter(Boolean).length;

  const totalVendorQ = activeVendors.reduce((s, v) => s + v.whatWeNeedToKnow.length, 0);
  const answeredVendorQ = Object.values(state.vendorQuestions).filter(Boolean).length;

  const totalQ = totalBlindSpotQ + totalVendorQ;
  const answeredQ = answeredBlindSpotQ + answeredVendorQ;

  return (
    <div>
      <h3 className="mb-2 text-xl font-bold text-white">Action Items</h3>
      <p className="mb-6 text-sm text-slate-400">
        Auto-generated from vendor statuses and question tracking above.
      </p>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {GROUP_ORDER.map((key) => {
          const meta = GROUP_META[key];
          return (
            <div key={key} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 text-center">
              <p className="text-2xl font-extrabold text-white">{grouped[key].length}</p>
              <p className={`text-xs font-medium ${meta.color}`}>
                {meta.icon} {meta.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Questions progress */}
      <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            Questions Progress
          </span>
          <span className="text-sm font-bold text-cyan-400">
            {answeredQ}/{totalQ}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all"
            style={{ width: totalQ > 0 ? `${(answeredQ / totalQ) * 100}%` : '0%' }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Blind spots: {answeredBlindSpotQ}/{totalBlindSpotQ}</span>
          <span>Vendor Qs: {answeredVendorQ}/{totalVendorQ}</span>
        </div>
      </div>

      {/* Grouped vendor lists */}
      <div className="mb-6 space-y-4">
        {GROUP_ORDER.map((key) => (
          <VendorGroup key={key} groupKey={key} vendorList={grouped[key]} />
        ))}
      </div>

      {/* Franworth — resolved */}
      {vendors.some((v) => v.status === 'removed') && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-950/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-green-400">
            <span>🎉</span>
            <span>Resolved</span>
          </h4>
          {vendors
            .filter((v) => v.status === 'removed')
            .map((v) => (
              <p key={v.id} className="text-sm text-green-300/70">
                {v.name} — {v.recommendedAction}
              </p>
            ))}
        </div>
      )}

      {/* Export button */}
      <button
        type="button"
        onClick={exportNotes}
        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 print:hidden"
      >
        📥 Export Notes (JSON)
      </button>
    </div>
  );
}
