import { azureBilling } from '../../data/msp-data';
import { Eyebrow, SectionHeader, StatusPill } from './atoms';

function BillingAccountCard({ account }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <header className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">{account.name}</p>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{account.type}</span>
      </header>
      <div className="space-y-1 text-xs leading-5 text-slate-300">
        <p>{account.address}</p>
        <p className="font-mono text-slate-400">{account.email}</p>
      </div>
      <p className="mt-2 text-xs italic leading-5 text-slate-400">{account.note}</p>
    </article>
  );
}

export default function BillingLandscape() {
  return (
    <div>
      <SectionHeader
        eyebrow="Billing landscape"
        title="Billing Accounts"
        sub={azureBilling.summary}
      />

      <div className="mb-8 grid gap-3 lg:grid-cols-3">
        {azureBilling.billingAccounts.map((acct, i) => (
          <BillingAccountCard key={i} account={acct} />
        ))}
      </div>

      <Eyebrow>Azure subscriptions</Eyebrow>
      <p className="mt-1 mb-4 text-xs text-slate-400 tabular-nums">
        {azureBilling.subscriptions.length} subscriptions · Est. total: {azureBilling.totalEstimated}
      </p>

      <ul className="space-y-1.5">
        {azureBilling.subscriptions.map((sub) => {
          // Detect the original warning sentinel emoji but render a real
          // StatusPill instead of leaking it through the row.
          const isWarning = sub.purpose.includes('⚠️');
          const cleanPurpose = sub.purpose.replace(/⚠️\s?/g, '').trim();
          return (
            <li key={sub.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm">
              <span className="w-48 shrink-0 truncate font-bold text-slate-100">{sub.name}</span>
              <StatusPill tone="info">{sub.tenant}</StatusPill>
              {isWarning && <StatusPill tone="warn">Watch</StatusPill>}
              <span className="flex-1 text-xs text-slate-300">{cleanPurpose}</span>
              <span className="font-mono text-xs text-slate-400 tabular-nums">{sub.estCost}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
