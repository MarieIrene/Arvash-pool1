import { useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { TrendChart } from '../../components/ui/TrendChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { getDevicesByOrg } from '../../mocks/devices';
import { getTransactionsByDevice } from '../../mocks/transactions';
import { ownerRevenueTrend } from '../../mocks/revenue';

export function OwnerRevenue() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 'org-1';
  const devices = getDevicesByOrg(orgId);

  const byDevice = useMemo(
    () =>
      devices
        .map((d) => ({
          device: d,
          revenue: getTransactionsByDevice(d.id)
            .filter((t) => t.status === 'SUCCESS')
            .reduce((sum, t) => sum + t.amount, 0),
        }))
        .sort((a, b) => b.revenue - a.revenue),
    [devices]
  );

  const maxRevenue = Math.max(...byDevice.map((d) => d.revenue), 1);
  const isNewOwner = devices.length <= 1;

  return (
    <AppShell title="Revenue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
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
            <h3>Revenue by table</h3>
          </div>
          {byDevice.length === 0 ? (
            <div style={{ padding: 'var(--space-5)' }}>
              <EmptyState title="No devices yet" message="Add your first table to start tracking revenue by device." />
            </div>
          ) : (
            byDevice.map(({ device, revenue }) => (
              <div key={device.id} style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{device.tableName}</span>
                  <span>{revenue.toLocaleString()} RWF</span>
                </div>
                <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(revenue / maxRevenue) * 100}%`,
                      height: '100%',
                      background: 'var(--color-primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AppShell>
  );
}
