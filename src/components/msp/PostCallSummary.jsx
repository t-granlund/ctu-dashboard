import { callActionItems } from '../../data/msp-data';
import { Eyebrow, SectionHeader, StatusPill } from './atoms';

// Map priority to the sequential ordinal palette used by SeverityDot /
// StatusPill across the board. We keep the original priority slugs as the
// labels because they're meaningful here ("immediate", "this week", etc.).
const PRIORITY_TONE = {
  immediate:         'blocked',
  'this-week':       'warn',
  'next-week':       'warn',
  ongoing:           'info',
  'post-convention': 'info',
  'when-ready':      'info',
};

const OUTCOMES = [
  { tone: 'ok',   text: 'AppRiver migration confirmed 100% complete — all 3 service principals approved for removal' },
  { tone: 'ok',   text: 'Entra ID P2 already purchased on every tenant (blanket license via PAX8)' },
  { tone: 'ok',   text: 'Conditional Access deployed on DCE and FN — our audit data was stale' },
  { tone: 'ok',   text: 'TD SYNNEX can’t be removed but GDAP already revoked — low risk' },
  { tone: 'ok',   text: 'Atera confirmed as RMM tool — Delta Crown going all-Mac with MDM' },
  { tone: 'warn', text: 'Bishops MFA planned for post-convention to avoid support issues' },
  { tone: 'warn', text: 'BCC license migration to PAX8 in progress — Business Basic expires October; confirm any earlier non-BB renewal actions' },
];

const TONE_DOT = {
  ok:      '#34d399',
  warn:    '#fbbf24',
  blocked: '#fb7185',
};

function OutcomeRow({ tone, text }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" style={{ background: TONE_DOT[tone] }} className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" />
      <p className="text-sm leading-relaxed text-slate-200">{text}</p>
    </div>
  );
}

function ActionRow({ item }) {
  const tone = PRIORITY_TONE[item.priority] ?? 'info';
  const label = item.priority.replace('-', ' ');
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <span aria-hidden="true" style={{ background: TONE_DOT[tone] ?? '#94a3b8' }} className="inline-block h-2 w-2 shrink-0 rounded-full" />
      <p className="flex-1 text-sm text-slate-200">{item.action}</p>
      <StatusPill tone={tone}>{label}</StatusPill>
    </div>
  );
}

export default function PostCallSummary() {
  const meganItems = callActionItems.filter((i) => i.owner === 'Megan' || i.owner === 'Both');

  return (
    <div id="section-summary" className="scroll-mt-24">
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Eyebrow>April 10 historical recap</Eyebrow>
            <h3 className="mt-1 text-xl font-bold text-white">April 10 Historical Recap</h3>
            <p className="mt-1 text-sm text-slate-400">
              Call recap · April 10, 2026 · Historical context — superseded where May 7 decisions differ.
            </p>
          </div>
          <StatusPill tone="ok">Completed</StatusPill>
        </header>

        <div className="space-y-3">
          {OUTCOMES.map((o, i) => <OutcomeRow key={i} tone={o.tone} text={o.text} />)}
        </div>
      </section>

      <SectionHeader title="Your Action Items" />
      <div className="space-y-2">
        {meganItems.map((item, i) => <ActionRow key={i} item={item} />)}
      </div>
    </div>
  );
}
