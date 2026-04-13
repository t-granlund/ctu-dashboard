import { CRITICAL_PATH } from './data';

export default function CriticalPath() {
  return (
    <div>
      <h2 className="section-title">What&rsquo;s Next — Critical Path</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
              <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Task</th>
              <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Owner</th>
              <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Blocker</th>
            </tr>
          </thead>
          <tbody>
            {CRITICAL_PATH.map((item, i) => (
              <tr key={item.task} className="border-b border-slate-800/50">
                <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                <td className="py-3 pr-4 text-slate-200">{item.task}</td>
                <td className="py-3 pr-4">
                  <span className="badge bg-slate-700/50 text-slate-300">{item.owner}</span>
                </td>
                <td className="py-3">
                  {item.blocker ? (
                    <span className="badge border border-amber-500/30 bg-amber-500/10 text-amber-400">{item.blocker}</span>
                  ) : (
                    <span className="text-xs text-emerald-500">Ready</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
