import { useState } from 'react';
import PostCallSummary from './msp/PostCallSummary';
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
  return (
    <div className="rounded-2xl border border-slate-700/30 bg-slate-900/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-slate-800/30 transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="flex-1 text-sm font-bold text-slate-300">{title}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          {open ? 'Collapse' : 'Expand'}
        </span>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-slate-800/50 px-6 py-6">{children}</div>}
    </div>
  );
}

export default function MSPWalkthrough() {
  return (
    <section id="msp-review" className="scroll-mt-8">
      {/* Section header — Megan-facing */}
      <div className="mb-8 border-l-4 border-cyan-500 pl-4">
        <h2 className="section-title" style={{ color: '#06b6d4' }}>
          🤝 MSP Partnership Portal
        </h2>
        <p className="text-sm text-slate-400">
          Hi Megan — this is the shared view of our cross-tenant governance project.
          Below you'll find what we confirmed on our call, plus a few remaining questions
          that will help Tyler finalize the Phase 3 security policies.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Your answers auto-save in this browser. When you're done, hit "Export as Markdown" to download a file you can send back.
        </p>
      </div>

      <div className="space-y-16">
        {/* ── 1. Call Recap & Action Items ──────────────── */}
        <PostCallSummary />

        {/* ── 2. Confirmed Context ─────────────────────── */}
        <ConfirmedContext />

        {/* ── 3. Megan's Questions (the main event) ────── */}
        <MeganResponseForm onExport={exportMarkdown} />

        {/* ── 4. Reference Material (collapsed) ────────── */}
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
