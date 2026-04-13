import { callActionItems } from '../../data/msp-data';

const PRIORITY_LABEL = {
  immediate: { color: 'text-red-400', dot: 'bg-red-400' },
  'this-week': { color: 'text-orange-400', dot: 'bg-orange-400' },
  'next-week': { color: 'text-yellow-400', dot: 'bg-yellow-400' },
  ongoing: { color: 'text-blue-400', dot: 'bg-blue-400' },
  'post-convention': { color: 'text-purple-400', dot: 'bg-purple-400' },
  'when-ready': { color: 'text-slate-500', dot: 'bg-slate-500' },
};

export default function PostCallSummary() {
  const meganItems = callActionItems.filter((i) => i.owner === 'Megan' || i.owner === 'Both');

  return (
    <div id="section-summary" className="scroll-mt-24">
      {/* Call recap — compact */}
      <div className="mb-8 rounded-2xl border border-slate-700/30 bg-slate-900/50 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Call Recap</h3>
            <p className="text-sm text-slate-500">April 10, 2026 · Tyler × Megan</p>
          </div>
          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
            Completed
          </span>
        </div>

        {/* Key outcomes — clean bullet list, not a card grid */}
        <div className="space-y-3 text-sm">
          {[
            { icon: "✅", text: "AppRiver migration confirmed 100% complete — all 3 service principals approved for removal" },
            { icon: "✅", text: "Entra ID P2 already purchased on every tenant (blanket license via PAX8)" },
            { icon: "✅", text: "Conditional Access deployed on DCE and FN — our audit data was stale" },
            { icon: "✅", text: "TD SYNNEX can't be removed but GDAP already revoked — low risk" },
            { icon: "✅", text: "Atera confirmed as RMM tool — Delta Crown going all-Mac with MDM" },
            { icon: "⏳", text: "Bishops MFA planned for post-convention to avoid support issues" },
            { icon: "⏳", text: "BCC license migration to PAX8 in progress — most end July/August" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
              <p className="text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Megan's action items only */}
      <h4 className="mb-4 text-base font-bold text-white">Your Action Items</h4>
      <div className="space-y-2">
        {meganItems.map((item, i) => {
          const p = PRIORITY_LABEL[item.priority] || PRIORITY_LABEL['when-ready'];
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-700/30 bg-slate-800/30 px-4 py-3">
              <div className={`h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
              <p className="flex-1 text-sm text-slate-300">{item.action}</p>
              <span className={`text-xs font-medium ${p.color}`}>
                {item.priority.replace('-', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
