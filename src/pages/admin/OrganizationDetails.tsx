import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TrendChart } from '../../components/ui/TrendChart';
import { Tabs } from '../../components/ui/Tabs';
import { DataTable, Column } from '../../components/ui/DataTable';
import { BatteryIndicator, SignalIndicator } from '../../components/ui/DeviceIndicators';
import { relativeTime } from '../../components/ui/DeviceVitals';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { TransactionsTable } from './Transactions';
import { orgService } from '../../services/orgService';
import { deviceService } from '../../services/deviceService';
import { revenueTrendForMonthlyTotal } from '../../mocks/revenue';
import { Device, Organization } from '../../types';

export function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orgService.get(id).then((data) => {
      setOrg(data ?? null);
      if (data) setStatus(data.status);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Organization details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Skeleton height={90} />
          <Skeleton height={260} />
        </div>
      </AppShell>
    );
  }

  if (!org) {
    return (
      <AppShell title="Organization details">
        <Card>
          <EmptyState title="Organization not found" message="This organization may have been removed." />
        </Card>
      </AppShell>
    );
  }

  const isSuspended = status === 'SUSPENDED';

  return (
    <AppShell title={org.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <Link to="/admin/organizations" style={{ color: 'var(--color-text-muted)' }}>
            Organizations
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-text-primary)' }}>{org.name}</span>
        </div>

        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2>{org.name}</h2>
              <StatusBadge status={status} />
            </div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              {org.pricePerGame} RWF / game · Owner {org.ownerName} · {org.ownerContact}
            </div>
            <div className="caption" style={{ marginTop: 4 }}>
              Onboarded {new Date(org.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Button variant={isSuspended ? 'primary' : 'danger-outline'} size="sm" onClick={() => setConfirmOpen(true)}>
            {isSuspended ? 'Activate organization' : 'Suspend organization'}
          </Button>
        </Card>

        <Card>
          <Tabs
            tabs={[
              {
                key: 'overview',
                label: 'Overview',
                content: <OverviewTab org={org} />,
              },
              {
                key: 'locations',
                label: 'Locations',
                content: <LocationsTab organizationId={org.id} />,
              },
              {
                key: 'devices',
                label: 'Devices',
                content: <DevicesTab organizationId={org.id} />,
              },
              {
                key: 'transactions',
                label: 'Transactions',
                content: <TransactionsTable organizationId={org.id} />,
              },
            ]}
          />
        </Card>

        <Card
          style={{
            border: '1px solid var(--color-danger)',
            background: 'var(--color-danger-tint)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-danger)' }}>Danger zone</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              {isSuspended
                ? 'This organization is suspended — its devices cannot accept payments until reactivated.'
                : 'Suspending immediately stops this organization from accepting payments across all devices.'}
            </div>
          </div>
          <Button variant="danger-outline" size="sm" onClick={() => setConfirmOpen(true)}>
            {isSuspended ? 'Activate organization' : 'Suspend organization'}
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={isSuspended ? 'Activate organization' : 'Suspend organization'}
        description={
          isSuspended
            ? `Reactivate ${org.name}? Their devices will be able to accept payments again immediately.`
            : `Suspend ${org.name}? All of their devices will stop accepting payments immediately.`
        }
        confirmLabel={isSuspended ? 'Activate' : 'Suspend'}
        requireTypedText={isSuspended ? undefined : org.name}
        danger={!isSuspended}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          const next = isSuspended ? 'ACTIVE' : 'SUSPENDED';
          setStatus(next);
          setConfirmOpen(false);
          toast.show(`${org.name} is now ${next === 'ACTIVE' ? 'active' : 'suspended'}.`, next === 'ACTIVE' ? 'success' : 'warning');
        }}
      />
    </AppShell>
  );
}

function OverviewTab({ org }: { org: Organization }) {
  const trend = useMemo(() => revenueTrendForMonthlyTotal(org.revenueThisMonth), [org.revenueThisMonth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
        <KpiCard label="Devices" value={String(org.deviceCount)} accent="primary" />
        <KpiCard label="Online / offline" value={`${org.onlineCount} / ${org.offlineCount}`} accent="success" />
        <KpiCard label="Devices in error" value={String(org.errorCount)} accent="danger" />
        <KpiCard label="Revenue this month" value={`${(org.revenueThisMonth / 1000).toFixed(0)}k RWF`} accent="secondary" />
      </div>
      <div>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Revenue trend</h3>
        <TrendChart data={trend} />
      </div>
    </div>
  );
}

function LocationsTab({ organizationId }: { organizationId: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deviceService.list({ organizationId }).then((data) => {
      setDevices(data);
      setLoading(false);
    });
  }, [organizationId]);

  if (loading) return <Skeleton height={140} />;

  const byLocation = new Map<string, Device[]>();
  devices.forEach((d) => {
    const list = byLocation.get(d.locationName) ?? [];
    list.push(d);
    byLocation.set(d.locationName, list);
  });

  if (byLocation.size === 0) {
    return <EmptyState title="No locations yet" message="Locations appear once devices are provisioned for this organization." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
      {[...byLocation.entries()].map(([name, list]) => {
        const online = list.filter((d) => d.status === 'ONLINE').length;
        const ratio = Math.round((online / list.length) * 100);
        const first = list[0];
        return (
          <Card key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
                  {first.district}, {first.sector}
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
  );
}

function DevicesTab({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deviceService.list({ organizationId }).then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [organizationId]);

  const columns: Column<Device>[] = useMemo(
    () => [
      { key: 'tableName', header: 'Table', sortValue: (d) => d.tableName, render: (d) => (
        <div>
          <div style={{ fontWeight: 600 }}>{d.tableName}</div>
          <div className="caption">{d.locationName}</div>
        </div>
      ) },
      { key: 'status', header: 'Status', sortValue: (d) => d.status, render: (d) => <StatusBadge status={d.status} size="sm" /> },
      { key: 'battery', header: 'Battery', sortValue: (d) => d.battery, render: (d) => <BatteryIndicator pct={d.battery} /> },
      { key: 'signal', header: 'Signal', sortValue: (d) => d.signal, render: (d) => <SignalIndicator bars={d.signal} /> },
      { key: 'lastSeen', header: 'Last seen', sortValue: (d) => d.lastSeen, render: (d) => (
        <span className="text-secondary">{relativeTime(d.lastSeen)}</span>
      ) },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(d) => d.id}
      loading={loading}
      onRowClick={(d) => navigate(`/admin/devices/${d.id}`)}
      emptyTitle="No devices yet"
      emptyMessage="Devices provisioned for this organization will show up here."
    />
  );
}
