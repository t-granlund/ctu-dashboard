import {
  TENANT_ORDER, TENANTS,
  DOMAIN_ORDER, DOMAINS,
  MATRIX,
  STATUS_ORDER, STATUS_META,
  DECISIONS_PENDING, NEXT_HORIZON, REFERENCE_DCE,
  computeDomainIndex,
} from '../../data/cross-tenant-program';

// ─── Atoms ────────────────────────────────────────────────────────────
// Visual rules:
//   • Pure dark slate base, single cyan accent reserved for DCE marker.
//   • Status uses position + glyph + sequential hue (3-channel encoding).
//   • Inline color on glyphs to escape the global accent flatten.
//   • Type scale strictly 32 / 20 / 14 / 12. No more.
//   • Tables for matrix data, cards for narrative — Tufte/Few rule.
// ──────────────────────────────────────────────────────────────────────

function StatusGlyph({ status, size = 18, srLabel }) {
  const meta = STATUS_META[status] ?? STATUS_META.na;
  return (
    <span
      aria-label={srLabel ?? meta.label}
      title={meta.label}
      style={{ color: meta.color, fontSize: size, lineHeight: 1, display: 'inline-block' }}
      className="font-bold tabular-nums"
    >
      {meta.glyph}
    </span>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{children}</p>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <header className="mb-5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h3 className="mt-1 text-xl font-bold text-white">{title}</h3>
      {sub && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{sub}</p>}
    </header>
  );
}

// ─── Page header ──────────────────────────────────────────────────────

function ProgramHeader() {
  return (
    <header className="mb-8">
      <Eyebrow>Cross-tenant program · HTT family</Eyebrow>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[32px] font-black leading-[1.1] tracking-tight text-white">
          Where every tenant stands against the Delta Crown reference.
        </h2>
        <a
          href="https://delta-crown-org.github.io/DeltaSetup/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-6 items-center text-sm font-bold text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200"
        >
          DeltaSetup live site ↗
        </a>
      </div>
    </header>
  );
}

// ─── Domain scoreboard strip ──────────────────────────────────────────

function DomainScore({ domainKey }) {
  const meta = DOMAINS[domainKey];
  const idx = computeDomainIndex(domainKey);
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{meta.label}</p>
      <p className="text-[32px] font-black leading-none tabular-nums text-white">{idx.pct}<span className="text-base font-bold text-slate-400">%</span></p>
      <p className="text-xs leading-4 text-slate-300 tabular-nums">
        {idx.golden} of {idx.total} at golden
      </p>
    </div>
  );
}

function DomainScoreboard() {
  return (
    <section aria-labelledby="scoreboard-heading" className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <h3 id="scoreboard-heading" className="sr-only">Domain scoreboard</h3>
      <div className="grid divide-y divide-slate-800 sm:grid-cols-2 sm:divide-y-0 sm:divide-x md:grid-cols-3 lg:grid-cols-6">
        {DOMAIN_ORDER.map((d) => <DomainScore key={d} domainKey={d} />)}
      </div>
    </section>
  );
}

// ─── Tenant × Domain matrix ───────────────────────────────────────────

function MatrixCell({ tenantKey, domainKey }) {
  const cell = MATRIX[tenantKey]?.[domainKey];
  if (!cell) return <td className="px-3 py-3 text-center text-slate-600">–</td>;
  const meta = STATUS_META[cell.status];
  return (
    <td
      className="px-3 py-3 text-center"
      title={`${DOMAINS[domainKey].label} · ${meta.label} — ${cell.gap}`}
    >
      <span className="inline-flex flex-col items-center gap-1">
        <StatusGlyph status={cell.status} size={20} srLabel={`${DOMAINS[domainKey].label}: ${meta.label}. ${cell.gap}`} />
        <span className="text-[11px] leading-4 text-slate-400">{meta.label}</span>
      </span>
    </td>
  );
}

