import { useState } from 'react';
import CrossTenantOverview from './msp/CrossTenantOverview';
import MaySevenUpdate from './msp/MaySevenUpdate';
import MeganOverviewGuide from './msp/MeganOverviewGuide';
import PshMspEscalationView from './msp/PshMspEscalationView';
import SourceTruthReview from './msp/SourceTruthReview';
import PostCallSummary from './msp/PostCallSummary';
import LifecycleWorkflow from './msp/LifecycleWorkflow';
import ConfirmedContext from './msp/ConfirmedContext';
import MeganResponseForm from './msp/MeganResponseForm';
import AppRiverDeepDive from './msp/AppRiverDeepDive';
import TenantFootprint from './msp/TenantFootprint';
import BillingLandscape from './msp/BillingLandscape';
import InsuranceGaps from './msp/InsuranceGaps';
import MeganProfile from './msp/MeganProfile';
import exportMarkdown from './msp/exportMarkdown';

function CollapsibleReference({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  const panelId = `reference-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-900/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-800/30"
      >
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <span className="flex-1 text-sm font-bold text-slate-300">{title}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          {open ? 'Collapse' : 'Expand'}
        </span>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div id={panelId} className="border-t border-slate-800/50 px-6 py-6">{children}</div>}
    </div>
  );
}

export default function MSPWalkthrough() {
  return (
    <section id="msp-review" className="scroll-mt-8">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">MSP Partnership Portal</h2>

      <CrossTenantOverview />

      <div role="navigation" aria-label="MSP portal sections" className="my-12 border-y border-slate-800 py-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Drill in</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-200">
          {[
            ['May 7 working brief', '#section-may7-update'],
            ['Lifecycle workflow', '#msp-lifecycle-workflow'],
            ['Megan questions', '#section-questions'],
            ['MSP escalation', '#psh-msp-escalation-view'],
            ['Confirmed context', '#section-context'],
            ['Evidence', '#source-truth-review'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="inline-flex min-h-6 items-center underline decoration-slate-600 underline-offset-4 transition hover:decoration-slate-200">
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        <MaySevenUpdate />
        <LifecycleWorkflow />
        <MeganResponseForm onExport={exportMarkdown} />
        <PshMspEscalationView />
        <ConfirmedContext />
        <MeganOverviewGuide />
        <SourceTruthReview />
        <PostCallSummary />

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>📚</span> Reference Material
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Supporting detail from the Phase 1 audit — expand any section if you need context for your answers.
          </p>
          <div className="space-y-3">
            <CollapsibleReference title="Megan's Guest Account Details" icon="👤">
              <MeganProfile />
            </CollapsibleReference>
            <CollapsibleReference title="AppRiver Service Principals (Confirmed Remove)" icon="🔴">
              <AppRiverDeepDive />
            </CollapsibleReference>
            <CollapsibleReference title="Tenant Footprint — Service Principals & Partner Policies" icon="🏢">
              <TenantFootprint />
            </CollapsibleReference>
            <CollapsibleReference title="Licensing & Billing Landscape" icon="💳">
              <BillingLandscape />
            </CollapsibleReference>
            <CollapsibleReference title="Cyber Insurance Gap Assessment" icon="🛡️">
              <InsuranceGaps />
            </CollapsibleReference>
          </div>
        </div>
      </div>
    </section>
  );
}
