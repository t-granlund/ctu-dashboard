import { blindSpots, gdapFindings } from '../../data/msp-data';

const PRIORITY_STYLES = {
  critical: 'bg-red-500/20 text-red-300',
  high:     'bg-orange-500/20 text-orange-300',
  medium:   'bg-yellow-500/20 text-yellow-300',
};

function QuestionItem({ item, qKey, state, onToggle, onAnswer }) {
  const asked = state.askedQuestions[qKey] ?? false;
  const answer = state.questionAnswers[qKey] ?? '';

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      asked
        ? 'border-green-500/30 bg-green-950/10'
        : 'border-slate-700/30 bg-slate-900/30'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(qKey)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
            asked
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-600 bg-transparent text-transparent hover:border-cyan-500'
          }`}
        >
          ✓
        </button>

        <div className="flex-1">
          {/* Question + Priority */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${asked ? 'text-green-300 line-through' : 'text-slate-200'}`}>
              {item.question}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[item.priority]}`}>
              {item.priority}
            </span>
          </div>

          {/* Why it matters */}
          <p className="mt-1 text-xs text-slate-500">{item.why}</p>

          {/* Answer textarea */}
          <textarea
            value={answer}
            onChange={(e) => onAnswer(qKey, e.target.value)}
            placeholder="Record answer…"
            rows={2}
            className="mt-2 w-full resize-y rounded-md border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, catIdx, state, onToggle, onAnswer }) {
  const totalItems = category.items.length;
  const askedCount = category.items.filter(
    (_, i) => state.askedQuestions[`${catIdx}-${i}`],
  ).length;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{category.icon}</span>
        <h4 className="text-lg font-bold text-white">{category.category}</h4>
        <span className="ml-auto rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
          {askedCount}/{totalItems} asked
        </span>
      </div>
      <div className="space-y-3">
        {category.items.map((item, i) => (
          <QuestionItem
            key={i}
            item={item}
            qKey={`${catIdx}-${i}`}
            state={state}
            onToggle={onToggle}
            onAnswer={onAnswer}
          />
        ))}
      </div>
    </div>
  );
}

export default function BlindSpots({ state, toggleAskedQuestion, setQuestionAnswer }) {
  const totalQuestions = blindSpots.reduce((sum, c) => sum + c.items.length, 0);
  const totalAsked = Object.values(state.askedQuestions).filter(Boolean).length;

  return (
    <div>
      <h3 className="mb-2 text-xl font-bold text-white">What We Can't See</h3>
      <p className="mb-2 text-sm text-slate-400">
        {totalAsked}/{totalQuestions} questions answered.{' '}
        These require MSP input — we cannot see these from the customer side.
      </p>

      {/* GDAP visibility note */}
      <div className="mb-6 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-4 py-3">
        <p className="text-xs text-cyan-300">
          <strong>GDAP Note:</strong> {gdapFindings.summary}
        </p>
        <p className="mt-1 text-xs text-cyan-400/60">
          Permission needed: <code className="text-cyan-400">{gdapFindings.permissionNeeded}</code>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {blindSpots.map((cat, catIdx) => (
          <CategoryCard
            key={catIdx}
            category={cat}
            catIdx={catIdx}
            state={state}
            onToggle={toggleAskedQuestion}
            onAnswer={setQuestionAnswer}
          />
        ))}
      </div>
    </div>
  );
}
