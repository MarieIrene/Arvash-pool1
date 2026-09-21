import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSmartphone, Wifi, AlertTriangle, Wallet, CreditCard } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { KpiCard } from '../../components/ui/KpiCard';
import { KpiCardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { TrendChart } from '../../components/ui/TrendChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { getDevicesByOrg } from '../../mocks/devices';
import { getOrganizationById } from '../../mocks/organizations';
import { ownerRevenueTrend } from '../../mocks/revenue';
import { platformActivity } from '../../mocks/activity';
import { relativeTime } from '../../components/ui/DeviceVitals';

export function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const orgId = user?.organizationId ?? 'org-1';
  const org = getOrganizationById(orgId);
  const myDevices = getDevicesByOrg(orgId);
  const online = myDevices.filter((d) => d.status === 'ONLINE').length;
  const offline = myDevices.filter((d) => d.status === 'OFFLINE').length;
  const error = myDevices.filter((d) => d.status === 'ERROR').length;
  const needsAttention = myDevices.filter((d) => d.status === 'ERROR' || d.status === 'OFFLINE');
  const myActivity = platformActivity.filter((a) => a.organizationName === org?.name).slice(0, 6);
  const isNewOwner = myDevices.length <= 1;

  return (
    <AppShell title="Business overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {isNewOwner && !loading && (
          <Card style={{ background: 'var(--color-primary-tint)', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ marginBottom: 6 }}>Welcome to Arvash Pool, {org?.ownerName?.split(' ')[0]}</h3>
            <p className="text-secondary" style={{ fontSize: 14 }}>
              You have {myDevices.length} table{myDevices.length === 1 ? '' : 's'} live. As you add more tables, this
              dashboard will fill in with revenue trends and activity across your whole venue.
            </p>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : (
            <>
              <KpiCard label="My devices" value={String(myDevices.length)} icon={<MonitorSmartphone size={16} strokeWidth={1.5} />} accent="primary" />
              <KpiCard label="Online / offline" value={`${online} / ${offline}`} icon={<Wifi size={16} strokeWidth={1.5} />} accent="success" />
              <KpiCard label="Devices in error" value={String(error)} icon={<AlertTriangle size={16} strokeWidth={1.5} />} accent="danger" />
              <KpiCard
                label="Revenue this month"
                value={`${((org?.revenueThisMonth ?? 0) / 1000).toFixed(0)}k RWF`}
                delta={5.2}
                deltaLabel="vs last month"
                icon={<Wallet size={16} strokeWidth={1.5} />}
                accent="secondary"
              />
            </>
          )}
        </div>

        {needsAttention.length > 0 && (
          <Card padding={0}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h3>Devices needing attention</h3>
              <button
                onClick={() => navigate('/owner/devices')}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
            {needsAttention.slice(0, 4).map((d) => (
              <div
                key={d.id}
                onClick={() => navigate(`/owner/devices/${d.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <span>{d.tableName}</span>
                <span style={{ color: d.status === 'ERROR' ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {d.status === 'ERROR' ? d.likelyCause : `offline · ${relativeTime(d.lastSeen)}`}
                </span>
              </div>
            ))}
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
          <Card>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Revenue trend</h3>
            {isNewOwner ? (
              <EmptyState title="Not enough data yet" message="Your revenue trend will appear here once you've had a few days of sales." />
            ) : (
              <TrendChart data={ownerRevenueTrend} />
            )}
          </Card>

          <Card padding={0}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
              <h3>Recent activity</h3>
            </div>
            {myActivity.length === 0 ? (
              <EmptyState title="No activity yet" message="Payments and device events will show up here." />
            ) : (
              myActivity.map((item) => (
                <div key={item.id} style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 13 }}>{item.message}</div>
                  <div className="caption">{relativeTime(item.timestamp)}</div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
