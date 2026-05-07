import { useState } from 'react';
import { firefliesDecision } from '../../data/fireflies-decision';

function HeroFact({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function OutcomeCard({ title, copy }) {
  return (
    <article className="rounded-2xl border border-slate-700/55 bg-slate-950/60 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">{title}</p>
      <p className="mt-2 text-sm leading-5 text-slate-100">{copy}</p>
    </article>
  );
}

function IdentityFact({ title, copy, accent }) {
  const tones = {
    ok: { border: 'border-green-400/40', text: 'text-green-200', icon: '✓' },
    warn: { border: 'border-rose-400/40', text: 'text-rose-200', icon: '✕' },
  };
  const tone = tones[accent] ?? tones.warn;
  return (
    <article className={`rounded-2xl border ${tone.border} bg-slate-950/55 p-4`}>
      <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${tone.text}`}>
        <span aria-hidden="true">{tone.icon}</span> {title}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-100">{copy}</p>
    </article>
  );
}

function RiskTable({ rows }) {
  return (
    <div tabIndex={0} aria-label="Fireflies operational risks scroll area" className="overflow-x-auto rounded-2xl border border-slate-700/60">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <caption className="sr-only">Fireflies operational risks</caption>
        <thead className="bg-slate-950/80 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <tr>
            <th className="px-4 py-3 font-black">Risk</th>
            <th className="px-4 py-3 font-black">Why it matters</th>
            <th className="px-4 py-3 font-black">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map(([risk, matters, action]) => (
            <tr key={risk} className="align-top">
              <td className="px-4 py-3 text-sm font-bold text-white">{risk}</td>
              <td className="px-4 py-3 text-xs leading-5 text-slate-200">{matters}</td>
              <td className="px-4 py-3 text-xs leading-5 text-cyan-100">{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionList({ rows }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, 4);
  const hidden = rows.length - visible.length;
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55">
      <ul className="divide-y divide-slate-800/60">
        {visible.map(([action, owner, target, note]) => (
          <li key={action} className="grid gap-1 px-4 py-3 md:grid-cols-[1.6fr_0.7fr_0.7fr_1.2fr] md:items-center">
            <p className="text-sm font-bold text-white">{action}</p>
            <p className="text-xs font-bold text-slate-200">{owner}</p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{target}</p>
            <p className="text-xs leading-5 text-slate-300">{note}</p>
          </li>
        ))}
      </ul>
      {rows.length > 4 && (
        <div className="border-t border-slate-800/60 px-4 py-3">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
            className="min-h-10 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-black text-slate-100 transition hover:bg-slate-800"
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
    <section id="fireflies-licensing-decision" className="my-6 scroll-mt-8 rounded-3xl border-2 border-violet-500/45 bg-slate-950/55 p-6 shadow-xl shadow-violet-950/20">
      <header className="mb-5 grid gap-4 xl:grid-cols-[1.4fr_0.6fr] xl:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300">New licensing decision</p>
          <h3 className="mt-1 text-2xl font-black leading-tight text-white sm:text-3xl">{decision.title}</h3>
          <p className="mt-3 text-base font-bold leading-6 text-violet-100">
            Teams Premium removed. Copilot not pursued. <span className="text-white">Fireflies.ai Pro</span> selected by COO.
          </p>
        </div>
        <div className="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 sm:grid-cols-3 xl:grid-cols-1">
          <HeroFact label="Updated" value={decision.updated} />
          <HeroFact label="Owner" value="Tyler Granlund" />
          <HeroFact label="Status" value="Implementation phase" />
        </div>
      </header>

      <div className="mb-5 grid gap-3 lg:grid-cols-3">
        {decision.decisionCards.map(([title, copy]) => (
          <OutcomeCard key={title} title={title} copy={copy} />
        ))}
      </div>

      <div className="mb-5 rounded-3xl border border-slate-700/55 bg-slate-950/40 p-5">
        <header className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">SSO reality</p>
            <h4 className="text-lg font-black text-white">OIDC only — no SAML, no SCIM</h4>
          </div>
          <p className="text-xs leading-5 text-slate-300">SAML/SCIM are Enterprise-tier; we have Pro.</p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          <IdentityFact accent="ok" title="OIDC login" copy="Sign in with Microsoft works through approved app consent and Conditional Access." />
          <IdentityFact accent="warn" title="Not SAML" copy="Do not promise SAML SSO. Pro tier does not include it." />
          <IdentityFact accent="warn" title="Not SCIM" copy="No auto-deprovisioning. Offboarding needs an admin/API workaround." />
        </div>
      </div>

      <div className="mb-5">
        <header className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">Operational risks</p>
          <h4 className="text-lg font-black text-white">Five things to nail before broad rollout</h4>
        </header>
        <RiskTable rows={decision.risks} />
      </div>

      <div>
        <header className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">Execution</p>
            <h4 className="text-lg font-black text-white">Rollout actions</h4>
          </div>
          <p className="text-xs font-bold text-violet-100">Ticket #10333 — Kayla &amp; Jill follow-up before closure.</p>
        </header>
        <ActionList rows={decision.actions} />
      </div>
    </section>
  );
}
