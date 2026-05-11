// Shared design-system atoms for the MSP portal redesign.
// These exist so every section below the cross-tenant hero speaks the
// same calm visual language: dark slate base, single cyan accent,
// monochrome ordinal status, type scale 32 / 20 / 14 / 12.
//
// Avoid colored gradients, colored borders, and decorative emoji here.
// If a section needs hierarchy, give it position, weight, and tracking,
// not hue.

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

export function SectionHeader({ eyebrow, title, sub, action, id }) {
  return (
    <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h3 id={id} className="mt-1 text-xl font-bold text-white">{title}</h3>
        {sub && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function Surface({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-2xl border border-slate-800 bg-slate-900/40 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function MetaPair({ label, value }) {
  return (
    <div>
      <Eyebrow className="text-[11px]">{label}</Eyebrow>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export function ActionLink({ href, target = '_self', children }) {
  const external = target === '_blank';
  return (
    <a
      href={href}
      target={target}
      rel={external ? 'noreferrer' : undefined}
      className="inline-flex min-h-6 items-center text-sm font-bold text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200"
    >
      {children}{external ? ' ↗' : ''}
    </a>
  );
}

// Minimal table primitive: header row in slate-400 caps, divided rows,
// align-top cells. Caller controls columns & content. The wrapper is
// keyboard-focusable so scrollable tables stay usable without a mouse
// (axe scrollable-region-focusable).
export function MiniTable({ caption, columns, children, className = '' }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${caption} table scroll area`}
      className={`overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 ${className}`}
    >
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-400">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-4 py-3 font-bold ${c.align === 'right' ? 'text-right' : 'text-left'} ${c.width ?? ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// Sequential / ordinal severity used outside the cross-tenant matrix
// (e.g. action register priority). Same monochrome ordinal palette.
const SEVERITY_DOT = {
  high:   '#fb7185', // rose-400
  medium: '#fbbf24', // amber-400
  low:    '#94a3b8', // slate-400
};

export function SeverityDot({ severity, label }) {
  const color = SEVERITY_DOT[severity] ?? SEVERITY_DOT.low;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200">
      <span aria-hidden="true" style={{ background: color }} className="h-2 w-2 rounded-full" />
      {label ?? severity}
    </span>
  );
}

// Status pill: neutral surface, ordinal dot, small uppercase label.
// Used wherever the old design painted whole pills in green/amber/violet/blue.
// Single accent color is reserved for the DCE star elsewhere; pills get only
// a leading dot in the sequential ordinal palette.
const STATUS_PILL_DOT = {
  ok:      '#34d399', // green
  warn:    '#fbbf24', // amber
  blocked: '#fb7185', // rose
  info:    '#94a3b8', // slate
  pending: '#94a3b8', // slate (alias)
};

export function StatusPill({ tone = 'info', children }) {
  const dot = STATUS_PILL_DOT[tone] ?? STATUS_PILL_DOT.info;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
      <span aria-hidden="true" style={{ background: dot }} className="inline-block h-1.5 w-1.5 rounded-full" />
      {children}
    </span>
  );
}

// Quote pull: monochrome blockquote for operating rules, principles.
export function PullQuote({ children }) {
  return (
    <blockquote className="border-l-2 border-slate-600 pl-4 text-sm leading-6 italic text-slate-100">
      {children}
    </blockquote>
  );
}
