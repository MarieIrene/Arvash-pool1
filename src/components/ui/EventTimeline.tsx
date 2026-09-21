import { useState } from 'react';
import { Power, ShieldAlert, Wrench, CreditCard, HeartPulse, ChevronDown } from 'lucide-react';
import { DeviceEvent } from '../../types';

const EVENT_CONFIG: Record<DeviceEvent['type'], { icon: typeof Power; color: string; label: string }> = {
  boot: { icon: Power, color: 'var(--color-info)', label: 'Device booted' },
  tamper_alert: { icon: ShieldAlert, color: 'var(--color-warning)', label: 'Tamper alert' },
  motor_error: { icon: Wrench, color: 'var(--color-danger)', label: 'Motor error' },
  payment_success: { icon: CreditCard, color: 'var(--color-success)', label: 'Payment succeeded' },
  heartbeat: { icon: HeartPulse, color: 'var(--color-text-muted)', label: 'Heartbeat' },
};

export function EventTimeline({ events }: { events: DeviceEvent[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.type];
        const Icon = cfg.icon;
        const isOpen = openId === event.id;
        return (
          <div key={event.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-sunken)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cfg.color,
                  flexShrink: 0,
                }}
              >
                <Icon size={14} strokeWidth={1.75} />
              </div>
              {i < events.length - 1 && (
                <div style={{ width: 1, flex: 1, background: 'var(--color-border)', minHeight: 20 }} />
              )}
            </div>
            <div style={{ paddingBottom: 'var(--space-4)', flex: 1 }}>
              <button
                onClick={() => setOpenId(isOpen ? null : event.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{cfg.label}</div>
                  <div className="caption">{new Date(event.timestamp).toLocaleString()}</div>
                </div>
                <ChevronDown
                  size={16}
                  color="var(--color-text-muted)"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                />
              </button>
              {isOpen && (
                <pre
                  style={{
                    marginTop: 'var(--space-2)',
                    background: 'var(--color-surface-sunken)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    fontSize: 12,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    color: 'var(--color-text-secondary)',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
