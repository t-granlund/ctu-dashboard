import { SEVERITY_COLORS, RISK_COLORS } from '../data/audit-data';

const bgMap = {
  critical: 'bg-red-500/20 text-red-400',
  high:     'bg-orange-500/20 text-orange-400',
  medium:   'bg-yellow-500/20 text-yellow-400',
  low:      'bg-blue-500/20 text-blue-400',
  info:     'bg-slate-500/20 text-slate-400',
};

export default function SeverityBadge({ level, className = '' }) {
  return (
    <span className={`badge ${bgMap[level] ?? bgMap.info} ${className}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export function RiskBadge({ risk }) {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
    high:     'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30',
    medium:   'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30',
    low:      'bg-green-500/20 text-green-400 ring-1 ring-green-500/30',
  };
  return (
    <span className={`badge ${styles[risk] ?? styles.medium}`}>
      {risk.toUpperCase()} RISK
    </span>
  );
}

export { SEVERITY_COLORS, RISK_COLORS };
