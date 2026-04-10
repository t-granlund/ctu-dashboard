import { meganDetails } from '../../data/msp-data';

function AccountCard({ tenant, data }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-400">
          {tenant}
        </span>
        <span className="text-sm font-semibold text-white">{data.displayName}</span>
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
          {data.userType}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div>
          <span className="text-slate-500">Email</span>
          <p className="font-mono text-slate-300">{data.mail}</p>
        </div>
        <div>
          <span className="text-slate-500">UPN</span>
          <p className="truncate font-mono text-slate-400" title={data.upn}>
            {data.upn}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Created</span>
          <p className="text-slate-300">{data.created}</p>
        </div>
        <div>
          <span className="text-slate-500">Last Sign-In</span>
          <p className="text-slate-300">{data.lastSignIn}</p>
        </div>
      </div>

      {/* Admin Roles */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Admin Roles:
        </span>
        {data.adminRoles.length === 0 ? (
          <span className="rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
            None ✓
          </span>
        ) : (
          data.adminRoles.map((r) => (
            <span key={r} className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">
              {r}
            </span>
          ))
        )}
      </div>

      {/* Groups */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Groups:
        </span>
        {data.groupMemberships.map((g) => (
          <span key={g} className="rounded bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300">
            {g}
          </span>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs italic text-slate-500">{data.note}</p>
    </div>
  );
}

export default function MeganProfile() {
  return (
    <div className="mt-6">
      <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <span>👤</span> Megan Myrand — Guest Account Details
      </h4>
      <p className="mb-4 text-sm text-slate-400">
        Informational — Megan has guest accounts in 2 tenants. No admin roles, active usage.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(meganDetails).map(([tenant, data]) => (
          <AccountCard key={tenant} tenant={tenant} data={data} />
        ))}
      </div>
    </div>
  );
}
