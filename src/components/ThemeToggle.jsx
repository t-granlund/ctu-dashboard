const LABELS = {
  dark: {
    current: 'Dark mode',
    next: 'light',
    icon: '🌙',
  },
  light: {
    current: 'Light mode',
    next: 'dark',
    icon: '☀️',
  },
};

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const meta = LABELS[theme] ?? LABELS.dark;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-bold text-slate-100 shadow-lg shadow-black/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${className}`}
      aria-label={`Switch to ${meta.next} mode`}
      aria-pressed={theme === 'light'}
      title={`Switch to ${meta.next} mode`}
    >
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.current}</span>
    </button>
  );
}
