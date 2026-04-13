import { COMPLETED_ACTIONS } from './data';

export default function CompletedActions() {
  return (
    <div>
      <h2 className="section-title">What&rsquo;s Been Done</h2>
      <div className="card">
        <h3 className="card-header">Completed Remediation Actions</h3>
        <ul className="space-y-3">
          {COMPLETED_ACTIONS.map((action) => (
            <li key={action} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                ✓
              </span>
              <span className="text-slate-300">{action}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-xs text-emerald-400">
            <span className="font-semibold">Impact:</span>{' '}
            Franworth access eliminated, AppRiver legacy removed, MSP relationship fully documented, Phase 2 ready for execution.
          </p>
        </div>
      </div>
    </div>
  );
}
