import { meganOverviewGuide } from '../../data/megan-overview-guide';
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

function GuideTable({ caption, columns, rows }) {
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

// Numbered step rail — tabular-nums + monochrome to match the lifecycle stage
// numbering and program horizon dates.
function StepRail({ items }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] tabular-nums text-slate-400">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs leading-5 text-slate-200">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function MeganOverviewGuide() {
  const guide = meganOverviewGuide;
  const asks = [
    'Confirm Pax8 / CSP replacement and export path.',
    'Validate DCE runbook + assign auto-redeem owner/date.',
    'Provide backup, phishing, and insurance-attestation answers.',
  ];

  return (
    <section id="megan-overview-guide" className="scroll-mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div>
          <Eyebrow>Designed call guide</Eyebrow>
          <h3 className="mt-1 text-xl font-bold text-white">{guide.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{guide.purpose}</p>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <Eyebrow>Note</Eyebrow>
            <p className="mt-2 text-xs leading-5 text-slate-200">{guide.note}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Eyebrow>Call details</Eyebrow>
          <div className="mt-3 space-y-3">
            <MetaPair label="Call" value={guide.call} />
            <MetaPair label="Time" value={guide.time} />
            <MetaPair label="Date" value={guide.date} />
          </div>
        </div>
      </header>

      <div className="mb-6">
        <ScanFirstGrid
          eyebrow="Scan first"
          title="What matters before the wall of detail"
          summary={guide.operatingModel.takeaway}
          items={asks.map((ask, index) => ({ eyebrow: `Ask ${index + 1}`, title: ask }))}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <NeutralCard eyebrow="Operating model" title="HTT owns the standard">
          <List items={guide.operatingModel.htt} initialVisible={3} label="HTT responsibilities" />
        </NeutralCard>
        <NeutralCard eyebrow="Operating model" title="Sui Generis operationalizes">
          <List items={guide.operatingModel.suiGeneris} initialVisible={3} label="Sui Generis responsibilities" />
        </NeutralCard>
        <NeutralCard eyebrow="Takeaway" title="Collaboration frame">
          <p className="text-sm leading-6 text-slate-300">{guide.operatingModel.takeaway}</p>
        </NeutralCard>
      </div>

      <div className="mb-6 space-y-3">
        <SectionHeader title="Current priority picture" />
        <GuideTable caption="Current priority picture" columns={['Area', 'Where we are today', 'What we need from Megan']} rows={guide.priorities} />
      </div>

      <div className="mb-6 space-y-3">
        <SectionHeader title="Repo-backed source map" />
        <GuideTable caption="Repo-backed source map" columns={['Repo', 'What it supplies', 'Relevance for Megan']} rows={guide.repoMap} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <NeutralCard eyebrow="DCE model tenant" title="Live today">
          <p className="mb-3 text-xs leading-5 text-slate-300">{guide.deltaCrown.summary}</p>
          <List items={guide.deltaCrown.live} marker="✓" initialVisible={3} label="live items" />
        </NeutralCard>
        <NeutralCard eyebrow="DCE model tenant" title="Blocked · open">
          <List items={guide.deltaCrown.blocked} marker="!" initialVisible={3} label="blocked items" />
        </NeutralCard>
        <NeutralCard eyebrow="DCE model tenant" title="Validation flow">
          <StepRail items={guide.deltaCrown.validationFlow} />
        </NeutralCard>
      </div>

      <div className="mb-6 space-y-3">
        <SectionHeader title="Billing / CSP questions to land today" />
        <GuideTable caption="Billing and CSP questions to land today" columns={['Topic', 'Question']} rows={guide.billingQuestions} />
        <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs leading-5 text-slate-200">
          <span className="font-bold text-white">Finance end goal:</span> one clear per-tenant view of current spend, renewal dates, and projected run-rate.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <NeutralCard eyebrow="Security" title="Already confirmed by Megan">
          <List items={guide.security.confirmed} marker="✓" initialVisible={4} label="confirmed security facts" />
        </NeutralCard>
        <NeutralCard eyebrow="Security" title="Open asks">
          <List items={guide.security.openAsks} marker="→" />
        </NeutralCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <NeutralCard eyebrow="Governance" title="Groups and distribution lists">
          <List items={guide.groups} marker="↳" />
        </NeutralCard>
        <NeutralCard eyebrow="Support routing" title="How the hubs help Megan">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <Eyebrow>Groups Hub</Eyebrow>
              <div className="mt-2"><List items={guide.supportHubs.groupsHub} marker="·" initialVisible={3} label="Groups Hub details" /></div>
            </div>
            <div>
              <Eyebrow>People Support Hub</Eyebrow>
              <div className="mt-2"><List items={guide.supportHubs.peopleSupportHub} marker="·" initialVisible={3} label="People Support Hub details" /></div>
            </div>
            <div>
              <Eyebrow>Helps Megan</Eyebrow>
              <div className="mt-2"><List items={guide.supportHubs.helpsMegan} marker="✓" initialVisible={3} label="Megan benefits" /></div>
            </div>
          </div>
        </NeutralCard>
      </div>

      <div className="mb-6 space-y-3">
        <SectionHeader title="Requested outcomes before ending the call" />
        <GuideTable caption="Requested outcomes before ending the call" columns={['Outcome', 'Owner', 'Target']} rows={guide.outcomes} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <Eyebrow>Closing script</Eyebrow>
        <div className="mt-2">
          <PullQuote>“{guide.closingScript}”</PullQuote>
        </div>
      </div>
    </section>
  );
}
