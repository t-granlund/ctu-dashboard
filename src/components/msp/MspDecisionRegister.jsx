import { DECISIONS_PENDING, NEXT_HORIZON } from '../../data/cross-tenant-program';
import { maySevenUpdate } from '../../data/may-seven-update';
import { SectionHeader, SeverityDot, StatusPill } from './atoms';

const SEVERITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };

function DecisionRow({ decision }) {
  return (
    <tr className="align-top">
      <td className="px-5 py-3">
        <SeverityDot severity={decision.severity} label={SEVERITY_LABEL[decision.severity] ?? decision.severity} />
      </td>
      <td className="px-5 py-3"><StatusPill tone="info">{decision.owner}</StatusPill></td>
      <td className="px-5 py-3 text-sm font-bold leading-5 text-white">{decision.topic}</td>
      <td className="px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-200">{decision.target}</td>
    </tr>
  );
}

function TopicRow({ topic, index }) {
  return (
    <li className="grid gap-2 border-t border-slate-800 px-5 py-3 md:grid-cols-[4rem_1fr] md:items-baseline">
      <span className="text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-400">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="text-sm leading-6 text-slate-200">{topic}</span>
    </li>
  );
}

function HorizonRow({ item }) {
  return (
    <li className="grid gap-2 border-t border-slate-800 px-5 py-3 md:grid-cols-[6rem_1fr] md:items-baseline">
      <span className="text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-300">{item.date}</span>
      <span>
        <span className="block text-sm font-bold text-white">{item.label}</span>
        <span className="block text-xs leading-5 text-slate-400">{item.note}</span>
      </span>
    </li>
  );
}

export default function MspDecisionRegister() {
  const high = DECISIONS_PENDING.filter((d) => d.severity === 'high').length;
  const medium = DECISIONS_PENDING.filter((d) => d.severity === 'medium').length;

  return (
    <section id="msp-decisions" className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <SectionHeader
        eyebrow="MSP decision register"
        title="Decisions & Horizon"
        sub="The portal hero shows a five-item slice; this is the canonical open-decision list plus the structural dates that drive urgency."
        action={
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="blocked">{high} high</StatusPill>
            <StatusPill tone="warn">{medium} med</StatusPill>
            <StatusPill tone="info">{NEXT_HORIZON.length} dates</StatusPill>
          </div>
        }
      />

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <div
          tabIndex={0}
          role="region"
          aria-label="MSP decision register table scroll area"
          className="overflow-x-auto"
        >
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">MSP open decisions</caption>
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-400">
                <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Severity</th>
                <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Owner</th>
                <th scope="col" className="px-5 py-3 font-bold">Decision</th>
                <th scope="col" className="w-[7rem] px-5 py-3 font-bold">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {DECISIONS_PENDING.map((decision) => <DecisionRow key={`${decision.owner}-${decision.topic}`} decision={decision} />)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
          <header className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">May 7 agenda topics</p>
            <h3 className="mt-1 text-base font-bold text-white">Decision context</h3>
          </header>
          <ol>{maySevenUpdate.newAgendaTopics.map((topic, index) => <TopicRow key={topic} topic={topic} index={index} />)}</ol>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
          <header className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Next horizon</p>
            <h3 className="mt-1 text-base font-bold text-white">Structural dates</h3>
          </header>
          <ol>{NEXT_HORIZON.map((item) => <HorizonRow key={`${item.date}-${item.label}`} item={item} />)}</ol>
        </section>
      </div>
    </section>
  );
}
