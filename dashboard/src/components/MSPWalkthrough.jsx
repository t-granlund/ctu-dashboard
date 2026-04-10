import useMspState from './msp/useMspState';
import CallAgenda from './msp/CallAgenda';
import ConfirmedContext from './msp/ConfirmedContext';
import CriticalDiscovery from './msp/CriticalDiscovery';
import MeganProfile from './msp/MeganProfile';
import AppRiverDeepDive from './msp/AppRiverDeepDive';
import TenantFootprint from './msp/TenantFootprint';
import VendorReview from './msp/VendorReview';
import BillingLandscape from './msp/BillingLandscape';
import InsuranceGaps from './msp/InsuranceGaps';
import BlindSpots from './msp/BlindSpots';
import RoadmapImpact from './msp/RoadmapImpact';
import ActionItems from './msp/ActionItems';

export default function MSPWalkthrough() {
  const {
    state,
    setVendorStatus,
    setVendorNote,
    toggleAskedQuestion,
    setQuestionAnswer,
    toggleVendorQuestion,
    exportNotes,
  } = useMspState();

  return (
    <section id="msp-review" className="scroll-mt-8">
      {/* Section header */}
      <div className="mb-8 border-l-4 border-cyan-500 pl-4">
        <h2 className="section-title" style={{ color: '#06b6d4' }}>
          🔧 MSP Relationship Review — Call Deck
        </h2>
        <p className="text-sm text-slate-400">
          Conversation guide for Megan Myrand (Sui Generis) · 45 min ·
          All notes persist to localStorage.
        </p>
      </div>

      {/* Sticky call agenda nav */}
      <CallAgenda />

      <div className="space-y-16">
        {/* ── 1. Set the Stage ──────────────────────────── */}
        <ConfirmedContext />
        <CriticalDiscovery />
        <MeganProfile />

        {/* ── 2. AppRiver Cleanup ──────────────────────── */}
        <AppRiverDeepDive />

        {/* ── 3. Tenant Footprint ──────────────────────── */}
        <div id="section-tenants" className="scroll-mt-24">
          <TenantFootprint />
          <div className="mt-8">
            <VendorReview
              state={state}
              setVendorStatus={setVendorStatus}
              setVendorNote={setVendorNote}
              toggleVendorQuestion={toggleVendorQuestion}
            />
          </div>
        </div>

        {/* ── 4. Licensing & Billing ───────────────────── */}
        <BillingLandscape />

        {/* ── 5. Cyber Insurance Gaps ──────────────────── */}
        <div id="section-insurance-wrapper">
          <InsuranceGaps />
          <div className="mt-8">
            <BlindSpots
              state={state}
              toggleAskedQuestion={toggleAskedQuestion}
              setQuestionAnswer={setQuestionAnswer}
            />
          </div>
        </div>

        {/* ── 6. Roadmap & Lifecycle ───────────────────── */}
        <RoadmapImpact />

        {/* ── 7. Action Items ──────────────────────────── */}
        <div id="section-actions" className="scroll-mt-24">
          <ActionItems state={state} exportNotes={exportNotes} />
        </div>
      </div>
    </section>
  );
}
