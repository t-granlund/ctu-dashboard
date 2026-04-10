import { confirmedContext } from '../../data/msp-data';

export default function ConfirmedContext() {
  const { suiGeneris, bishops, billingMess, lifecycleVision, deviceManagement, riversideDeadline } = confirmedContext;

  const serviceGroups = [
    {
      label: 'Licensing & Provisioning',
      items: suiGeneris.services.filter(s =>
        s.toLowerCase().includes('license') || s.toLowerCase().includes('provisioning') || s.toLowerCase().includes('migration')
      ),
    },
    {
      label: 'Hardware & Devices',
      items: suiGeneris.services.filter(s =>
        s.toLowerCase().includes('hardware') || s.toLowerCase().includes('device') || s.toLowerCase().includes('mac') || s.toLowerCase().includes('delta crown')
      ),
    },
    {
      label: 'Security & Access',
      items: suiGeneris.services.filter(s =>
        s.toLowerCase().includes('conditional') || s.toLowerCase().includes('mfa')
      ),
    },
    {
      label: 'Other',
      items: suiGeneris.services.filter(s =>
        s.toLowerCase().includes('call dashboard')
      ),
    },
  ];

  // Break the relationship string into cleaner pieces
  const relParts = suiGeneris.relationship.split('.');
  const relSentences = relParts.map(s => s.trim()).filter(Boolean);

  return (
    <div id="section-context" className="scroll-mt-24">
      <h3 className="mb-2 text-xl font-bold text-white">What We Confirmed</h3>
      <p className="mb-8 text-sm text-slate-500">
        Shared understanding from our April 10 call. If anything looks off, let Tyler know.
      </p>

      {/* Deadline */}
      <div className="mb-10 rounded-xl bg-slate-800/30 px-5 py-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">⏰ Key Deadline</span>
          <span className="mx-2 text-slate-700">—</span>
          {riversideDeadline}
        </p>
      </div>

      {/* ── Sui Generis ──────────────────────────── */}
      <section className="mb-12">
        <h4 className="text-base font-semibold text-white">Sui Generis — Your Role</h4>
        <p className="mt-1 mb-6 text-sm text-slate-500">{suiGeneris.keyPerson}</p>

        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          {suiGeneris.role}
        </p>

        {/* Services — grouped */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          {serviceGroups.filter(g => g.items.length > 0).map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {group.label}
              </p>
              <ul className="space-y-2">
                {group.items.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-400">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Relationship — broken into structured lines */}
        <div className="space-y-1">
          {relSentences.map((sentence, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-500">
              {sentence}.
            </p>
          ))}
        </div>
      </section>

      {/* ── Device Management ────────────────────── */}
      <section className="mb-12">
        <h4 className="mb-4 text-base font-semibold text-white">Device Management</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'RMM Tool', value: deviceManagement.tool },
            { label: 'Delta Crown', value: deviceManagement.deltaCrown },
            { label: 'API Integration', value: deviceManagement.apiAccess },
          ].map((item) => (
            <div key={item.label} className="flex flex-col rounded-xl bg-slate-800/30 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {item.label}
              </p>
              <p className="flex-1 text-sm leading-relaxed text-slate-300">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── In Progress ──────────────────────────── */}
      <section className="mb-12">
        <h4 className="mb-4 text-base font-semibold text-white">In Progress</h4>
        <div className="space-y-4">
          {[
            { label: 'BCC Billing', text: bishops.billingStatus },
            { label: 'BCC Migration', text: bishops.action },
            { label: 'BCC MFA', text: bishops.mfaStatus },
            { label: 'Licensing', text: billingMess },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-yellow-500/70">
                {item.label}
              </span>
              <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Where We're Headed ────────────────────── */}
      <section>
        <h4 className="mb-2 text-base font-semibold text-white">Where We're Headed</h4>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{lifecycleVision}</p>
      </section>
    </div>
  );
}
