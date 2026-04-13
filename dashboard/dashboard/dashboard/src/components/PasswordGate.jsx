import { useState, useCallback } from 'react';

// SHA-256 hash of the access passphrase — generated via: printf 'CrossTenant!' | shasum -a 256
const PASS_HASH = 'b15d0debbc260d948e98b91e1d7ed5064887a5c219149e2b30162bbae2a8aa41';
const AUTH_KEY = 'ctu-dashboard-auth';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    const hash = await sha256(password);
    if (hash === PASS_HASH) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setAuthed(true);
    } else {
      setError(true);
      setPassword('');
    }
    setChecking(false);
  }, [password]);

  if (authed) return children;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      {/* Subtle maroon gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#500711]/20 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <img
            src="/ctu-dashboard/htt-logo-white.png"
            alt="HTT Brands"
            className="mb-6 h-14 w-auto drop-shadow-lg"
          />
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#500711]/60" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Identity Governance Dashboard
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#500711]/60" />
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-sm"
        >
          <label
            htmlFor="passphrase"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Access Passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Enter passphrase to continue"
            autoFocus
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#500711] focus:outline-none focus:ring-1 focus:ring-[#500711]/60 transition-colors"
          />
          {error && (
            <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-red-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Incorrect passphrase. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full rounded-xl bg-[#500711] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#500711]/30 transition-all hover:bg-[#6b1020] hover:shadow-[#500711]/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checking ? 'Verifying…' : 'Enter Dashboard'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-700">
            Cross-Tenant Utility · MSP Partnership Portal
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500/60" />
            <span className="text-[10px] text-slate-700">Phase 1 Audit Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
