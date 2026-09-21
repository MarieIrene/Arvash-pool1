import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getDevicesByOrg } from '../../mocks/devices';
import { getOrganizationById } from '../../mocks/organizations';

export function OwnerLocations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId ?? 'org-1';
  const org = getOrganizationById(orgId);
  const devices = getDevicesByOrg(orgId);

  // Group by location (mock data has one location per org, shown here for the pattern)
  const byLocation = new Map<string, typeof devices>();
  devices.forEach((d) => {
    const list = byLocation.get(d.locationName) ?? [];
    list.push(d);
    byLocation.set(d.locationName, list);
  });

  return (
    <AppShell title="Live locations">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {[...byLocation.entries()].map(([name, list]) => {
          const online = list.filter((d) => d.status === 'ONLINE').length;
          const ratio = Math.round((online / list.length) * 100);
          const first = list[0];
          return (
            <Card
              key={name}
              onClick={() => navigate('/owner/devices')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-tint)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={16} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
                  <div className="caption">
                    {first.district}, {first.sector} · {org?.region}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary" style={{ fontSize: 13 }}>
                  {list.length} device{list.length === 1 ? '' : 's'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: ratio === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {ratio}% online
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