function TenantMatrix() {
  return (
    <section aria-labelledby="matrix-heading" className="mb-8">
      <SectionHeader
        eyebrow="Tenant × Domain matrix"
        title="Every tenant, every domain, one screen."
        sub="DCE is the bar. Hover any cell for the gap; click a tenant or domain to drill in."
      />

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 md:block">
        <table className="min-w-full text-sm">
          <caption className="sr-only">Tenant by domain status matrix</caption>
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-[0.14em] text-slate-400">
              <th scope="col" className="w-[26%] px-5 py-3 font-bold">Tenant</th>
              {DOMAIN_ORDER.map((d) => (
                <th key={d} scope="col" className="px-3 py-3 text-center font-bold">{DOMAINS[d].label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {TENANT_ORDER.map((tk) => {
              const t = TENANTS[tk];
              const isRef = tk === 'DCE';
              return (
                <tr key={tk} className={isRef ? 'bg-slate-900/70' : ''}>
                  <th scope="row" className="px-5 py-4 text-left align-top font-normal">
                    <div className="flex items-baseline gap-2">
                      {isRef && <span aria-hidden="true" className="text-cyan-300">★</span>}
                      <span className="text-base font-bold text-white">{t.code}</span>
                      <span className="text-xs text-slate-400">{t.name}</span>
                    </div>
                    <p className="mt-1 text-xs leading-4 text-slate-400">{t.role}</p>
                  </th>
                  {DOMAIN_ORDER.map((d) => <MatrixCell key={d} tenantKey={tk} domainKey={d} />)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card view */}
      <div className="grid gap-3 md:hidden">
        {TENANT_ORDER.map((tk) => {
          const t = TENANTS[tk];
          const isRef = tk === 'DCE';
          return (
            <article key={tk} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <header className="mb-3 flex items-baseline gap-2">
                {isRef && <span aria-hidden="true" className="text-cyan-300">★</span>}
                <h4 className="text-base font-bold text-white">{t.code}</h4>
                <span className="text-xs text-slate-400">{t.name}</span>
              </header>
              <ul className="space-y-2">
                {DOMAIN_ORDER.map((d) => {
                  const cell = MATRIX[tk]?.[d];
                  if (!cell) return null;
                  const meta = STATUS_META[cell.status];
                  return (
                    <li key={d} className="grid grid-cols-[1.5rem_5.5rem_1fr] items-baseline gap-2">
                      <StatusGlyph status={cell.status} size={16} />
                      <span className="text-xs font-bold text-slate-200">{DOMAINS[d].label}</span>
                      <span className="text-xs leading-4 text-slate-300">{cell.gap}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>

      <Legend />
    </section>
  );
}

function Legend() {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400" aria-label="Status legend">
      <span className="font-bold uppercase tracking-[0.16em]">Legend</span>
      {STATUS_ORDER.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <StatusGlyph status={s} size={14} />
          <span>{STATUS_META[s].label}</span>
        </span>
      ))}
    </p>
  );
}

// ─── Right rail: decisions + horizon ─────────────────────────────────

function DecisionsPending() {
  const top = DECISIONS_PENDING.slice(0, 5);
  return (
    <section aria-labelledby="decisions-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50">
      <header className="border-b border-slate-800 px-5 py-3">
        <Eyebrow>Decisions pending</Eyebrow>
        <h3 id="decisions-heading" className="text-base font-bold text-white tabular-nums">
          {DECISIONS_PENDING.length} open
        </h3>
      </header>
      <ol className="divide-y divide-slate-800/70">
        {top.map((d) => (
          <li key={d.topic} className="grid grid-cols-[3.5rem_1fr_4rem] items-baseline gap-3 px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">{d.owner}</span>
            <span className="text-sm leading-5 text-white">{d.topic}</span>
            <span className="text-right text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-300">{d.target}</span>
          </li>
        ))}
      </ol>
      {DECISIONS_PENDING.length > top.length && (
        <a href="#section-may7-update" className="flex min-h-10 items-center border-t border-slate-800 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 hover:text-white">
          See all {DECISIONS_PENDING.length} →
        </a>
      )}
    </section>
  );
}

function NextHorizon() {
  return (
    <section aria-labelledby="horizon-heading" className="rounded-2xl border border-slate-800 bg-slate-900/50">
      <header className="border-b border-slate-800 px-5 py-3">
        <Eyebrow>Next horizon</Eyebrow>
        <h3 id="horizon-heading" className="text-base font-bold text-white">Structural dates</h3>
      </header>
      <ol className="divide-y divide-slate-800/70">
        {NEXT_HORIZON.map((h) => (
          <li key={`${h.date}-${h.label}`} className="grid grid-cols-[5rem_1fr] items-baseline gap-3 px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] tabular-nums text-slate-300">{h.date}</span>
            <span>
              <span className="block text-sm font-bold text-white">{h.label}</span>
              <span className="block text-xs leading-4 text-slate-400">{h.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Reference card (DCE = the bar) ──────────────────────────────────

function ReferenceCard() {
  const r = REFERENCE_DCE;
  return (
    <section aria-labelledby="reference-heading" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Reference architecture</Eyebrow>
          <h3 id="reference-heading" className="mt-1 text-xl font-bold text-white">
            <span aria-hidden="true" className="mr-2 text-cyan-300">★</span>{r.tenant}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            What “golden” means in each domain. The bar every other tenant inherits.
          </p>
        </div>
        <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex min-h-6 items-center text-sm font-bold text-slate-100 underline decoration-slate-500 underline-offset-4 hover:decoration-slate-200">
          Live reference site ↗
        </a>
      </header>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-[10rem_1fr]">
        {r.pillars.map((p) => (
          <div key={p.domain} className="grid grid-cols-[6rem_1fr] gap-3 lg:contents">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{p.domain}</dt>
            <dd className="text-sm leading-5 text-slate-100">{p.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ─── Composition ──────────────────────────────────────────────────────

export default function CrossTenantOverview() {
  return (
    <section id="cross-tenant-overview" className="scroll-mt-8">
      <ProgramHeader />
      <DomainScoreboard />
      <TenantMatrix />
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <DecisionsPending />
        <NextHorizon />
      </div>
      <ReferenceCard />
    </section>
  );
}
