import { confirmedContext } from '../../data/msp-data';
import { Eyebrow, SectionHeader, MetaPair, StatusPill } from './atoms';

function ServiceColumn({ label, children }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-200">{children}</ul>
    </div>
  );
}

function InProgressItem({ title, tone, pillLabel, children }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-white">{title}</span>
        <StatusPill tone={tone}>{pillLabel}</StatusPill>
      </div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

export default function ConfirmedContext() {
  const { suiGeneris, riversideDeadline } = confirmedContext;

  return (
    <div id="section-context" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Confirmed context"
        title="What We Confirmed"
        sub="Shared understanding from our April 10 call. If anything looks off, let Tyler know."
      />

      {/* Key deadline — neutral surface, ordinal pill */}
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <StatusPill tone="warn">Key deadline</StatusPill>
          <p className="text-sm leading-6 text-slate-200">{riversideDeadline}</p>
        </div>
      </section>

      {/* Sui Generis */}
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <header className="mb-5">
          <Eyebrow>Provider · MSP</Eyebrow>
          <h4 className="mt-1 text-lg font-bold text-white">Sui Generis — Your Role</h4>
          <p className="mt-1 text-sm text-slate-400">{suiGeneris.keyPerson}</p>
          <p className="mt-1 text-sm text-slate-300">{suiGeneris.role}</p>
        </header>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <ServiceColumn label="Licensing & Provisioning">
            <li>M365 license management and provisioning via PAX8 — all tenants</li>
            <li className="flex flex-wrap items-baseline gap-2">
              <span>AppRiver → PAX8 migration</span>
              <StatusPill tone="ok">100% complete</StatusPill>
            </li>
          </ServiceColumn>
          <ServiceColumn label="Hardware & Devices">
            <li>Hardware ordering for corporate new hires</li>
            <li>Hardware ordering for franchisees — Bishops actively, Frenchies limited by FTG contracts</li>
            <li>Device management via <span className="font-bold text-white">Atera (RMM)</span> across all brands</li>
            <li>Delta Crown: <span className="font-bold text-white">all-Mac strategy</span> with Apple Business Manager + MDM</li>
          </ServiceColumn>
          <ServiceColumn label="Security & Access">
            <li className="flex flex-wrap items-baseline gap-2">
              <span>Conditional Access deployed on <span className="font-bold text-white">DCE, FN, TLL</span></span>
              <StatusPill tone="warn">Bishops post-convention</StatusPill>
            </li>
            <li>MFA documentation and end-user onboarding guides per brand</li>
          </ServiceColumn>
          <ServiceColumn label="Other">
            <li>TLL call dashboard — Twilio-based, rebuilding to remove server dependency</li>
          </ServiceColumn>
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-3">
          <MetaPair label="Marketplace"     value="PAX8" />
          <MetaPair label="Primary contact" value="Megan Myrand" />
          <MetaPair label="Also on account" value="Colton (call dashboard)" />
        </div>
      </section>

      {/* Device Management */}
      <section className="mb-8">
        <SectionHeader title="Device Management" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'RMM Tool',        value: 'Atera',          detail: 'Agent-based monitoring across all brands.' },
            { label: 'Delta Crown',     value: 'All Mac',        detail: 'Apple Business Manager + MDM. Needs DUNS number to set up ABM.' },
            { label: 'API Integration', value: 'In discussion',  detail: 'Tyler wants device info piped into Freshdesk/People Support Hub. Megan checking Atera API support.' },
          ].map((item) => (
            <article key={item.label} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <Eyebrow>{item.label}</Eyebrow>
              <p className="mt-1 text-base font-bold text-white">{item.value}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-400">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* In progress */}
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <SectionHeader
          eyebrow="Active work"
          title="In progress"
          sub="What is moving between now and the next call."
        />
        <div className="space-y-5">
          <InProgressItem title="BCC billing" tone="warn" pillLabel="Migrating">
            Currently MOSA / Direct Bill — migration to PAX8 in progress.
          </InProgressItem>
          <InProgressItem title="BCC license migration" tone="info" pillLabel="Jul/Aug 2026">
            BCC Business Basic expires October 2026; other renewals may land July/August. Megan will purchase PAX8 replacements and align renewal dates.
          </InProgressItem>
          <InProgressItem title="BCC MFA rollout" tone="info" pillLabel="Post-convention">
            Megan doesn’t want a support nightmare during the event. Will use the same MFA security-group approach as TLL.
          </InProgressItem>
          <InProgressItem title="Licensing cleanup" tone="ok" pillLabel="Improving">
            <ul className="mt-1 space-y-1 text-sm leading-relaxed text-slate-300">
              <li>BCC Business Basic expires <span className="text-slate-100">October 2026</span>; other Pax8 renewals may land July/August — consolidating to PAX8.</li>
              <li>TLL has only <span className="text-slate-100">2 active billing accounts</span> (not the huge list feared).</li>
              <li>Power BI individual licenses being phased out → Fabric Free via cross-tenant sync.</li>
              <li>HTT Power BI + Teams Premium still direct-billed — migration in progress.</li>
            </ul>
          </InProgressItem>
        </div>
      </section>

      {/* Where we're headed */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <SectionHeader
          eyebrow="Direction"
          title="Where we’re headed"
          sub={
            <span>
              <span className="font-bold text-white">Delta Crown is the clean-slate pilot.</span>{' '}
              Tyler is building the hub-and-spoke SharePoint architecture there first.
            </span>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <Eyebrow>The goal</Eyebrow>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              When someone onboards, their user properties{' '}
              <span className="font-bold text-white">(role, brand, location, salon IDs)</span>{' '}
              automatically drive group membership, access, and licensing. No manual permission management.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <Eyebrow>Next step</Eyebrow>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Present the Delta Crown layout to{' '}
              <span className="font-bold text-white">Megan + Kristen</span> for review.
              Once approved, roll the same pattern to other brands.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
