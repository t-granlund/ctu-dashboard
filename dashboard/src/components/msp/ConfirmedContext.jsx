import { confirmedContext } from '../../data/msp-data';

export default function ConfirmedContext() {
  const { suiGeneris, bishops, billingMess, lifecycleVision, deviceManagement, conventions, riversideDeadline } = confirmedContext;

  return (
    <div id="section-context" className="scroll-mt-24">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <span>✅</span> Confirmed on Our Call
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        Everything below was confirmed during our April 10 conversation. This is our shared understanding — if anything looks off, let Tyler know.
      </p>

      {/* Riverside deadline callout */}
      <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-3">
        <p className="text-sm font-semibold text-red-300">
          ⏰ {riversideDeadline}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sui Generis Role */}
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 backdrop-blur-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-teal-300">
            <span>🏢</span> Sui Generis — Confirmed Services
          </h4>
          <p className="mb-1 text-xs font-semibold text-teal-400">{suiGeneris.keyPerson}</p>
          <p className="mb-3 text-sm text-teal-200/80">{suiGeneris.role}</p>
          <ul className="mb-3 space-y-1.5">
            {suiGeneris.services.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-teal-100/70">
                <span className="mt-0.5 shrink-0 text-teal-400">✓</span>
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

        {/* Right column */}
        <div className="space-y-4">
          {/* Device Management */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-5 backdrop-blur-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-300">
              <span>💻</span> Device Management
            </h4>
            <div className="space-y-1.5 text-sm text-blue-200/70">
              <p><strong className="text-blue-300">RMM:</strong> {deviceManagement.tool}</p>
              <p><strong className="text-blue-300">Delta Crown:</strong> {deviceManagement.deltaCrown}</p>
              <p><strong className="text-blue-300">API Access:</strong> {deviceManagement.apiAccess}</p>
              <p className="text-xs text-blue-400/60">{deviceManagement.appleMDM}</p>
            </div>
          </div>

          {/* BCC Status */}
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-5 backdrop-blur-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-300">
              <span>⚠️</span> Bishops (BCC) — In Progress
            </h4>
            <p className="text-sm text-orange-200/80">
              <strong>Billing:</strong> {bishops.billingStatus}
            </p>
            <p className="mt-1 text-sm text-orange-200/60">
              <strong>Migration:</strong> {bishops.action}
            </p>
            <p className="mt-1 text-sm text-orange-200/60">
              <strong>MFA:</strong> {bishops.mfaStatus}
            </p>
            <p className="mt-1 text-xs text-orange-300/50">
              {bishops.extraP2}
            </p>
          </div>

          {/* Convention note */}
          {conventions && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-sm">
              <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-purple-300">
                <span>🎪</span> Convention
              </h4>
              <p className="text-xs text-purple-200/70">
                Sui Generis attending: {conventions.suiGenerisAttending ? 'Yes' : 'No'} · {conventions.mfaBlocked}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Billing + Vision */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 backdrop-blur-sm">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-300">
            <span>💳</span> Billing Situation
          </h4>
          <p className="text-sm text-yellow-200/70">{billingMess}</p>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-sm">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-300">
            <span>🎯</span> Identity Lifecycle Vision
          </h4>
          <p className="text-sm text-cyan-200/70">{lifecycleVision}</p>
        </div>
      </div>
    </div>
  );
}
