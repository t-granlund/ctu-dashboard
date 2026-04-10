import { useState, useCallback, useEffect } from 'react';
import { meganQuestions, totalQuestions, MEGAN_STORAGE_KEY } from '../../data/megan-questions';

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
};

function loadResponses() {
  try {
    const raw = localStorage.getItem(MEGAN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveResponses(data) {
  try {
    localStorage.setItem(MEGAN_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

function QuestionCard({ q, response, onUpdate }) {
  const p = PRIORITY_COLORS[q.priority] || PRIORITY_COLORS.medium;
  const isAnswered = response?.answered || false;
  const value = response?.value || '';

  return (
    <div className={`rounded-xl border ${isAnswered ? 'border-green-500/40 bg-green-950/10' : 'border-slate-700/50 bg-slate-800/40'} p-5 transition-colors`}>
      {/* Header row */}
      <div className="mb-3 flex items-start gap-3">
        <button
          onClick={() => onUpdate(q.id, { ...response, answered: !isAnswered })}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
            isAnswered
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-600 bg-slate-800 hover:border-slate-500'
          } transition-colors`}
        >
          {isAnswered && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${p.bg} ${p.text}`}>
              {q.priority}
            </span>
          </div>
          <p className="text-sm font-semibold text-white">{q.question}</p>
          <p className="mt-1 text-xs text-slate-400">{q.context}</p>
        </div>
      </div>

      {/* Input */}
      <div className="ml-8">
        {q.inputType === 'select' ? (
          <select
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value, answered: !!e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">— Select an answer —</option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value })}
            placeholder={q.placeholder || 'Type your answer here...'}
            rows={3}
            className="w-full resize-y rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        )}
      </div>
    </div>
  );
}

function CategorySection({ category, responses, onUpdate }) {
  const [open, setOpen] = useState(true);
  const answered = category.questions.filter((q) => responses[q.id]?.answered).length;
  const total = category.questions.length;
  const allDone = answered === total;

  return (
    <div className={`rounded-2xl border ${allDone ? 'border-green-500/30 bg-green-950/5' : 'border-slate-700/40 bg-slate-900/50'} overflow-hidden transition-colors`}>
      {/* Category header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-slate-800/30"
      >
        <span className="text-xl">{category.icon}</span>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">{category.category}</h4>
          <p className="text-xs text-slate-400">{category.why}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            allDone ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
          }`}>
            {answered}/{total}
          </span>
          <svg
            className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Questions */}
      {open && (
        <div className="space-y-4 px-6 pb-6">
          {category.questions.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              response={responses[q.id]}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeganResponseForm({ onExport }) {
  const [responses, setResponses] = useState(loadResponses);

  // Auto-save on change
  useEffect(() => {
    saveResponses(responses);
  }, [responses]);

  const handleUpdate = useCallback((questionId, data) => {
    setResponses((prev) => ({ ...prev, [questionId]: data }));
  }, []);

  const answeredCount = Object.values(responses).filter((r) => r?.answered).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div id="section-questions" className="scroll-mt-24">
      <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
        <span>📝</span> Questions for Megan
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        Answer what you can — check the box when done. Your responses auto-save in this browser.
        When you're finished, export as Markdown to send back to Tyler.
      </p>

      {/* Progress bar */}
      <div className="mb-8 rounded-xl border border-slate-700/40 bg-slate-900/60 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-white">
            Progress: {answeredCount} of {totalQuestions} answered
          </span>
          <span className={`font-bold ${progress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question categories */}
      <div className="space-y-6">
        {meganQuestions.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            responses={responses}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {/* Export button */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => onExport(responses)}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500"
        >
          <span>📥</span> Export Responses as Markdown
        </button>
        {answeredCount < totalQuestions && (
          <span className="text-xs text-slate-500">
            You can export anytime — partial responses are fine
          </span>
        )}
        {answeredCount === totalQuestions && (
          <span className="text-xs font-semibold text-green-400">
            ✅ All questions answered — ready to export!
          </span>
        )}
      </div>
    </div>
  );
}
