import { useState, useEffect, useCallback } from 'react';
import PasswordGate from './components/PasswordGate';
import Sidebar from './components/Sidebar';
import ExecutiveOverview from './components/ExecutiveOverview';
import FindingsExplorer from './components/FindingsExplorer';
import TenantDeepDive from './components/TenantDeepDive';
import GuestInventory from './components/GuestInventory';
import UnknownTenants from './components/UnknownTenants';
import ComplianceMatrix from './components/ComplianceMatrix';
import RoadmapGates from './components/RoadmapGates';
import PositiveFindings from './components/PositiveFindings';
import MSPWalkthrough from './components/MSPWalkthrough';
import ThemeToggle from './components/ThemeToggle';

const SECTIONS = [
  'overview', 'msp-review', 'findings', 'tenants', 'guests',
  'unknown', 'compliance', 'roadmap', 'positive',
];
const THEME_KEY = 'ctu-dashboard-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function App() {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
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
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <PasswordGate theme={theme} onToggleTheme={toggleTheme}>
      <div className="flex min-h-screen overflow-x-hidden">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-slate-300 shadow-lg lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
          aria-controls="dashboard-sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on desktop, slide-over on mobile */}
        <div id="dashboard-sidebar" className={`fixed inset-y-0 left-0 z-40 w-60 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar active={active} onNavigate={handleNavigate} />
        </div>

        <main className="min-w-0 flex-1 px-6 py-8 lg:ml-60 lg:px-8">
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                Cross-Tenant Utility · Phase 1 Audit Report
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
                Identity Governance Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                HTT Brands · 5 tenants · 7 domains · 106 findings
              </p>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </header>

          <div className="space-y-20">
            <ExecutiveOverview />
            <MSPWalkthrough />
            <FindingsExplorer />
            <TenantDeepDive />
            <GuestInventory />
            <UnknownTenants />
            <ComplianceMatrix />
            <RoadmapGates />
            <PositiveFindings />
          </div>

          <footer className="mt-20 border-t border-slate-800 py-8 text-center text-xs text-slate-600">
            <p>CTU Dashboard v1.0 · Phase 1 Audit Snapshot · HTT Brands</p>
            <p className="mt-1">
              For Tyler Granlund (IT Director) &amp; Dustin Boyd (IT Operations &amp; Support Lead)
            </p>
          </footer>
        </main>
      </div>
    </PasswordGate>
  );
}
