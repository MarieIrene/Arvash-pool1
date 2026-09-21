import { CSSProperties } from 'react';
import { DeviceStatus, PaymentStatus } from '../../types';

export type BadgeStatus =
  | DeviceStatus
  | PaymentStatus
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'QUEUED'
  | 'FLASHING'
  | 'OPEN'
  | 'INVESTIGATING'
  | 'RESOLVED';

interface StatusConfig {
  label: string;
  color: string;
  tint: string;
}

const CONFIG: Record<BadgeStatus, StatusConfig> = {
  ONLINE: { label: 'Online', color: 'var(--color-success)', tint: 'var(--color-success-tint)' },
  OFFLINE: { label: 'Offline', color: 'var(--color-text-muted)', tint: 'var(--color-surface-sunken)' },
  ERROR: { label: 'Error', color: 'var(--color-danger)', tint: 'var(--color-danger-tint)' },
  PROVISIONED: { label: 'Provisioned', color: 'var(--color-info)', tint: 'var(--color-info-tint)' },
  SUCCESS: { label: 'Success', color: 'var(--color-success)', tint: 'var(--color-success-tint)' },
  PENDING: { label: 'Pending', color: 'var(--color-warning)', tint: 'var(--color-warning-tint)' },
  FAILED: { label: 'Failed', color: 'var(--color-danger)', tint: 'var(--color-danger-tint)' },
  ACTIVE: { label: 'Active', color: 'var(--color-success)', tint: 'var(--color-success-tint)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--color-text-muted)', tint: 'var(--color-surface-sunken)' },
  QUEUED: { label: 'Queued', color: 'var(--color-info)', tint: 'var(--color-info-tint)' },
  FLASHING: { label: 'Flashing', color: 'var(--color-warning)', tint: 'var(--color-warning-tint)' },
  OPEN: { label: 'Open', color: 'var(--color-warning)', tint: 'var(--color-warning-tint)' },
  INVESTIGATING: { label: 'Investigating', color: 'var(--color-info)', tint: 'var(--color-info-tint)' },
  RESOLVED: { label: 'Resolved', color: 'var(--color-success)', tint: 'var(--color-success-tint)' },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function StatusBadge({ status, size = 'md', style }: StatusBadgeProps) {
  const cfg = CONFIG[status];
  const padding = size === 'sm' ? '2px 8px 2px 6px' : '4px 10px 4px 8px';
  const fontSize = size === 'sm' ? 12 : 13;
  const dot = size === 'sm' ? 6 : 7;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 'var(--radius-sm)',
        background: cfg.tint,
        color: cfg.color,
        fontSize,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        style={{
          width: dot,
          height: dot,
          borderRadius: 'var(--radius-full)',
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
