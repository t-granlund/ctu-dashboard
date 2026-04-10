/**
 * Pure-CSS stacked horizontal bar chart.
 *
 * Props:
 *   segments — [{ value: number, color: string, label: string }]
 *   height   — bar height (Tailwind class, default "h-6")
 *   showLabels — show value inside segments if wide enough
 *   className — additional container classes
 */
export default function BarChart({
  segments = [],
  height = 'h-6',
  showLabels = true,
  className = '',
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  return (
    <div className={`flex w-full overflow-hidden rounded-md ${height} ${className}`}>
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={i}
            className="relative flex items-center justify-center overflow-hidden text-xs font-semibold text-white/90 transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.value} (${pct.toFixed(1)}%)`}
          >
            {showLabels && pct > 8 && (
              <span className="drop-shadow-sm">{seg.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Labeled bar row — label on left, bar on right, total on far right.
 */
export function LabeledBar({ label, segments, total, height = 'h-5' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-sm text-slate-300">{label}</span>
      <div className="flex-1">
        <BarChart segments={segments} height={height} showLabels={true} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-slate-200">{total}</span>
    </div>
  );
}
