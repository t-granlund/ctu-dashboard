import { roadmapImpact, confirmedContext } from '../../data/msp-data';

const IMPACT_STYLE = {
  low:    { bg: 'bg-green-500/20', text: 'text-green-300', ring: 'ring-green-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', ring: 'ring-yellow-500/30' },
  high:   { bg: 'bg-red-500/20', text: 'text-red-300', ring: 'ring-red-500/30' },
};

const TIMELINE_COLOR = {
  low:    'border-green-500/40',
  medium: 'border-yellow-500/40',
  high:   'border-red-500/40',
};

function PhaseCard({ phase, isLast }) {
  const style = IMPACT_STYLE[phase.mspImpact];

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={`h-4 w-4 rounded-full ring-2 ${style.bg} ${style.ring}`} />
        {!isLast && (
          <div className={`w-0.5 flex-1 border-l-2 border-dashed ${TIMELINE_COLOR[phase.mspImpact]}`} />
        )}
      </div>

      {/* Content */}
      <div className="mb-8 flex-1 rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{phase.phase}</h4>
            <span className="text-xs text-slate-500">{phase.timing}</span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
            MSP Impact: {phase.mspImpact}
          </span>
        </div>

        {/* Changes */}
        <ul className="mb-3 space-y-1">
          {phase.changes.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-0.5 shrink-0 text-cyan-500">→</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        {/* MSP Note */}
        <div className={`rounded-lg border px-4 py-3 ${
          phase.mspImpact === 'high'
            ? 'border-red-500/30 bg-red-950/20'
            : phase.mspImpact === 'medium'
              ? 'border-yellow-500/20 bg-yellow-950/10'
              : 'border-green-500/20 bg-green-950/10'
        }`}>
          <p className={`text-xs ${
            phase.mspImpact === 'high'
              ? 'text-red-300'
              : phase.mspImpact === 'medium'
                ? 'text-yellow-300'
                : 'text-green-300'
          }`}>
            <strong>MSP Impact:</strong> {phase.mspNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RoadmapImpact() {
  return (
    <div id="section-roadmap" className="scroll-mt-24">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
        <span>🗺️</span> Roadmap & MSP Impact
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        CTU phases with impact assessment on Sui Generis / PAX8 operations.
      </p>

      {/* Timeline */}
      <div className="mb-8">
        {roadmapImpact.map((phase, i) => (
          <PhaseCard key={i} phase={phase} isLast={i === roadmapImpact.length - 1} />
        ))}
      </div>

      {/* Identity Lifecycle Vision */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-sm">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-300">
          <span>🎯</span> Identity Lifecycle Vision — Where We're Headed
        </h4>
        <p className="text-sm text-cyan-200/80">{confirmedContext.lifecycleVision}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            'User Properties → Dynamic Groups',
            'Automated License Provisioning',
            'Human-in-the-Loop Approvals',
            'Device Management Integration',
            'Onboarding/Offboarding Lifecycle',
          ].map((tag) => (
            <span key={tag} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
