import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ExecutiveOverview from './components/ExecutiveOverview';
import FindingsExplorer from './components/FindingsExplorer';
import TenantDeepDive from './components/TenantDeepDive';
import GuestInventory from './components/GuestInventory';
import UnknownTenants from './components/UnknownTenants';
import ComplianceMatrix from './components/ComplianceMatrix';
import RoadmapGates from './components/RoadmapGates';
import PositiveFindings from './components/PositiveFindings';

const SECTIONS = [
  'overview', 'findings', 'tenants', 'guests',
  'unknown', 'compliance', 'roadmap', 'positive',
];

export default function App() {
  const [active, setActive] = useState('overview');

  /* Track which section is in view for sidebar highlighting */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const handleNavigate = useCallback((id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={handleNavigate} />

      <main className="ml-60 flex-1 px-8 py-8">
        {/* Top header */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Cross-Tenant Utility · Phase 1 Audit Report
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
            Identity Governance Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            HTT Brands · 5 tenants · 7 domains · 106 findings
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-20">
          <ExecutiveOverview />
          <FindingsExplorer />
          <TenantDeepDive />
          <GuestInventory />
          <UnknownTenants />
          <ComplianceMatrix />
          <RoadmapGates />
          <PositiveFindings />
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-800 py-8 text-center text-xs text-slate-600">
          <p>CTU Dashboard v1.0 · Phase 1 Audit Snapshot · HTT Brands</p>
          <p className="mt-1">
            For Tyler Granlund (IT Director) &amp; Dustin Boyd (IT Operations &amp; Support Lead)
          </p>
        </footer>
      </main>
    </div>
  );
}
