import { callAgenda, callActionItems } from '../../data/msp-data';

const PRIORITY_BADGE = {
  immediate: 'bg-red-500/20 text-red-300',
  'this-week': 'bg-orange-500/20 text-orange-300',
  'next-week': 'bg-yellow-500/20 text-yellow-300',
  ongoing: 'bg-blue-500/20 text-blue-300',
  'post-convention': 'bg-purple-500/20 text-purple-300',
  'when-ready': 'bg-slate-600/30 text-slate-400',
};

const STATUS_BADGE = {
  ready: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-300',
  'in-progress': 'bg-blue-500/20 text-blue-300',
  planned: 'bg-purple-500/20 text-purple-300',
  blocked: 'bg-red-500/20 text-red-300',
  'waiting-on-megan': 'bg-cyan-500/20 text-cyan-300',
};

export default function PostCallSummary() {
  const meganItems = callActionItems.filter((i) => i.owner === 'Megan' || i.owner === 'Both');
  const tylerItems = callActionItems.filter((i) => i.owner === 'Tyler');

  return (
    <div id="section-summary" className="scroll-mt-24">
      {/* Call recap header */}
      <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-slate-900/80 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <h3 className="text-lg font-bold text-white">Call Recap — April 10, 2026</h3>
            <p className="text-xs text-slate-400">Tyler Granlund (HTT Brands) × Megan Myrand (Sui Generis)</p>
          </div>
          <span className="ml-auto rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
            ✅ Completed
          </span>
        </div>

        {/* Agenda outcomes */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {callAgenda.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-bold text-white">{item.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {item.outcome}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action items split by owner */}
      <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
        <span>✅</span> Action Items from Call
      </h4>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tyler's items */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-5">
          <h5 className="mb-3 text-sm font-bold text-slate-300">
            Tyler's Action Items ({tylerItems.length})
          </h5>
          <div className="space-y-2">
            {tylerItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_BADGE[item.priority] || ''}`}>
                  {item.priority}
                </span>
                <p className="flex-1 text-xs text-slate-300">{item.action}</p>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_BADGE[item.status] || ''}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Megan's items */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-5">
          <h5 className="mb-3 text-sm font-bold text-cyan-300">
            Your Action Items ({meganItems.length})
          </h5>
          <div className="space-y-2">
            {meganItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_BADGE[item.priority] || ''}`}>
                  {item.priority}
                </span>
                <p className="flex-1 text-xs text-slate-300">{item.action}</p>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_BADGE[item.status] || ''}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
