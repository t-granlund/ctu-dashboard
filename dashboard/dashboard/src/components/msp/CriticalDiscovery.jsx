import { criticalDiscovery } from '../../data/msp-data';

export default function CriticalDiscovery() {
  return (
    <div className="rounded-xl border-2 border-red-500/60 bg-red-950/30 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 text-2xl">🔴</span>
        <div>
          <h3 className="text-lg font-bold text-red-300">Critical Discovery</h3>
          <p className="mt-0.5 text-sm font-semibold text-red-400">
            {criticalDiscovery.title}
          </p>
        </div>
      </div>

      {/* Detail */}
      <p className="mb-4 text-sm leading-relaxed text-red-200/80">
        {criticalDiscovery.detail}
      </p>

      {/* Affected tenants */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-400/60">
          Affected:
        </span>
        {criticalDiscovery.tenants.map((t) => (
          <span
            key={t}
            className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Action question */}
      <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3">
        <p className="text-sm font-medium text-red-300">
          👉 {criticalDiscovery.question}
        </p>
      </div>
    </div>
  );
}
