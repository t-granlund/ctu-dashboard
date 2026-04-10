import { useState, useCallback } from 'react';

// SHA-256 hash of the access passphrase (NOT the plaintext)
const PASS_HASH = '4db34356ad4e5f129b8322fae8929691cab75dcfc42c101ca23ecd112b463e22';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-black text-white shadow-lg shadow-cyan-500/20">
            H
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">HTT Brands</h1>
          <p className="mt-1 text-sm text-slate-500">Cross-Tenant Utility Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Access Passphrase
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Enter passphrase"
            autoFocus
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {error && (
            <p className="mb-4 text-xs font-semibold text-red-400">
              Incorrect passphrase. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-700">
          MSP Partnership Portal · Phase 1 Audit
        </p>
      </div>
    </div>
  );
}
