import { useState } from 'react';

export function ShowMoreButton({ expanded, hiddenCount, label, onClick }) {
  if (!expanded && hiddenCount <= 0) return null;
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="mt-3 min-h-10 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs font-black text-slate-100 transition hover:bg-slate-800"
    >
      {expanded ? `Show fewer ${label}` : `Show ${hiddenCount} more ${label}`}
    </button>
  );
}

export function ProgressiveList({
  items,
  marker = '•',
  markerClass = 'text-cyan-300',
  initialVisible = 4,
  label = 'items',
  itemClassName = 'text-xs leading-5 text-slate-300',
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = items.length > initialVisible;
  const visibleItems = shouldCollapse && !expanded ? items.slice(0, initialVisible) : items;
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div>
      <ul className="space-y-2">
        {visibleItems.map((item, index) => (
          <li key={`${item}-${index}`} className={`flex gap-2 ${itemClassName}`}>
            <span className={`mt-0.5 ${markerClass}`}>{marker}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {shouldCollapse && (
        <ShowMoreButton
          expanded={expanded}
          hiddenCount={hiddenCount}
          label={label}
          onClick={() => setExpanded((value) => !value)}
        />
      )}
    </div>
  );
}

export function ScanFirstGrid({ eyebrow = 'Scan first', title, summary, items, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
    green: 'border-green-400/30 bg-green-500/10 text-green-300',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
    fuchsia: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300',
  };
  const toneClass = tones[tone] ?? tones.cyan;

  return (
    <div className={`rounded-3xl border p-5 ${toneClass}`}>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em]">{eyebrow}</p>
          <h4 className="text-xl font-black text-white">{title}</h4>
        </div>
        {summary && <p className="max-w-2xl text-sm leading-6 text-slate-300">{summary}</p>}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.title} className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {item.eyebrow ?? `Focus ${index + 1}`}
            </p>
            <p className="text-sm font-bold leading-6 text-white">{item.title}</p>
            {item.copy && <p className="mt-2 text-xs leading-5 text-slate-300">{item.copy}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailBlock({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-950/45">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-base font-black text-white">{title}</span>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          {open ? 'Collapse' : 'Expand'}
        </span>
      </button>
      {open && <div className="border-t border-slate-800/60 p-5">{children}</div>}
    </section>
  );
}
