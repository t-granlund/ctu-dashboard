import { sourceTruthReview } from '../../data/source-truth-review';
import { DetailBlock, ProgressiveList, ScanFirstGrid } from './ProgressiveDisclosure';
import { Eyebrow, SectionHeader, MiniTable, StatusPill } from './atoms';

function NeutralCard({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h4 className="mt-1 mb-3 text-sm font-bold text-white">{title}</h4>
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

function Matrix({ caption, columns, rows }) {
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

function RepoReview({ repo }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <header className="mb-4">
        <h4 className="text-base font-bold text-white">{repo.name}</h4>
        <code className="mt-1 block break-words text-[11px] text-slate-400">{repo.path}</code>
        <p className="mt-2 text-sm leading-6 text-slate-300">{repo.role}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <NeutralCard eyebrow="Canonical files" title="Source of truth">
          <List items={repo.canonical} marker="↳" />
        </NeutralCard>
        <NeutralCard eyebrow="What it proves" title="Evidence">
          <List items={repo.proves} marker="✓" />
        </NeutralCard>
        <NeutralCard eyebrow="Current state" title="Today">
          <List items={repo.state} marker="→" />
        </NeutralCard>
        <NeutralCard eyebrow="Risks · cleanup" title="Watch items">
          <List items={repo.risks} marker="!" />
        </NeutralCard>
      </div>
    </article>
  );
}

export default function SourceTruthReview() {
  const review = sourceTruthReview;

  return (
    <section id="source-truth-review" className="scroll-mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Internal source-of-truth map</Eyebrow>
          <h3 className="mt-1 text-xl font-bold text-white">{review.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            {review.date} · {review.purpose}
          </p>
        </div>
        <div className="flex max-w-xl flex-wrap gap-2">
          {review.scope.map((item) => <StatusPill key={item} tone="info">{item}</StatusPill>)}
        </div>
      </header>

      <div className="mb-6">
        <ScanFirstGrid
          tone="neutral"
          eyebrow="Scan first"
          title="Source-truth reading order"
          summary="Use this section as provenance, not bedtime reading. Start with verdict, dependencies, and call framing; expand repo detail only when someone asks “where did that come from?”"
          items={[
            { eyebrow: 'Verdict',      title: review.verdict[0],         copy: review.verdict[1] },
            { eyebrow: 'Dependency',   title: review.dependencyGraph[0], copy: review.dependencyGraph[1] },
            { eyebrow: 'Call framing', title: review.callFraming[0],     copy: review.callFraming[1] },
          ]}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <NeutralCard eyebrow="Executive verdict" title="What we believe">
          <List items={review.verdict} marker="✓" initialVisible={2} label="verdict items" />
        </NeutralCard>
        <NeutralCard eyebrow="Dependency graph" title="Where it routes">
          <List items={review.dependencyGraph} marker="→" initialVisible={2} label="dependency items" />
        </NeutralCard>
        <NeutralCard eyebrow="Call framing" title="How to talk about it">
          <List items={review.callFraming} marker="★" initialVisible={2} label="call-framing items" />
        </NeutralCard>
      </div>

      <div className="mb-8 space-y-3">
        <SectionHeader title="Portfolio source-of-truth map" />
        <Matrix caption="Portfolio source-of-truth map" columns={['Domain', 'Source of truth', 'Supporting repos']} rows={review.sourceMap} />
      </div>

      <div className="mb-8 space-y-3">
        <SectionHeader
          title="Repo-by-repo review"
          sub="Collapsed by default so the dashboard stays a dashboard. Expand a repo when you need provenance, cleanup risk, or canonical file paths."
        />
        {review.repos.map((repo, index) => (
          <DetailBlock key={repo.name} title={repo.name} defaultOpen={index === 0}>
            <RepoReview repo={repo} />
          </DetailBlock>
        ))}
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeader title="MSP / CSP / Pax8 billing map" />
          <Matrix caption="MSP, CSP, and Pax8 billing map" columns={['Bucket', 'Owner', 'Current state', 'Megan ask']} rows={review.billing} />
        </section>
        <section>
          <SectionHeader title="Unified identity model" />
          <Matrix caption="Unified identity model" columns={['Field', 'Purpose', 'Consumers']} rows={review.identityModel} />
        </section>
      </div>

      <div className="mb-8 space-y-3">
        <SectionHeader title="Prioritized post-call cleanup backlog" />
        <Matrix caption="Prioritized post-call cleanup backlog" columns={['Priority', 'Task', 'Repo']} rows={review.backlog} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NeutralCard eyebrow="Safe to screen-share" title="Discuss freely">
          <List items={review.shareGuidance.safe} marker="✓" initialVisible={3} label="screen-share notes" />
        </NeutralCard>
        <NeutralCard eyebrow="Keep internal" title="Sanitized only">
          <List items={review.shareGuidance.internal} marker="!" initialVisible={3} label="internal-only notes" />
        </NeutralCard>
      </div>

      <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs leading-5 text-slate-300">
        <span className="font-bold text-slate-100">Password-gate note:</span> this page is protected by the dashboard passphrase, but it is still static GitHub Pages client-side protection.
        Keep secrets, raw PII, tenant-changing scripts, and tokens out of here. The dog insists. 🐶
      </p>
    </section>
  );
}
