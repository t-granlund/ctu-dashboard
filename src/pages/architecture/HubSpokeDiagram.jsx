import { TENANTS, SPOKE_KEYS, CONNECTIONS, FEATURE_MATRIX, SVG, SVG_PATHS } from './data';

const STATUS_COLORS = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

// ─── SVG Sub-components ─────────────────────────────────────────────────────

function SvgDefs() {
  return (
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
      </filter>
      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#22c55e" floodOpacity="0.3" result="color" />
        <feComposite in="color" in2="blur" operator="in" />
      </filter>
      <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#f59e0b" floodOpacity="0.3" result="color" />
        <feComposite in="color" in2="blur" operator="in" />
      </filter>
      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#ef4444" floodOpacity="0.3" result="color" />
        <feComposite in="color" in2="blur" operator="in" />
      </filter>
      <radialGradient id="bg-radial" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function HubNode() {
  const { cx, cy, w, h } = SVG.hub;
  const t = TENANTS.htt;
  const x = cx - w / 2;
  const y = cy - h / 2;

  return (
    <g>
      {/* Background card */}
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#1e293b" stroke="#475569" strokeWidth="1.5" filter="url(#shadow)" />
      {/* Brand accent (top strip via overlay) */}
      <rect x={x} y={y} width={w} height={h} rx={14} fill={t.color} opacity="0.15" />
      <rect x={x + 1} y={y + 6} width={w - 2} height={h - 7} rx={12} fill="#1e293b" />
      <line x1={x + 20} y1={y + 3} x2={x + w - 20} y2={y + 3} stroke={t.color} strokeWidth="3" strokeLinecap="round" />
      {/* Hub badge */}
      <rect x={cx - 32} y={y + 14} width={64} height={18} rx={9} fill={t.color} opacity="0.9" />
      <text x={cx} y={y + 27} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" letterSpacing="1.5">ANCHOR</text>
      {/* Name */}
      <text x={cx} y={y + 50} textAnchor="middle" fill="#f1f5f9" fontSize="17" fontWeight="800">{t.name}</text>
      {/* Domain */}
      <text x={cx} y={y + 67} textAnchor="middle" fill="#94a3b8" fontSize="11">{t.domain}</text>
      {/* Location */}
      <text x={cx} y={y + 83} textAnchor="middle" fill="#64748b" fontSize="10">Hub Tenant · {t.locations}</text>
    </g>
  );
}

function SpokeNode({ tenantKey }) {
  const s = SVG.spokes[tenantKey];
  const t = TENANTS[tenantKey];
  const x = s.cx - s.w / 2;
  const y = s.cy - s.h / 2;
  const statusColor = STATUS_COLORS[t.status];

  return (
    <g>
      {/* Card background */}
      <rect x={x} y={y} width={s.w} height={s.h} rx={14} fill="#1e293b" stroke="#334155" strokeWidth="1" filter="url(#shadow)" />
      {/* Left accent bar */}
      <rect x={x} y={y + 14} width={4} height={s.h - 28} rx={2} fill={t.color} />
      {/* Brand name */}
      <text x={s.cx + 4} y={y + 28} textAnchor="middle" fill={t.color} fontSize="14" fontWeight="800">{t.name}</text>
      {/* Domain */}
      <text x={s.cx + 4} y={y + 44} textAnchor="middle" fill="#94a3b8" fontSize="10">{t.domain}</text>
      {/* Locations */}
      <text x={s.cx + 4} y={y + 60} textAnchor="middle" fill="#64748b" fontSize="10">{t.locations}</text>
      {/* Status pill */}
      <rect x={s.cx - 36} y={y + 70} width={72} height={20} rx={10} fill={statusColor} opacity="0.15" stroke={statusColor} strokeWidth="1" />
      <circle cx={s.cx - 18} cy={y + 80} r={3.5} fill={statusColor} />
      <text x={s.cx + 4} y={y + 84} textAnchor="middle" fill={statusColor} fontSize="10" fontWeight="700">{t.statusLabel}</text>
      {/* Feature icons row */}
      <FeatureRow tenantKey={tenantKey} cx={s.cx + 4} y={y + 104} />
    </g>
  );
}

function FeatureRow({ tenantKey, cx, y }) {
  const features = TENANTS[tenantKey].features;
  if (!features) return null;
  const items = [
    { key: 'mto', label: 'MTO' },
    { key: 'identitySync', label: 'Sync' },
    { key: 'b2bScoped', label: 'B2B' },
    { key: 'mfaTrust', label: 'MFA' },
  ];
  const startX = cx - (items.length * 36) / 2;

  return (
    <g>
      {items.map((item, i) => {
        const val = features[item.key];
        const color = val === true ? '#22c55e' : val === false ? '#ef4444' : '#f59e0b';
        const symbol = val === true ? '✓' : val === false ? '✗' : '~';
        return (
          <g key={item.key} transform={`translate(${startX + i * 36}, 0)`}>
            <text x={0} y={y} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{symbol}</text>
            <text x={0} y={y + 12} textAnchor="middle" fill="#64748b" fontSize="7">{item.label}</text>
          </g>
        );
      })}
    </g>
  );
}

function ConnectionLine({ pathData, connection }) {
  const { d, labelX, labelY, key } = pathData;
  const { color, labels, status } = connection;
  const pathId = `path-${key}`;

  return (
    <g>
      {/* Glow layer */}
      <path d={d} stroke={color} strokeWidth="8" fill="none" opacity="0.12" filter={`url(#glow-${status})`} />
      {/* Main line */}
      <path id={pathId} d={d} stroke={color} strokeWidth="2" fill="none" opacity="0.7" strokeDasharray={status === 'red' ? '8 4' : 'none'} />
      {/* Animated pulse dot */}
      <circle r="4" fill={color} opacity="0.9">
        <animateMotion dur={status === 'green' ? '2.5s' : '3.5s'} repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      {/* Second pulse (offset) */}
      <circle r="3" fill={color} opacity="0.5">
        <animateMotion dur={status === 'green' ? '2.5s' : '3.5s'} repeatCount="indefinite" begin="1.2s">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      {/* Label badge */}
      <ConnectionLabel x={labelX} y={labelY} labels={labels} color={color} status={status} />
    </g>
  );
}

function ConnectionLabel({ x, y, labels, color, status }) {
  const lineHeight = 13;
  const boxH = labels.length * lineHeight + 10;
  const boxW = 100;
  const boxX = x - boxW / 2;
  const boxY = y - boxH / 2;

  return (
    <g>
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={8} fill="#0f172a" fillOpacity="0.92" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" />
      {labels.map((label, i) => (
        <text key={label} x={x} y={boxY + 12 + i * lineHeight} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="500">
          {label}
        </text>
      ))}
    </g>
  );
}

// ─── Main SVG Diagram ───────────────────────────────────────────────────────

function DiagramSvg() {
  return (
    <svg viewBox={SVG.viewBox} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Hub-and-spoke diagram showing HTT Brands tenant architecture">
      <SvgDefs />
      {/* Subtle radial background */}
      <rect width="960" height="490" fill="transparent" />
      <ellipse cx="480" cy="260" rx="420" ry="230" fill="url(#bg-radial)" />

      {/* Connection lines (rendered behind nodes) */}
      {SVG_PATHS.map((pathData) => {
        const conn = CONNECTIONS.find((c) => c.to === pathData.key);
        return <ConnectionLine key={pathData.key} pathData={pathData} connection={conn} />;
      })}

      {/* Hub node */}
      <HubNode />

      {/* Spoke nodes */}
      {SPOKE_KEYS.map((key) => (
        <SpokeNode key={key} tenantKey={key} />
      ))}
    </svg>
  );
}

// ─── Feature Comparison Table (below SVG) ───────────────────────────────────

function FeatureTable() {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Feature</th>
            {SPOKE_KEYS.map((key) => (
              <th key={key} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: TENANTS[key].color }}>
                {TENANTS[key].shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_MATRIX.map(({ label, key: fKey }) => (
            <tr key={fKey} className="border-b border-slate-800/50">
              <td className="py-2.5 pr-4 text-slate-300">{label}</td>
              {SPOKE_KEYS.map((tKey) => {
                const val = TENANTS[tKey].features[fKey];
                return (
                  <td key={tKey} className="px-3 py-2.5 text-center">
                    <FeatureCell value={val} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureCell({ value }) {
  if (value === true) return <span className="text-emerald-400 font-semibold">✓</span>;
  if (value === false) return <span className="text-red-400 font-semibold">✗</span>;
  if (value === 'both') return <span className="text-emerald-400 font-semibold">Both ✓</span>;
  if (value === 'hub-only') return <span className="text-amber-400 font-semibold">Hub→ only</span>;
  return <span className="text-slate-500">—</span>;
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { color: '#22c55e', label: 'Compliant — all features configured' },
    { color: '#f59e0b', label: 'Partial — key features missing' },
    { color: '#ef4444', label: 'At Risk — unscoped / needs remediation' },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <svg width="24" height="8" className="inline-block"><line x1="0" y1="4" x2="24" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" /></svg>
        Dashed = at risk
      </div>
    </div>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function HubSpokeDiagram() {
  return (
    <div>
      <h2 className="section-title">Hub-and-Spoke Architecture</h2>
      <div className="card p-2 sm:p-6">
        <DiagramSvg />
        <Legend />
      </div>
      <div className="card mt-6">
        <h3 className="card-header">Cross-Tenant Feature Matrix</h3>
        <FeatureTable />
      </div>
    </div>
  );
}
