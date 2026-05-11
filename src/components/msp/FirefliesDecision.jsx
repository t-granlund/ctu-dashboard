import { useState } from 'react';
import { firefliesDecision } from '../../data/fireflies-decision';
import { Eyebrow, SectionHeader, MetaPair, MiniTable } from './atoms';

function OutcomeCard({ title, copy }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-2 text-sm leading-5 text-slate-100">{copy}</p>
    </article>
  );
}

// Identity reality cards: we keep ordinal hue ONLY on the leading dot
// (green = supported, rose = unsupported). Border and surface stay neutral.
function IdentityFact({ title, copy, accent }) {
  const dot = accent === 'ok' ? '#34d399' : '#fb7185';
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
        <span aria-hidden="true" style={{ background: dot }} className="inline-block h-2 w-2 rounded-full" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-100">{copy}</p>
    </article>
  );
}

const RISK_COLUMNS = [
  { key: 'risk', label: 'Risk', width: 'w-[10rem]' },
  { key: 'matters', label: 'Why it matters' },
  { key: 'action', label: 'Action' },
];

function RiskTable({ rows }) {
  return (
    <MiniTable caption="Fireflies operational risks" columns={RISK_COLUMNS}>
      {rows.map(([risk, matters, action]) => (
        <tr key={risk} className="align-top">
          <td className="px-4 py-3 text-sm font-bold text-white">{risk}</td>
          <td className="px-4 py-3 text-xs leading-5 text-slate-300">{matters}</td>
          <td className="px-4 py-3 text-xs leading-5 text-slate-200">{action}</td>
        </tr>
      ))}
    </MiniTable>
  );
}

function ActionList({ rows }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, 4);
  const hidden = rows.length - visible.length;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
      <ul className="divide-y divide-slate-800/70">
        {visible.map(([action, owner, target, note]) => (
          <li key={action} className="grid gap-1 px-5 py-3 md:grid-cols-[1.6fr_0.7fr_0.9fr_1.2fr] md:items-center">
            <p className="text-sm font-bold text-white">{action}</p>
            <p className="text-xs font-bold text-slate-200">{owner}</p>
            <p className="text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-200">{target}</p>
            <p className="text-xs leading-5 text-slate-300">{note}</p>
          </li>
        ))}
      </ul>
      {rows.length > 4 && (
        <div className="border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
            className="inline-flex min-h-10 items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 hover:bg-slate-800"
          >
            {showAll ? 'Show top actions only' : `Show ${hidden} more action${hidden === 1 ? '' : 's'}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FirefliesDecision() {
  const decision = firefliesDecision;

  return (
    <section id="fireflies-licensing-decision" className="my-8 scroll-mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-6 grid gap-4 xl:grid-cols-[1.5fr_0.5fr] xl:items-start">
        <div>
          <Eyebrow>New licensing decision</Eyebrow>
          <h3 className="mt-1 text-xl font-bold leading-tight text-white sm:text-[24px]">{decision.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Teams Premium removed. Copilot not pursued. <span className="text-white">Fireflies.ai Pro</span> selected by COO.
          </p>
        </div>
        <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:grid-cols-3 xl:grid-cols-1">
          <MetaPair label="Updated" value={decision.updated} />
          <MetaPair label="Owner" value="Tyler Granlund" />
          <MetaPair label="Status" value="Implementation phase" />
        </div>
      </header>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        {decision.decisionCards.map(([title, copy]) => (
          <OutcomeCard key={title} title={title} copy={copy} />
        ))}
      </div>

      <div className="mb-6">
        <SectionHeader
          eyebrow="SSO reality"
          title="OIDC only — no SAML, no SCIM"
          sub="SAML and SCIM are Enterprise-tier; we have Pro."
        />
        <div className="grid gap-3 md:grid-cols-3">
          <IdentityFact accent="ok"   title="OIDC login"  copy="Sign in with Microsoft works through approved app consent and Conditional Access." />
          <IdentityFact accent="warn" title="Not SAML"    copy="Do not promise SAML SSO. Pro tier does not include it." />
          <IdentityFact accent="warn" title="Not SCIM"    copy="No auto-deprovisioning. Offboarding needs an admin/API workaround." />
        </div>
      </div>

      <div className="mb-6">
        <SectionHeader
          eyebrow="Operational risks"
          title="Five things to nail before broad rollout"
        />
        <RiskTable rows={decision.risks} />
      </div>

      <div>
        <SectionHeader
          eyebrow="Execution"
          title="Rollout actions"
          sub="Ticket #10333 — Kayla & Jill follow-up before closure."
        />
        <ActionList rows={decision.actions} />
      </div>
    </section>
  );
}
