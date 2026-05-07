import { maySevenUpdate } from '../../data/may-seven-update';
import { ProgressiveList } from './ProgressiveDisclosure';

function HeroLink({ href, label, children, tone }) {
  const tones = {
    fuchsia: 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25',
    green: 'border-green-400/40 bg-green-500/15 text-green-100 hover:bg-green-500/25',
    cyan: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25',
  };
  return (
    <a
      href={href}
      aria-label={label}
      className={`min-h-10 rounded-xl border px-4 py-2 text-sm font-bold transition ${tones[tone]}`}
    >
      {children}
    </a>
  );
}

function Pillar({ eyebrow, title, items, marker, markerClass, label }) {
  return (
    <section className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <h4 className="mt-1 mb-3 text-base font-black text-white">{title}</h4>
      <ProgressiveList
        items={items}
        marker={marker}
        markerClass={markerClass}
        initialVisible={3}
        label={label}
      />
    </section>
  );
}

export default function MeganWarRoomOverview() {
  const w = maySevenUpdate.warRoom;

  return (
    <section className="mb-6 rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/30 via-slate-950/60 to-cyan-950/20 p-6 shadow-2xl shadow-fuchsia-950/20">
      <header className="mb-5 grid gap-4 xl:grid-cols-[1.4fr_0.8fr] xl:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">May 7 War Room</p>
          <h3 className="mt-1 text-2xl font-black text-white">Tyler × Megan Alignment Brief</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{w.objective}</p>
        </div>
        <div role="group" aria-label="Designed deep-dive jump links" className="flex flex-wrap gap-2 xl:justify-end">
          <HeroLink tone="fuchsia" href="#megan-overview-guide" label="Jump to Designed Megan Overview Guide">Overview guide</HeroLink>
          <HeroLink tone="green" href="#psh-msp-escalation-view" label="Jump to PSH MSP Escalation View">MSP escalation</HeroLink>
          <HeroLink tone="cyan" href="#source-truth-review" label="Jump to Embedded Source-of-Truth Review">Evidence</HeroLink>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Pillar
          eyebrow="Decisions"
          title="To land today"
          items={w.decisionTopics}
          marker="•"
          markerClass="text-cyan-300"
          label="decisions"
        />
        <Pillar
          eyebrow="Billing / CSP"
          title="Where the money is moving"
          items={w.billingSnapshot}
          marker="→"
          markerClass="text-amber-300"
          label="billing notes"
        />
        <Pillar
          eyebrow="Framing"
          title="How we run the conversation"
          items={w.talkTrack}
          marker="✓"
          markerClass="text-green-300"
          label="framing notes"
        />
      </div>
    </section>
  );
}
