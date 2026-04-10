import { confirmedContext } from '../../data/msp-data';

export default function ConfirmedContext() {
  const { suiGeneris, bishops, billingMess, lifecycleVision } = confirmedContext;

  return (
    <div id="section-context" className="scroll-mt-24">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <span>🤝</span> What We Already Know
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        Pre-confirmed context — reference this to keep the conversation grounded.
        Not questions — just facts.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sui Generis Role */}
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 backdrop-blur-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-teal-300">
            <span>🏢</span> Sui Generis — Role & Services
          </h4>
          <p className="mb-3 text-sm text-teal-200/80">{suiGeneris.role}</p>
          <ul className="mb-3 space-y-1.5">
            {suiGeneris.services.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-teal-100/70">
                <span className="mt-0.5 shrink-0 text-teal-400">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-teal-900/30 px-3 py-2">
            <p className="text-xs text-teal-300/70">
              <strong>Relationship:</strong> {suiGeneris.relationship}
            </p>
          </div>
        </div>

        {/* Right column: BCC + Billing + Vision */}
        <div className="space-y-4">
          {/* BCC Status */}
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-5 backdrop-blur-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-300">
              <span>⚠️</span> Bishops (BCC) — Gap
            </h4>
            <p className="text-sm text-orange-200/80">
              <strong>Status:</strong> {bishops.billingStatus}
            </p>
            <p className="mt-1 text-sm text-orange-200/60">
              <strong>Action:</strong> {bishops.action}
            </p>
          </div>

          {/* Billing Mess */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 backdrop-blur-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-300">
              <span>💳</span> Billing Situation
            </h4>
            <p className="text-sm text-yellow-200/70">{billingMess}</p>
          </div>

          {/* Lifecycle Vision */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-300">
              <span>🎯</span> Identity Lifecycle Vision
            </h4>
            <p className="text-sm text-cyan-200/70">{lifecycleVision}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
