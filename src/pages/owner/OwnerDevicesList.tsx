import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BatteryIndicator, SignalIndicator } from '../../components/ui/DeviceIndicators';
import { relativeTime } from '../../components/ui/DeviceVitals';
import { deviceService } from '../../services/deviceService';
import { useAuth } from '../../context/AuthContext';
import { Device, DeviceStatus } from '../../types';

const STATUSES: DeviceStatus[] = ['ONLINE', 'OFFLINE', 'ERROR', 'PROVISIONED'];

export function OwnerDevicesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId ?? 'org-1';
  const [rows, setRows] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | ''>('');

  useEffect(() => {
    setLoading(true);
    deviceService
      .list({ organizationId: orgId, search: search || undefined, status: statusFilter || undefined })
      .then((data) => {
        setRows(data);
        setLoading(false);
      });
  }, [orgId, search, statusFilter]);

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
    <AppShell title="My devices">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table name…"
              style={{
                padding: '8px 10px 8px 32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 13,
                fontFamily: 'inherit',
                minWidth: 220,
              }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | '')} style={selectStyle}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <Card padding={0}>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(d) => d.id}
            loading={loading}
            onRowClick={(d) => navigate(`/owner/devices/${d.id}`)}
            emptyTitle="No devices yet"
            emptyMessage="Once your tables are provisioned, they'll show up here."
          />
        </Card>
      </div>
    </AppShell>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
