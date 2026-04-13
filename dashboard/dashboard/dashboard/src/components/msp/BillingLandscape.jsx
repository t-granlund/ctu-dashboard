import { azureBilling } from '../../data/msp-data';

function BillingAccountCard({ account }) {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-800/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-white">{account.name}</p>
        <span className="text-[10px] font-semibold text-slate-500">{account.type}</span>
      </div>
      <div className="space-y-1 text-xs text-slate-400">
        <p>{account.address}</p>
        <p className="font-mono text-slate-500">{account.email}</p>
      </div>
      <p className="mt-2 text-xs text-slate-500 italic">{account.note}</p>
    </div>
  );
}

export default function BillingLandscape() {
  return (
    <div>
      <h4 className="mb-2 text-base font-semibold text-white">Billing Accounts</h4>
      <p className="mb-4 text-sm text-slate-500">
        {azureBilling.summary}
      </p>

      <div className="mb-8 grid gap-3 lg:grid-cols-3">
        {azureBilling.billingAccounts.map((acct, i) => (
          <BillingAccountCard key={i} account={acct} />
        ))}
      </div>

      {/* Subscriptions — simplified */}
      <h4 className="mb-2 text-base font-semibold text-white">
        Azure Subscriptions
      </h4>
      <p className="mb-4 text-xs text-slate-500">
        {azureBilling.subscriptions.length} subscriptions · Est. total: {azureBilling.totalEstimated}
      </p>

      <div className="space-y-1.5">
        {azureBilling.subscriptions.map((sub) => {
          const isWarning = sub.purpose.includes('⚠️');
          return (
            <div
              key={sub.id}
              className={`flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm ${
                isWarning ? 'bg-yellow-950/10 border border-yellow-500/10' : 'bg-slate-800/20'
              }`}
            >
              <span className="w-48 shrink-0 font-medium text-slate-300 truncate">{sub.name}</span>
              <span className="rounded bg-slate-700/40 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                {sub.tenant}
              </span>
              <span className="flex-1 text-xs text-slate-500">{sub.purpose}</span>
              <span className="font-mono text-xs text-slate-500">{sub.estCost}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
