import { confirmedContext } from '../../data/msp-data';

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4 py-2">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="flex-1 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export default function ConfirmedContext() {
  const { suiGeneris, bishops, billingMess, lifecycleVision, deviceManagement, riversideDeadline } = confirmedContext;

  return (
    <div id="section-context" className="scroll-mt-24">
      <h3 className="mb-2 text-xl font-bold text-white">
        What We Confirmed
      </h3>
      <p className="mb-8 text-sm text-slate-500">
        Shared understanding from our April 10 call. If anything looks off, let Tyler know.
      </p>

      {/* Deadline — simple, not alarming */}
      <div className="mb-8 rounded-xl border border-slate-700/30 bg-slate-800/30 px-5 py-3">
        <p className="text-sm text-slate-400">
          <span className="mr-2 font-semibold text-slate-200">⏰ Key Deadline:</span>
          {riversideDeadline}
        </p>
      </div>

      {/* Sui Generis — clean list */}
      <div className="mb-10">
        <h4 className="mb-1 text-base font-semibold text-white">Sui Generis — Your Role</h4>
        <p className="mb-4 text-xs text-slate-500">{suiGeneris.keyPerson}</p>

        <div className="divide-y divide-slate-800/60">
          <InfoRow label="What You Do">
            {suiGeneris.role}
          </InfoRow>
          <InfoRow label="Services">
            <ul className="space-y-1">
              {suiGeneris.services.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </InfoRow>
          <InfoRow label="Relationship">
            {suiGeneris.relationship}
          </InfoRow>
        </div>
      </div>

      {/* Device Management */}
      <div className="mb-10">
        <h4 className="mb-4 text-base font-semibold text-white">Device Management</h4>
        <div className="divide-y divide-slate-800/60">
          <InfoRow label="RMM Tool">{deviceManagement.tool}</InfoRow>
          <InfoRow label="Delta Crown">{deviceManagement.deltaCrown}</InfoRow>
          <InfoRow label="API Access">{deviceManagement.apiAccess}</InfoRow>
        </div>
      </div>

      {/* In Progress — compact */}
      <div className="mb-10">
        <h4 className="mb-4 text-base font-semibold text-white">In Progress</h4>
        <div className="divide-y divide-slate-800/60">
          <InfoRow label="BCC Billing">{bishops.billingStatus}</InfoRow>
          <InfoRow label="BCC Migration">{bishops.action}</InfoRow>
          <InfoRow label="BCC MFA">{bishops.mfaStatus}</InfoRow>
          <InfoRow label="Licensing">{billingMess}</InfoRow>
        </div>
      </div>

      {/* Vision — single paragraph */}
      <div>
        <h4 className="mb-2 text-base font-semibold text-white">Where We're Headed</h4>
        <p className="text-sm leading-relaxed text-slate-400">{lifecycleVision}</p>
      </div>
    </div>
  );
}
