import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './Card';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // positive or negative percent
  deltaLabel?: string;
  icon?: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

export function KpiCard({ label, value, delta, deltaLabel, icon, accent = 'primary' }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="label">{label}</span>
        {icon && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-sm)',
              background: `var(--color-${accent}-tint)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `var(--color-${accent})`,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              color: positive ? 'var(--color-success)' : 'var(--color-danger)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {positive ? <ArrowUpRight size={14} strokeWidth={1.75} /> : <ArrowDownRight size={14} strokeWidth={1.75} />}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="caption">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  );
}
