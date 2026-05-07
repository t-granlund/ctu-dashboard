import { pshMspEscalation } from '../../data/psh-msp-escalation';
import { ProgressiveList, ScanFirstGrid } from './ProgressiveDisclosure';

function Card({ eyebrow, title, children, tone = 'cyan' }) {
  const tones = {
    cyan: ['border-cyan-500/30', 'text-cyan-300'],
    green: ['border-green-500/30', 'text-green-300'],
    amber: ['border-amber-500/30', 'text-amber-300'],
    fuchsia: ['border-fuchsia-500/30', 'text-fuchsia-300'],
  };
  const [border, accent] = tones[tone];
  return (
    <section className={`rounded-2xl border ${border} bg-slate-950/45 p-5`}>
      {eyebrow && <p className={`mb-1 text-[10px] font-black uppercase tracking-[0.2em] ${accent}`}>{eyebrow}</p>}
      <h4 className="mb-3 text-base font-black text-white">{title}</h4>
      {children}
    </section>
  );
}

function List({ items, marker = '•', initialVisible = 4, label = 'items' }) {
  return <ProgressiveList items={items} marker={marker} initialVisible={initialVisible} label={label} />;
}

function Table({ caption, columns, rows }) {
  return (
    <div tabIndex={0} aria-label={`${caption} table scroll area`} className="overflow-x-auto rounded-2xl border border-slate-800/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((column) => <th key={column} className="px-4 py-3 font-black">{column}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/35">
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 leading-5 text-slate-300">
                  {cellIndex === 0 ? <strong className="text-slate-100">{cell}</strong> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PshMspEscalationView() {
  const view = pshMspEscalation;

  return (
    <section id="psh-msp-escalation-view" className="scroll-mt-8 rounded-3xl border-2 border-green-500/35 bg-gradient-to-br from-green-950/25 via-slate-950/75 to-cyan-950/20 p-6 shadow-2xl shadow-green-950/20">
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-300">People Support Hub value story</p>
          <h3 className="mt-1 text-2xl font-black text-white">{view.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{view.summary}</p>
          <p className="mt-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-xs leading-5 text-cyan-100">
            {view.thesis}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Draft status</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div><dt className="text-xs text-slate-400">Status</dt><dd className="font-bold text-white">{view.status}</dd></div>
            <div><dt className="text-xs text-slate-400">Owner</dt><dd className="font-bold text-white">{view.owner}</dd></div>
            <div><dt className="text-xs text-slate-400">Updated</dt><dd className="font-bold text-white">{view.updated}</dd></div>
          </dl>
        </div>
      </div>

      <ScanFirstGrid
        tone="green"
        title="Why this matters in one screen"
        summary="Three operating outcomes. Routing rules and engineering shape live below for whoever wants the receipts."
        items={view.valueProps.slice(0, 3).map(([title, copy], index) => ({ eyebrow: `Outcome ${index + 1}`, title, copy }))}
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section>
          <h4 className="mb-4 text-lg font-black text-white">Freshdesk is the front door</h4>
          <Table caption="Freshdesk front door operating model" columns={['Today', 'Going forward']} rows={view.frontDoor} />
        </section>
        <Card eyebrow="Operating rule" title="Franchisee direct-email response" tone="amber">
          <blockquote className="text-sm leading-6 text-amber-100">
            “Please open a ticket at the support email — that’s how we keep your request from getting lost.”
          </blockquote>
        </Card>
      </div>

      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-black text-white">Proposed routing field conditions</h4>
        <p className="text-sm leading-6 text-slate-300">
          A ticket lands in Megan’s queue when status is <strong className="text-white">Waiting on Third Party (7)</strong> and one topic/tag condition matches.
        </p>
        <Table caption="MSP escalation routing field conditions" columns={['Field', 'Condition', 'Rationale']} rows={view.routingConditions} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {view.rollout.map((stage) => (
          <Card key={stage.stage} eyebrow={stage.stage} title={stage.label} tone={stage.stage === 'Stage 2' ? 'amber' : 'cyan'}>
            <p className="mb-3 rounded-xl border border-slate-700/50 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-200">
              {stage.dependency}
            </p>
            <List items={stage.items} marker="→" initialVisible={2} label={`${stage.label} steps`} />
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section>
          <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-slate-300">What Megan gets out of it</h4>
          <Table caption="MSP escalation queue metrics" columns={['Metric', 'Why Megan cares']} rows={view.metrics} />
        </section>
        <section>
          <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-slate-300">Engineering shape</h4>
          <Table caption="MSP escalation engineering scope" columns={['Work item', 'Effort', 'Notes']} rows={view.engineeringShape} />
        </section>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card eyebrow="Call decisions" title="Decisions to capture with Megan" tone="fuchsia">
          <List items={view.decisions} marker="✓" initialVisible={3} label="call decisions" />
        </Card>
        <Card eyebrow="Scope sanity" title="Why this is low-risk" tone="green">
          <p className="mb-4 text-sm leading-6 text-slate-300">{view.callout}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">Configurable, auditable, Freshdesk-backed.</p>
        </Card>
      </div>

      <Card eyebrow="Reference anchors" title="Where this maps back to PSH" tone="cyan">
        <List items={view.references} marker="↳" initialVisible={3} label="reference anchors" />
      </Card>
    </section>
  );
}
