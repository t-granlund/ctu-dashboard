import { useState, useCallback, useEffect } from 'react';
import { meganQuestions, totalQuestions, MEGAN_STORAGE_KEY } from '../../data/megan-questions';
import { Eyebrow, SectionHeader, StatusPill } from './atoms';

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

// Render simple **bold** markdown into JSX (no HTML parser needed for this scope).
function renderInlineMd(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// Megan's Apr 13 written answer panel — neutral surface, ordinal dot on
// the eyebrow (consistent with the rest of the monochrome program board).
function Apr13Panel({ answer }) {
  if (!answer) return null;
  return (
    <div className="mb-4 ml-8 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <StatusPill tone="ok">Megan answered · Apr 13, 2026</StatusPill>
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
    <div className={`rounded-2xl border p-5 transition-colors ${
      isAnswered ? 'border-slate-700 bg-slate-900/55' : 'border-slate-800 bg-slate-900/30'
    }`}>
      {/* Checkbox + question */}
      <div className="mb-2 flex items-start gap-3">
        <button
          type="button"
          aria-label={`${isAnswered ? 'Mark as needing review' : 'Mark as answered'}: ${q.question}`}
          onClick={() => onUpdate(q.id, { ...response, answered: !isAnswered })}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
            isAnswered
              ? 'border-slate-200 bg-slate-200 text-slate-900'
              : 'border-slate-600 hover:border-slate-400'
          }`}
        >
          {isAnswered && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <p className="text-sm font-bold leading-5 text-white">{q.question}</p>
      </div>

      <p className="mb-4 ml-8 text-xs leading-relaxed text-slate-400">
        {q.context}
      </p>

      <Apr13Panel answer={q.apr13Answer} />

      {hasApr13 && (
        <p className="mb-2 ml-8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Add an update or correction (optional)
        </p>
      )}
      <div className="ml-8">
        {q.inputType === 'select' ? (
          <select
            aria-label={`Update or correction for: ${q.question}`}
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value, answered: !!e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white focus:border-slate-500 focus:outline-none"
          >
            <option value="">Select…</option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <textarea
            aria-label={`Update or correction for: ${q.question}`}
            value={value}
            onChange={(e) => onUpdate(q.id, { ...response, value: e.target.value })}
            placeholder={q.placeholder}
            rows={2}
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

function CategorySection({ category, responses, onUpdate, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const answered = category.questions.filter((q) => responses[q.id]?.answered ?? !!q.apr13Answer).length;
  const total = category.questions.length;
  const allDone = answered === total;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-900/70"
      >
        <span className="text-xl" aria-hidden="true">{category.icon}</span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white">{category.category}</h4>
          <p className="mt-0.5 text-xs text-slate-400">{category.why}</p>
        </div>
        <StatusPill tone={allDone ? 'ok' : 'info'}>{answered}/{total}</StatusPill>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-800 px-6 pb-6 pt-4">
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

  const answeredCount = meganQuestions.reduce(
    (sum, cat) => sum + cat.questions.filter((q) => responses[q.id]?.answered ?? !!q.apr13Answer).length,
    0,
  );
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  const done = progress === 100;

  return (
    <div id="section-questions" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Follow-up questions"
        title="Follow-Up Questions"
        sub={
          <span>
            Most of these are answered from your <strong className="text-white">April 13 written response</strong> (shown below each question).
            If anything has changed or needs clarification, use the input below each question to add an update — everything auto-saves.
            When you’re done, export and send the file back.
          </span>
        }
      />

      {/* Progress bar — monochrome, ordinal accent only on completion */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-300 tabular-nums">{answeredCount} of {totalQuestions} answered</span>
          <span className={`font-bold tabular-nums ${done ? 'text-white' : 'text-slate-300'}`}>{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Megan follow-up question completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-slate-800"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(progress, 2)}%`,
              background: done ? '#34d399' : '#94a3b8',
            }}
          />
        </div>
      </div>

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

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onExport(responses)}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800"
        >
          📥 Export as Markdown
        </button>
        <span className="text-xs text-slate-400">
          {done ? 'All done — ready to send!' : 'You can export anytime'}
        </span>
      </div>
    </div>
  );
}
