const NAV_ITEMS = [
  { id: 'overview',    label: 'Executive Overview',  icon: '📊' },
  { id: 'msp-review',  label: 'MSP Portal',           icon: '🤝' },
  { id: 'findings',    label: 'Findings Explorer',   icon: '🔍' },
  { id: 'tenants',     label: 'Tenant Deep Dives',   icon: '🏢' },
  { id: 'guests',      label: 'Guest Inventory',     icon: '👥' },
  { id: 'unknown',     label: 'Unknown Tenants',     icon: '⚠️' },
  { id: 'compliance',  label: 'Compliance Matrix',   icon: '✅' },
  { id: 'roadmap',     label: 'Roadmap & Gates',     icon: '🗺️' },
  { id: 'positive',    label: "What's Working",      icon: '🌟' },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <img
          src="/ctu-dashboard/htt-logo-white.png"
          alt="HTT Brands"
          className="h-7 w-auto opacity-90"
        />
      </div>

      {/* Nav */}
      <nav aria-label="Dashboard sections" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
            className={`nav-link w-full text-left ${active === item.id ? 'active' : ''}`}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-600">
          Phase 1 Audit · v1.1
        </p>
        <p className="mt-0.5 text-[10px] text-slate-700">
          Post-Call · MSP Portal Live
        </p>
      </div>
    </aside>
  );
}
