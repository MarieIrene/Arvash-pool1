import { BatteryCharging, Wifi, CpuIcon, Clock } from 'lucide-react';
import { Card } from './Card';
import { Device } from '../../types';

function gaugeColor(pct: number): string {
  if (pct <= 20) return 'var(--color-danger)';
  if (pct <= 45) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function GaugeBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: gaugeColor(pct),
          borderRadius: 'var(--radius-full)',
        }}
      />
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function DeviceVitals({ device }: { device: Device }) {
  const signalPct = (device.signal / 4) * 100;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
          <BatteryCharging size={16} strokeWidth={1.5} />
          <span className="label">Battery</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{device.battery}%</span>
        <GaugeBar pct={device.battery} />
      </Card>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
          <Wifi size={16} strokeWidth={1.5} />
          <span className="label">Signal</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{device.signal}/4 bars</span>
        <GaugeBar pct={signalPct} />
      </Card>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
          <CpuIcon size={16} strokeWidth={1.5} />
          <span className="label">Firmware</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{device.firmwareVersion}</span>
        {device.firmwareUpdateAvailable ? (
          <span style={{ fontSize: 12, color: 'var(--color-warning)', fontWeight: 600 }}>Update available</span>
        ) : (
          <span className="caption">Up to date</span>
        )}
      </Card>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
          <Clock size={16} strokeWidth={1.5} />
          <span className="label">Last seen</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{relativeTime(device.lastSeen)}</span>
        <span className="caption">{new Date(device.lastSeen).toLocaleString()}</span>
      </Card>
    </div>
  );
}

export { relativeTime };
