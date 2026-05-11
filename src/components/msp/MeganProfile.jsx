import { meganDetails } from '../../data/msp-data';
import { StatusPill } from './atoms';

function AccountCard({ tenant, data }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[10px] font-bold text-slate-200">
          {tenant}
        </span>
        <span className="text-sm font-bold text-white">{data.displayName}</span>
        <span className="text-xs text-slate-400">({data.userType})</span>
      </header>

      <div className="space-y-1.5 text-xs leading-5">
        <p className="text-slate-300">
          <span className="text-slate-400">Email:</span> {data.mail}
        </p>
        <p className="text-slate-300">
          <span className="text-slate-400">Created:</span> {data.created}
          <span className="text-slate-500"> · </span>
          <span className="text-slate-400">Last sign-in:</span> {data.lastSignIn}
        </p>
        <p>
          {data.adminRoles.length === 0
            ? <StatusPill tone="ok">No admin roles</StatusPill>
            : <StatusPill tone="blocked">Admin roles · {data.adminRoles.join(', ')}</StatusPill>}
        </p>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">{data.note}</p>
    </article>
  );
}

export default function MeganProfile() {
  return (
    <div>
      <p className="mb-4 text-sm leading-6 text-slate-300">
        Your guest accounts across HTT tenants. No admin roles, active usage — informational only.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {Object.entries(meganDetails).map(([tenant, data]) => (
          <AccountCard key={tenant} tenant={tenant} data={data} />
        ))}
      </div>
    </div>
  );
}
