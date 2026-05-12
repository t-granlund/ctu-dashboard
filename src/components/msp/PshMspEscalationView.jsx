import { pshMspEscalation } from '../../data/psh-msp-escalation';
import { ProgressiveList, ScanFirstGrid } from './ProgressiveDisclosure';
import { Eyebrow, SectionHeader, MetaPair, MiniTable, PullQuote } from './atoms';

function NeutralCard({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h4 className="mt-1 mb-3 text-base font-bold text-white">{title}</h4>
      {children}
    </section>
  );
}

function List({ items, marker = '•', initialVisible = 4, label = 'items' }) {
  return (
    <ProgressiveList
      items={items}
      marker={marker}
      markerClass="text-slate-500"
      initialVisible={initialVisible}
      label={label}
    />
  );
}

function MspTable({ caption, columns, rows }) {
  const cols = columns.map((c) => ({ key: c, label: c }));
  return (
    <MiniTable caption={caption} columns={cols}>
      {rows.map((row, rowIndex) => (
        <tr key={`${row[0]}-${rowIndex}`} className="align-top">
          {row.map((cell, cellIndex) => (
            <td key={`${cell}-${cellIndex}`} className={`px-4 py-3 text-xs leading-5 ${cellIndex === 0 ? 'font-bold text-white' : 'text-slate-300'}`}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </MiniTable>
  );
}

export default function PshMspEscalationView() {
  const view = pshMspEscalation;

  return (
    <section id="psh-msp-escalation-view" className="scroll-mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div>
          <Eyebrow>People Support Hub value story</Eyebrow>
          <h3 className="mt-1 text-xl font-bold text-white">{view.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{view.summary}</p>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <Eyebrow>Thesis</Eyebrow>
            <p className="mt-2 text-xs leading-5 text-slate-200">{view.thesis}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Eyebrow>Draft status</Eyebrow>
          <div className="mt-3 space-y-3">
            <MetaPair label="Status"  value={view.status} />
            <MetaPair label="Owner"   value={view.owner} />
            <MetaPair label="Updated" value={view.updated} />
          </div>
        </div>
      </header>

      <div className="mb-6">
        <ScanFirstGrid
          eyebrow="Scan first"
          title="Why this matters in one screen"
          summary="Three operating outcomes. Routing rules and engineering shape live below for whoever wants the receipts."
          items={view.valueProps.slice(0, 3).map(([title, copy], index) => ({ eyebrow: `Outcome ${index + 1}`, title, copy }))}
        />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section>
          <SectionHeader title="Freshdesk is the front door" />
          <MspTable caption="Freshdesk front door operating model" columns={['Today', 'Going forward']} rows={view.frontDoor} />
        </section>
        <NeutralCard eyebrow="Operating rule" title="Franchisee direct-email response">
          <PullQuote>
            “Please open a ticket at the support email — that’s how we keep your request from getting lost.”
          </PullQuote>
        </NeutralCard>
      </div>

      <div className="mb-6 space-y-3">
        <SectionHeader
          title="Proposed routing field conditions"
          sub={
            <span>
              A ticket lands in Megan’s queue when status is <strong className="text-white">Waiting on Third Party (7)</strong> and one topic/tag condition matches.
            </span>
          }
        />
        <MspTable caption="MSP escalation routing field conditions" columns={['Field', 'Condition', 'Rationale']} rows={view.routingConditions} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {view.rollout.map((stage) => (
          <NeutralCard key={stage.stage} eyebrow={stage.stage} title={stage.label}>
            <p className="mb-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-200">
              {stage.dependency}
            </p>
            <List items={stage.items} marker="→" initialVisible={2} label={`${stage.label} steps`} />
          </NeutralCard>
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section>
          <SectionHeader title="What Megan gets out of it" />
          <MspTable caption="MSP escalation queue metrics" columns={['Metric', 'Why Megan cares']} rows={view.metrics} />
        </section>
        <section>
          <SectionHeader title="Engineering shape" />
          <MspTable caption="MSP escalation engineering scope" columns={['Work item', 'Effort', 'Notes']} rows={view.engineeringShape} />
        </section>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <NeutralCard eyebrow="Call decisions" title="Decisions to capture with Megan">
          <List items={view.decisions} marker="✓" initialVisible={3} label="call decisions" />
        </NeutralCard>
        <NeutralCard eyebrow="Scope sanity" title="Why this is low-risk">
          <p className="mb-4 text-sm leading-6 text-slate-300">{view.callout}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Configurable, auditable, Freshdesk-backed.</p>
        </NeutralCard>
      </div>

      <NeutralCard eyebrow="Reference anchors" title="Where this maps back to PSH">
        <List items={view.references} marker="↳" initialVisible={3} label="reference anchors" />
      </NeutralCard>
    </section>
  );
}
