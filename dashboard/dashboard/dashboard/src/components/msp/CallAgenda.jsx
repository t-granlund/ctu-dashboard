import { useState, useEffect, useCallback, useRef } from 'react';
import { callAgenda } from '../../data/msp-data';

const TOTAL_SECONDS = 45 * 60; // 45 min call budget

function formatTime(seconds) {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  const sign = seconds < 0 ? '-' : '';
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CallAgenda() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [sectionTimes, setSectionTimes] = useState({});
  const lastSectionRef = useRef(null);
  const tickRef = useRef(null);

  // Timer tick
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  // Track time per active section
  useEffect(() => {
    if (!running || !activeSection) return;
    const id = setInterval(() => {
      setSectionTimes((prev) => ({
        ...prev,
        [activeSection]: (prev[activeSection] ?? 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [running, activeSection]);

  const handleStart = useCallback(() => {
    setRunning(true);
    if (!activeSection) setActiveSection(callAgenda[0].id);
  }, [activeSection]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setActiveSection(null);
    setSectionTimes({});
  }, []);

  const scrollTo = useCallback((id) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Intersection observer for auto-tracking active section
  useEffect(() => {
    const ids = callAgenda.map((a) => `section-${a.id}`);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && running) {
            const sectionId = entry.target.id.replace('section-', '');
            setActiveSection(sectionId);
          }
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [running]);

  const remaining = TOTAL_SECONDS - elapsed;
  const isOvertime = remaining < 0;

  return (
    <div className="sticky top-0 z-30 -mx-8 mb-8 border-b border-slate-700/60 bg-slate-950/95 px-8 py-3 backdrop-blur-md print:hidden">
      <div className="flex items-center gap-3">
        {/* Agenda pills */}
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {callAgenda.map((item, i) => {
            const isActive = activeSection === item.id;
            const secTime = sectionTimes[item.id];
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={item.description}
              >
                <span>{item.icon}</span>
                <span className="hidden lg:inline">{item.title}</span>
                <span className="text-[10px] text-slate-500">{item.time}</span>
                {secTime > 0 && (
                  <span className={`ml-0.5 rounded bg-slate-700 px-1 py-0.5 text-[9px] font-mono ${
                    secTime > parseInt(item.time) * 60 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {formatTime(secTime)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timer */}
        <div className="flex shrink-0 items-center gap-2">
          <span className={`font-mono text-lg font-bold ${
            isOvertime ? 'animate-pulse text-red-400' : remaining < 300 ? 'text-yellow-400' : 'text-white'
          }`}>
            {formatTime(remaining)}
          </span>

          {!running ? (
            <button
              onClick={handleStart}
              className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/30"
            >
              ▶ Start Call
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30"
            >
              ■ Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
