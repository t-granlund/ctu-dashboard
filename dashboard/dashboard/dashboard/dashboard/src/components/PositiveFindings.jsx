import { positiveFindings } from '../data/audit-data';

const ICON_MAP = {
  shield:   '🛡️',
  lock:     '🔒',
  users:    '👥',
  key:      '🔑',
  check:    '✅',
  eye:      '👁️',
  database: '🗄️',
};

function PositiveCard({ finding }) {
  return (
    <div className="card group border-green-500/10 transition-all hover:border-green-500/30">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-xl transition-transform group-hover:scale-110">
          {ICON_MAP[finding.icon] || '✅'}
        </span>
        <div>
          <p className="text-sm font-bold text-green-300">{finding.title}</p>
          <p className="mt-1 text-xs text-slate-400">{finding.detail}</p>
        </div>
      </div>
    </div>
  );
}

export default function PositiveFindings() {
  return (
    <section id="positive" className="space-y-8">
      <h2 className="section-title">What's Working</h2>

      {/* Success banner */}
      <div className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌟</span>
          <div>
            <p className="text-lg font-bold text-green-300">
              {positiveFindings.length} controls already meeting baseline
            </p>
            <p className="mt-0.5 text-sm text-green-200/60">
              Not everything is on fire. These controls are working correctly across the environment
              and represent a solid foundation to build on.
            </p>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {positiveFindings.map((f, i) => (
          <PositiveCard key={i} finding={f} />
        ))}
      </div>
    </section>
  );
}
