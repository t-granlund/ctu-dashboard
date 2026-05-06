import { useState, useCallback, useEffect } from 'react';
import { meganQuestions, totalQuestions, MEGAN_STORAGE_KEY } from '../../data/megan-questions';

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
  } catch {}
}

// Render simple **bold** markdown into JSX (no HTML parser needed for this scope)
function renderInlineMd(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

function Apr13Panel({ answer }) {
  if (!answer) return null;
  return (
    <div className="mb-4 ml-8 rounded-lg border border-green-500/30 bg-green-950/15 px-4 py-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs">✅</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">
          Megan answered · Apr 13, 2026
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-200">
        {renderInlineMd(answer)}
      </p>
    </div>
  );
}

function QuestionCard({ q, response, onUpdate }) {
  const hasApr13 = !!q.apr13Answer;
  const isAnswered = response?.answered ?? hasApr13;
  const value = response?.value || '';

  return (
    <div className={`rounded-xl border p-5 transition-colors ${
      isAnswered ? 'border-green-500/30 bg-green-950/5' : 'border-slate-700/30 bg-slate-800/20'
    }`}>
      {/* Checkbox + question */}
      <div className="mb-2 flex items-start gap-3">
        <button
          onClick={() => onUpdate(q.id, { ...response, answered: !isAnswered })}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            isAnswered
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-600 hover:border-slate-400'
          }`}
        >
          {isAnswered && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <p className="text-sm font-medium text-white">{q.question}</p>
      </div>

      {/* Why we're asking — separated clearly */}
      <p className="mb-4 ml-8 text-xs leading-relaxed text-slate-500">
        {q.context}
      </p>

      {/* Megan's Apr 13 written answer (if any) */}
      <Apr13Panel answer={q.apr13Answer} />

      {/* Input — labelled as "update" when prior answer exists */}
      {hasApr13 && (
        <p className="mb-2 ml-8 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Add an update or correction (optional)
        </p>
      )}
      <div className="ml-8">
        {q.inputType === 'select' ? (
          <select
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value, answered: !!e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-slate-500 focus:outline-none"
          >
            <option value="">Select…</option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value })}
            placeholder={q.placeholder}
            rows={2}
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-500 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

function CategorySection({ category, responses, onUpdate, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const answered = category.questions.filter((q) => responses[q.id]?.answered).length;
  const total = category.questions.length;

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-slate-900/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left hover:bg-slate-800/20 transition-colors"
      >
        <span className="text-xl">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{category.category}</h4>
          <p className="mt-0.5 text-xs text-slate-500">{category.why}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          answered === total ? 'bg-green-500/15 text-green-400' : 'bg-slate-700/50 text-slate-400'
        }`}>
          {answered}/{total}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-800/50 px-6 pb-6 pt-4">
          {category.questions.map((q) => (
            <QuestionCard key={q.id} q={q} response={responses[q.id]} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeganResponseForm({ onExport }) {
  const [responses, setResponses] = useState(loadResponses);

  useEffect(() => { saveResponses(responses); }, [responses]);

  const handleUpdate = useCallback((questionId, data) => {
    setResponses((prev) => ({ ...prev, [questionId]: data }));
  }, []);

  const answeredCount = Object.values(responses).filter((r) => r?.answered).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div id="section-questions" className="scroll-mt-24">
      <h3 className="mb-2 text-xl font-bold text-white">Follow-Up Questions</h3>
      <p className="mb-8 text-sm text-slate-500">
        Most of these are answered from your <strong className="text-green-400">April 13 written response</strong> (shown in green). 
        If anything has changed or needs clarification, use the input below each question to add an update — everything auto-saves. 
        When you're done, export and send the file back.
      </p>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">{answeredCount} of {totalQuestions} answered</span>
          <span className={`font-semibold ${progress === 100 ? 'text-green-400' : 'text-slate-400'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-500' : 'bg-slate-500'
            }`}
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      </div>

      {/* Categories — first one open, rest collapsed */}
      <div className="space-y-4">
        {meganQuestions.map((cat, i) => (
          <CategorySection
            key={cat.id}
            category={cat}
            responses={responses}
            onUpdate={handleUpdate}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Export */}
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => onExport(responses)}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          📥 Export as Markdown
        </button>
        <span className="text-xs text-slate-600">
          {progress === 100 ? 'All done — ready to send!' : 'You can export anytime'}
        </span>
      </div>
    </div>
  );
}
