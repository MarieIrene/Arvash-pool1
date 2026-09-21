import { Battery, BatteryLow, BatteryWarning, SignalHigh, SignalMedium, SignalLow, SignalZero } from 'lucide-react';

function levelColor(pct: number): string {
  if (pct <= 20) return 'var(--color-danger)';
  if (pct <= 45) return 'var(--color-warning)';
  return 'var(--color-text-secondary)';
}

export function BatteryIndicator({ pct }: { pct: number }) {
  const color = levelColor(pct);
  const Icon = pct <= 15 ? BatteryWarning : pct <= 40 ? BatteryLow : Battery;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color, fontSize: 13 }}>
      <Icon size={16} strokeWidth={1.5} />
      {pct}%
    </span>
  );
}

export function SignalIndicator({ bars }: { bars: number }) {
  const color = bars === 0 ? 'var(--color-danger)' : bars <= 2 ? 'var(--color-warning)' : 'var(--color-text-secondary)';
  const Icon = bars === 0 ? SignalZero : bars <= 1 ? SignalLow : bars <= 2 ? SignalMedium : SignalHigh;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color }}>
      <Icon size={16} strokeWidth={1.5} />
    </span>
  );
}
