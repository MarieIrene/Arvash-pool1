import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, RotateCw, Radio, Ticket, Wrench, ChevronRight } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DeviceVitals, relativeTime } from '../../components/ui/DeviceVitals';
import { Tabs } from '../../components/ui/Tabs';
import { EventTimeline } from '../../components/ui/EventTimeline';
import { useToast } from '../../components/ui/Toast';
import { deviceService } from '../../services/deviceService';
import { Device, DeviceEvent, GameSession } from '../../types';
import { transactions } from '../../mocks/transactions';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export function DeviceDetails({ basePath = '/admin' }: { basePath?: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [device, setDevice] = useState<Device | null>(null);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([deviceService.get(id), deviceService.events(id), deviceService.sessions(id)]).then(
      ([d, e, s]) => {
        setDevice(d ?? null);
        setEvents(e);
        setSessions(s);
        setLoading(false);
      }
    );
  }, [id]);

  const devicePayments = transactions.filter((t) => t.deviceId === id);

  if (loading) {
    return (
      <AppShell title="Device details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Skeleton height={80} />
          <Skeleton height={200} />
        </div>
      </AppShell>
    );
  }

  if (!device) {
    return (
      <AppShell title="Device details">
        <Card>
          <EmptyState title="Device not found" message="This device may have been removed or reassigned." />
        </Card>
      </AppShell>
    );
  }

  const isDegraded = device.status === 'OFFLINE' || device.status === 'ERROR';

  return (
    <AppShell title={device.tableName}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <Link to={`${basePath}/devices`} style={{ color: 'var(--color-text-muted)' }}>
            Devices
          </Link>
          <ChevronRight size={13} />
          {basePath === '/admin' ? (
            <>
              <Link to={`/admin/organizations/${device.organizationId}`} style={{ color: 'var(--color-text-muted)' }}>
                {device.organizationName}
              </Link>
              <ChevronRight size={13} />
            </>
          ) : null}
          <span style={{ color: 'var(--color-text-primary)' }}>{device.tableName}</span>
        </div>

        {/* Offline/error banner */}
        {isDegraded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: device.status === 'ERROR' ? 'var(--color-danger-tint)' : 'var(--color-warning-tint)',
              border: `1px solid ${device.status === 'ERROR' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
            }}
          >
            <AlertTriangle size={20} strokeWidth={1.75} color={device.status === 'ERROR' ? 'var(--color-danger)' : 'var(--color-warning)'} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                This device is {device.status === 'ERROR' ? 'reporting an error' : 'offline'}
              </div>
              <div className="text-secondary" style={{ fontSize: 13 }}>
                {device.likelyCause ? `Likely cause: ${device.likelyCause}` : 'No further diagnostic detail available.'}
                {device.status === 'OFFLINE' && device.offlineCredits > 0 && (
                  <> · Operating on {device.offlineCredits} pre-authorized offline credits.</>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2>{device.tableName}</h2>
              <StatusBadge status={device.status} />
            </div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              UUID {device.id} · Serial {device.serial}
            </div>
            <div className="caption" style={{ marginTop: 4 }}>
              Last seen {relativeTime(device.lastSeen)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => toast.show('Ping sent to device.', 'info')}>
              <Radio size={14} strokeWidth={1.75} /> Ping
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.show('Restart command queued.', 'info')}>
              <RotateCw size={14} strokeWidth={1.75} /> Restart
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.show('Voucher generated for this device.', 'success')}>
              <Ticket size={14} strokeWidth={1.75} /> Generate voucher
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.show('Flagged for support review.', 'warning')}>
              <Wrench size={14} strokeWidth={1.75} /> Flag for support
            </Button>
          </div>
        </Card>

        {/* Vitals */}
        <DeviceVitals device={device} />

        {/* Tabs */}
        <Card>
          <Tabs
            tabs={[
              {
                key: 'events',
                label: 'Events',
                content: events.length ? (
                  <EventTimeline events={events} />
                ) : (
                  <EmptyState title="No events recorded" message="This device hasn't reported any events yet." />
                ),
              },
              {
                key: 'sessions',
                label: 'Sessions',
                content: sessions.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-sunken)',
                        }}
                      >
                        <div style={{ fontSize: 13 }}>
                          Started {new Date(s.startedAt).toLocaleString()}
                          {!s.endedAt && <span style={{ color: 'var(--color-info)' }}> · in progress</span>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {s.gamesPlayed}/{s.gamesPurchased} games played
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No game sessions yet" message="Sessions will appear here after a customer pays and plays." />
                ),
              },
              {
                key: 'payments',
                label: 'Payments',
                content: devicePayments.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {devicePayments.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`${basePath}/transactions`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-sunken)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 13 }}>
                          {new Date(t.timestamp).toLocaleString()} · {t.method} · {t.amount} RWF
                        </div>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No payments linked to this device" />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}
