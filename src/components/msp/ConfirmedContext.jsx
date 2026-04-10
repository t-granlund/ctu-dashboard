import { confirmedContext } from '../../data/msp-data';

export default function ConfirmedContext() {
  const { suiGeneris, bishops, billingMess, lifecycleVision, deviceManagement, riversideDeadline } = confirmedContext;

  return (
    <div id="section-context" className="scroll-mt-24">
      <h3 className="mb-2 text-xl font-bold text-white">What We Confirmed</h3>
      <p className="mb-8 text-sm text-slate-500">
        Shared understanding from our April 10 call. If anything looks off, let Tyler know.
      </p>

      {/* ── Deadline — prominent but not alarming ──────── */}
      <div className="mb-10 rounded-xl border border-amber-500/20 bg-amber-950/10 px-5 py-4">
        <p className="text-sm">
          <span className="font-semibold text-amber-200">⏰ Key Deadline</span>
          <span className="mx-2 text-slate-700">—</span>
          <span className="text-amber-100/80">{riversideDeadline}</span>
        </p>
      </div>

      {/* ── Sui Generis ──────────────────────────── */}
      <section className="mb-10 rounded-2xl border border-slate-700/20 bg-slate-800/20 p-6">
        <h4 className="text-base font-semibold text-white">Sui Generis — Your Role</h4>
        <p className="mt-1 mb-1 text-sm text-slate-400">{suiGeneris.keyPerson}</p>
        <p className="mb-6 text-sm text-slate-300">{suiGeneris.role}</p>

        {/* Services — 2 col, with highlights on key status */}
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {/* Licensing & Provisioning */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Licensing & Provisioning
            </p>
            <ul className="space-y-2">
              <li className="text-sm leading-relaxed text-slate-300">
                M365 license management and provisioning via PAX8 — all tenants
              </li>
              <li className="text-sm leading-relaxed text-slate-300">
                AppRiver → PAX8 migration{' '}
                <span className="rounded bg-green-500/15 px-1.5 py-0.5 text-xs font-semibold text-green-400">
                  100% COMPLETE
                </span>
              </li>
            </ul>
          </div>

          {/* Hardware & Devices */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Hardware & Devices
            </p>
            <ul className="space-y-2">
              <li className="text-sm leading-relaxed text-slate-300">
                Hardware ordering for corporate new hires
              </li>
              <li className="text-sm leading-relaxed text-slate-300">
                Hardware ordering for franchisees — Bishops actively, Frenchies limited by FTG contracts
              </li>
              <li className="text-sm leading-relaxed text-slate-300">
                Device management via <span className="font-medium text-white">Atera (RMM)</span> across all brands
              </li>
              <li className="text-sm leading-relaxed text-slate-300">
                Delta Crown: <span className="font-medium text-white">all-Mac strategy</span> with Apple Business Manager + MDM
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Security & Access
            </p>
            <ul className="space-y-2">
              <li className="text-sm leading-relaxed text-slate-300">
                Conditional Access deployed on{' '}
                <span className="font-medium text-white">DCE, FN, TLL</span>
                <span className="text-slate-500"> · </span>
                <span className="text-yellow-400/80">Bishops post-convention</span>
              </li>
              <li className="text-sm leading-relaxed text-slate-300">
                MFA documentation and end-user onboarding guides per brand
              </li>
            </ul>
          </div>

          {/* Other */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Other
            </p>
            <ul className="space-y-2">
              <li className="text-sm leading-relaxed text-slate-300">
                TLL call dashboard — Twilio-based, rebuilding to remove server dependency
              </li>
            </ul>
          </div>
        </div>

        {/* Relationship — structured, not a paragraph */}
        <div className="mt-6 border-t border-slate-700/20 pt-4">
          <div className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
            <div>
              <span className="text-slate-500">Marketplace:</span>{' '}
              <span className="text-slate-300">PAX8</span>
            </div>
            <div>
              <span className="text-slate-500">Primary Contact:</span>{' '}
              <span className="text-slate-300">Megan Myrand</span>
            </div>
            <div>
              <span className="text-slate-500">Also on account:</span>{' '}
              <span className="text-slate-300">Colton (call dashboard)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Device Management ────────────────────── */}
      <section className="mb-10">
        <h4 className="mb-4 text-base font-semibold text-white">Device Management</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'RMM Tool',
              value: 'Atera',
              detail: 'Agent-based monitoring across all brands',
            },
            {
              label: 'Delta Crown',
              value: 'All Mac',
              detail: 'Apple Business Manager + MDM. Needs DUNS number to set up ABM.',
              highlight: true,
            },
            {
              label: 'API Integration',
              value: 'In discussion',
              detail: 'Tyler wants device info piped into Freshdesk/People Support Hub. Megan checking Atera API support.',
              highlight: false,
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col rounded-xl border border-slate-700/20 bg-slate-800/30 p-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <p className="mb-1 text-base font-semibold text-white">{item.value}</p>
              <p className="flex-1 text-xs leading-relaxed text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── In Progress ──────────────────────────── */}
      <section className="mb-10 rounded-2xl border border-yellow-500/10 bg-yellow-950/5 p-6">
        <h4 className="mb-5 flex items-center gap-2 text-base font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          In Progress
        </h4>
        <div className="space-y-5">
          {/* BCC Billing */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-white">BCC Billing</span>
              <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400">
                MIGRATING
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Currently MOSA / Direct Bill — migration to PAX8 in progress.
            </p>
          </div>

          {/* BCC License Migration */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-white">BCC License Migration</span>
              <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                JUL/AUG 2026
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Most licenses end July/August. Megan will purchase PAX8 replacements and align renewal dates.
            </p>
          </div>

          {/* BCC MFA */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-white">BCC MFA Rollout</span>
              <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">
                POST-CONVENTION
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Megan doesn't want a support nightmare during the event. Will use the same MFA security group approach as TLL.
            </p>
          </div>

          {/* Licensing Overview */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-white">Licensing Cleanup</span>
              <span className="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
                IMPROVING
              </span>
            </div>
            <ul className="mt-1 space-y-1 text-sm text-slate-400">
              <li>• Most license subscriptions end <span className="text-slate-300">July/August 2026</span> — consolidating to PAX8</li>
              <li>• TLL has only <span className="text-slate-300">2 active billing accounts</span> (not the huge list feared)</li>
              <li>• Power BI individual licenses being phased out → Fabric Free via cross-tenant sync</li>
              <li>• HTT Power BI + Teams Premium still direct-billed — migration in progress</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Where We're Headed ────────────────────── */}
      <section className="rounded-2xl border border-slate-700/20 bg-slate-800/20 p-6">
        <h4 className="mb-4 text-base font-semibold text-white">Where We're Headed</h4>
        <p className="mb-4 text-sm text-slate-300">
          <span className="font-medium text-white">Delta Crown is the clean-slate pilot.</span>{' '}
          Tyler is building the hub-and-spoke SharePoint architecture there first.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-900/50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-500/70">The Goal</p>
            <p className="text-sm leading-relaxed text-slate-300">
              When someone onboards, their user properties{' '}
              <span className="text-white">(role, brand, location, salon IDs)</span>{' '}
              automatically drive group membership, access, and licensing. No manual permission management.
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-500/70">Next Step</p>
            <p className="text-sm leading-relaxed text-slate-300">
              Present the Delta Crown layout to{' '}
              <span className="text-white">Megan + Kristen</span> for review.
              Once approved, roll the same pattern to other brands.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
