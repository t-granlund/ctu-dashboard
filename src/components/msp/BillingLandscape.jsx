import { azureBilling } from '../../data/msp-data';

function BillingAccountCard({ account, index }) {
  const isOdd = account.note.includes('?');
  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm ${
      isOdd
        ? 'border-yellow-500/30 bg-yellow-950/15'
        : 'border-slate-700/50 bg-slate-800/60'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-sm font-bold text-white">{account.name}</h5>
        <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400">
          {account.type}
        </span>
      </div>

      <div className="mb-3 space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 text-slate-500">Address</span>
          <span className={isOdd ? 'text-yellow-300' : 'text-slate-300'}>{account.address}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 text-slate-500">Email</span>
          <span className="font-mono text-slate-300">{account.email}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 text-slate-500">Created</span>
          <span className="text-slate-400">{account.created}</span>
        </div>
      </div>

      <p className={`text-xs italic ${isOdd ? 'text-yellow-400/70' : 'text-slate-500'}`}>
        {isOdd && '⚠️ '}{account.note}
      </p>
    </div>
  );
}

function SubscriptionTable() {
  const tenants = [...new Set(azureBilling.subscriptions.map((s) => s.tenant))];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/40">
            {['Subscription', 'ID', 'Tenant', 'Est. Cost', 'Purpose'].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {azureBilling.subscriptions.map((sub) => {
            const isWarning = sub.purpose.includes('⚠️');
            return (
              <tr key={sub.id} className={`border-b border-slate-700/30 ${
                isWarning ? 'bg-yellow-950/10' : 'hover:bg-slate-800/40'
              }`}>
                <td className={`px-3 py-2 text-sm font-medium ${
                  isWarning ? 'text-yellow-300' : 'text-slate-200'
                }`}>
                  {sub.name}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{sub.id}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                    {sub.tenant}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-300">{sub.estCost}</td>
                <td className={`px-3 py-2 text-xs ${isWarning ? 'text-yellow-300' : 'text-slate-400'}`}>
                  {sub.purpose}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BillingLandscape() {
  return (
    <div id="section-licensing" className="scroll-mt-24">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
        <span>💳</span> Licensing & Billing Landscape
      </h3>
      <p className="mb-4 text-sm text-slate-400">{azureBilling.summary}</p>

      {/* Billing Account Cards */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-400">
          3 Billing Accounts Found
        </h4>
        <div className="grid gap-4 lg:grid-cols-3">
          {azureBilling.billingAccounts.map((acct, i) => (
            <BillingAccountCard key={i} account={acct} index={i} />
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
        <div className="border-b border-slate-700/50 px-5 py-3">
          <h4 className="flex items-center justify-between text-sm font-semibold text-white">
            <span>Azure Subscriptions ({azureBilling.subscriptions.length})</span>
            <span className="text-xs font-normal text-cyan-400">
              Est. total: {azureBilling.totalEstimated}
            </span>
          </h4>
        </div>
        <SubscriptionTable />
      </div>

      {/* Questions for Megan */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-sm">
        <h4 className="mb-3 text-sm font-bold text-cyan-300">
          👉 Questions for Megan
        </h4>
        <ul className="space-y-2">
          {[
            'Which of these billing accounts does Sui Generis manage?',
            'Which subscriptions are CSP-billed (through PAX8) vs. direct MCA?',
            'Can we consolidate to a single billing account?',
            'What are the 2 unnamed "Azure subscription 1" subscriptions for?',
            'Is the Ann Arbor address a Franworth/TLL legacy?',
          ].map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-cyan-200/80">
              <span className="mt-0.5 shrink-0 text-cyan-400">?</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
