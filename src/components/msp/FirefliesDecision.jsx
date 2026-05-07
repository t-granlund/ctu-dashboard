import { firefliesDecision } from '../../data/fireflies-decision';

function MiniCard({ title, copy }) {
  return (
    <article className="rounded-2xl border border-violet-400/25 bg-slate-950/55 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-100">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-200">{copy}</p>
    </article>
  );
}

function DecisionTable({ caption, columns, rows }) {
  return (
    <div tabIndex={0} aria-label={`${caption} table scroll area`} className="overflow-x-auto rounded-2xl border border-slate-700/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-black">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/35">
          {rows.map((row) => (
            <tr key={row.join('-')} className="align-top">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-4 py-3 leading-5 text-slate-300">
                  {index === 0 ? <strong className="text-slate-100">{cell}</strong> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FirefliesDecision() {
  const decision = firefliesDecision;
  return (
    <section id="fireflies-licensing-decision" className="scroll-mt-8 rounded-3xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-950/35 via-slate-950/80 to-fuchsia-950/20 p-6 shadow-2xl shadow-violet-950/20">
      <div className="mb-5 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">New licensing decision</p>
          <h3 className="mt-1 text-2xl font-black text-white">{decision.title}</h3>
          <p className="mt-3 rounded-2xl border border-violet-300/25 bg-violet-500/10 p-4 text-sm font-bold leading-6 text-violet-50">
            {decision.summary}
          </p>
        </div>
        <dl className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-5 text-sm">
          <div><dt className="text-xs text-slate-400">Last updated</dt><dd className="font-bold text-white">{decision.updated}</dd></div>
          <div className="mt-3"><dt className="text-xs text-slate-400">Owner</dt><dd className="font-bold text-white">{decision.owner}</dd></div>
          <div className="mt-3"><dt className="text-xs text-slate-400">Status</dt><dd className="font-bold text-slate-100">{decision.status}</dd></div>
        </dl>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-3">
        {decision.decisionCards.map(([title, copy]) => <MiniCard key={title} title={title} copy={copy} />)}
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">SSO reality</p>
          <h4 className="mt-1 text-lg font-black text-white">OIDC, not SAML or SCIM</h4>
          <div className="mt-4 space-y-3">
            {decision.identityReality.map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-slate-700/50 bg-slate-950/45 p-3">
                <p className="text-xs font-black text-cyan-100">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-3 text-lg font-black text-white">Operational risks before rollout</h4>
          <DecisionTable caption="Fireflies operational risks" columns={['Risk', 'Why it matters', 'Owner / action']} rows={decision.risks} />
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-200">Execution register</p>
            <h4 className="text-lg font-black text-white">Fireflies rollout action items</h4>
          </div>
          <p className="text-xs font-bold text-slate-100">Ticket #10333: Kayla/Jill follow-up required before closure.</p>
        </div>
        <DecisionTable caption="Fireflies rollout action items" columns={['Action', 'Owner', 'Target', 'Note']} rows={decision.actions} />
      </section>
    </section>
  );
}
