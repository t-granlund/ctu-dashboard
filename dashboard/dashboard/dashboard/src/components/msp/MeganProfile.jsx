import { meganDetails } from '../../data/msp-data';

function AccountCard({ tenant, data }) {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-800/20 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-slate-300">
          {tenant}
        </span>
        <span className="text-sm font-medium text-white">{data.displayName}</span>
        <span className="text-xs text-slate-500">({data.userType})</span>
      </div>

      <div className="space-y-1.5 text-xs">
        <p className="text-slate-400">
          <span className="text-slate-500">Email:</span> {data.mail}
        </p>
        <p className="text-slate-400">
          <span className="text-slate-500">Created:</span> {data.created} · 
          <span className="text-slate-500"> Last sign-in:</span> {data.lastSignIn}
        </p>
        {data.adminRoles.length === 0 ? (
          <p className="text-green-400/60">No admin roles ✓</p>
        ) : (
          <p className="text-red-400">Admin roles: {data.adminRoles.join(', ')}</p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-600">{data.note}</p>
    </div>
  );
}

export default function MeganProfile() {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
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
