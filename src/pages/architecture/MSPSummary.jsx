import { MSP_INFO } from './data';

function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/50 py-3 sm:flex-row sm:gap-4">
      <dt className="w-44 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-300">{children}</dd>
    </div>
  );
}

export default function MSPSummary() {
  return (
    <div>
      <h2 className="section-title">MSP Partnership Summary</h2>
      <div className="card">
        <dl>
          <InfoRow label="Partner">{MSP_INFO.partner}</InfoRow>
          <InfoRow label="Distributor">{MSP_INFO.distributor}</InfoRow>
          <InfoRow label="Access Type">{MSP_INFO.accessType}</InfoRow>
          <InfoRow label="GDAP Roles">
            <div className="flex flex-wrap gap-1.5">
              {MSP_INFO.gdapRoles.map((role) => {
                const isElevated = role.startsWith('Privileged');
                return (
                  <span
                    key={role}
                    className={`badge ${
                      isElevated
                        ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {role}
                  </span>
                );
              })}
            </div>
          </InfoRow>
          <InfoRow label="Duration">{MSP_INFO.duration}</InfoRow>
          <InfoRow label="Security Group">{MSP_INFO.securityGroup}</InfoRow>
          <InfoRow label="MFA Enforcement">{MSP_INFO.mfa}</InfoRow>
        </dl>

        {/* Notes */}
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-300">
              <span className="font-semibold">⚠ Elevated Roles:</span> {MSP_INFO.elevatedNote}
            </p>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
            <p className="text-xs text-cyan-300">
              <span className="font-semibold">ℹ GDAP &amp; Deny-by-Default:</span> {MSP_INFO.gdapNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
