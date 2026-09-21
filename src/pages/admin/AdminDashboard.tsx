import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSmartphone, Wifi, AlertTriangle, Wallet, CreditCard } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { KpiCard } from '../../components/ui/KpiCard';
import { KpiCardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { DonutChart } from '../../components/ui/DonutChart';
import { TrendChart } from '../../components/ui/TrendChart';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { devices } from '../../mocks/devices';
import { organizations } from '../../mocks/organizations';
import { platformActivity } from '../../mocks/activity';
import { platformRevenueTrend } from '../../mocks/revenue';
import { relativeTime } from '../../components/ui/DeviceVitals';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const total = devices.length;
  const online = devices.filter((d) => d.status === 'ONLINE').length;
  const offline = devices.filter((d) => d.status === 'OFFLINE').length;
  const error = devices.filter((d) => d.status === 'ERROR').length;
  const revenueThisMonth = organizations.reduce((s, o) => s + o.revenueThisMonth, 0);
  const activeSessions = Math.round(online * 0.32);

  const topOrgs = [...organizations].sort((a, b) => b.revenueThisMonth - a.revenueThisMonth).slice(0, 5);

  const ICONS: Record<string, typeof Wallet> = {
    payment: CreditCard,
    tamper: AlertTriangle,
    motor_error: AlertTriangle,
    device_offline: Wifi,
  };

  return (
    <AppShell title="Fleet overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : (
            <>
              <KpiCard label="Total devices" value={String(total)} icon={<MonitorSmartphone size={16} strokeWidth={1.5} />} accent="primary" />
              <KpiCard
                label="Online / offline"
                value={`${online} / ${offline}`}
                delta={2.1}
                deltaLabel="vs last week"
                icon={<Wifi size={16} strokeWidth={1.5} />}
                accent="success"
              />
              <KpiCard label="Devices in error" value={String(error)} delta={-0.6} deltaLabel="vs last week" icon={<AlertTriangle size={16} strokeWidth={1.5} />} accent="danger" />
              <KpiCard
                label="Revenue this month"
                value={`${(revenueThisMonth / 1_000_000).toFixed(1)}M RWF`}
                delta={8.4}
                deltaLabel="vs last month"
                icon={<Wallet size={16} strokeWidth={1.5} />}
                accent="secondary"
              />
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 'var(--space-4)' }}>
          {/* Fleet health */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3>Fleet health</h3>
              <button
                onClick={() => navigate('/admin/devices?status=ERROR')}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {error} devices need attention →
              </button>
            </div>
            <DonutChart
              centerLabel="devices"
              centerValue={String(total)}
              segments={[
                { label: 'Online', value: online, color: 'var(--color-success)' },
                { label: 'Offline', value: offline, color: 'var(--color-text-muted)' },
                { label: 'Error', value: error, color: 'var(--color-danger)' },
              ]}
            />
          </Card>

          {/* Revenue trend */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <h3>Revenue trend</h3>
              <span className="caption">Active sessions right now: {activeSessions}</span>
            </div>
            <TrendChart data={platformRevenueTrend} />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
          {/* Top organizations */}
          <Card padding={0}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
              <h3>Top organizations</h3>
            </div>
            {topOrgs.map((org) => (
              <div
                key={org.id}
                onClick={() => navigate(`/admin/organizations/${org.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-sunken)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{org.name}</div>
                  <div className="caption">
                    {org.deviceCount} devices · {org.region}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{(org.revenueThisMonth / 1000).toFixed(0)}k RWF</div>
                  <StatusBadge status={org.errorCount > 0 ? 'ERROR' : 'ONLINE'} size="sm" />
                </div>
              </div>
            ))}
          </Card>

          {/* Recent activity */}
          <Card padding={0}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
              <h3>Recent activity</h3>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {platformActivity.slice(0, 8).map((item) => {
                const Icon = ICONS[item.type] ?? CreditCard;
                const color = `var(--color-${item.severity})`;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.deviceId && navigate(`/admin/devices/${item.deviceId}`)}
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-5)',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: item.deviceId ? 'pointer' : 'default',
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 'var(--radius-full)',
                        background: `var(--color-${item.severity}-tint)`,
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={13} strokeWidth={1.75} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{item.message}</div>
                      <div className="caption">{relativeTime(item.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
