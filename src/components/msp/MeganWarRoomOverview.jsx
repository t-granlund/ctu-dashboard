import { maySevenUpdate } from '../../data/may-seven-update';
import { ProgressiveList } from './ProgressiveDisclosure';
import { Eyebrow, ActionLink } from './atoms';

function Pillar({ eyebrow, title, items, marker, label }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h4 className="mt-1 mb-3 text-sm font-bold text-white">{title}</h4>
      <ProgressiveList
        items={items}
        marker={marker}
        markerClass="text-slate-500"
        initialVisible={3}
        label={label}
      />
    </section>
  );
}

export default function MeganWarRoomOverview() {
  const w = maySevenUpdate.warRoom;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>May 7 War Room · Tyler × Megan</Eyebrow>
          <h3 className="mt-1 text-xl font-bold text-white">Tyler × Megan Alignment Brief</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{w.objective}</p>
        </div>
        <div role="navigation" aria-label="Designed deep-dive jump links" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold lg:justify-end">
          <a href="#megan-overview-guide" aria-label="Jump to Designed Megan Overview Guide" className="inline-flex min-h-6 items-center text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200">Overview guide</a>
          <a href="#psh-msp-escalation-view" aria-label="Jump to PSH MSP Escalation View" className="inline-flex min-h-6 items-center text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200">MSP escalation</a>
          <a href="#source-truth-review" aria-label="Jump to Embedded Source-of-Truth Review" className="inline-flex min-h-6 items-center text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200">Evidence</a>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Pillar eyebrow="Decisions"   title="To land today"                items={w.decisionTopics}   marker="•" label="decisions" />
        <Pillar eyebrow="Billing/CSP" title="Where the money is moving"    items={w.billingSnapshot}  marker="→" label="billing notes" />
        <Pillar eyebrow="Framing"     title="How we run the conversation"  items={w.talkTrack}        marker="✓" label="framing notes" />
      </div>
    </section>
  );
}
