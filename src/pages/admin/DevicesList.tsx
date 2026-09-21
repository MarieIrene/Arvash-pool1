import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Download } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LocationCascadeSelect } from '../../components/ui/LocationCascadeSelect';
import { BatteryIndicator, SignalIndicator } from '../../components/ui/DeviceIndicators';
import { relativeTime } from '../../components/ui/DeviceVitals';
import { deviceService } from '../../services/deviceService';
import { Device, DeviceStatus } from '../../types';
import { organizations } from '../../mocks/organizations';

const STATUSES: DeviceStatus[] = ['ONLINE', 'OFFLINE', 'ERROR', 'PROVISIONED'];

export function DevicesList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | ''>((searchParams.get('status') as DeviceStatus) || '');
  const [geo, setGeo] = useState<{ province?: string; district?: string; sector?: string }>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    setError(false);
    deviceService
      .list({
        organizationId: orgFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        ...geo,
      })
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgFilter, statusFilter, search, geo]);

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: Column<Device>[] = useMemo(
    () => [
      {
        key: 'select',
        header: '',
        width: '36px',
        render: (d) => (
          <input
            type="checkbox"
            checked={selected.has(d.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggleSelect(d.id)}
          />
        ),
      },
      { key: 'tableName', header: 'Table', sortValue: (d) => d.tableName, render: (d) => (
        <div>
          <div style={{ fontWeight: 600 }}>{d.tableName}</div>
          <div className="caption">{d.serial}</div>
        </div>
      ) },
      { key: 'org', header: 'Organization', sortValue: (d) => d.organizationName, render: (d) => d.organizationName },
      { key: 'location', header: 'Location', sortValue: (d) => d.sector, render: (d) => (
        <span className="text-secondary">{d.district} · {d.sector}</span>
      ) },
      { key: 'status', header: 'Status', sortValue: (d) => d.status, render: (d) => <StatusBadge status={d.status} size="sm" /> },
      { key: 'battery', header: 'Battery', sortValue: (d) => d.battery, render: (d) => <BatteryIndicator pct={d.battery} /> },
      { key: 'signal', header: 'Signal', sortValue: (d) => d.signal, render: (d) => <SignalIndicator bars={d.signal} /> },
      { key: 'firmware', header: 'Firmware', sortValue: (d) => d.firmwareVersion, render: (d) => (
        <span className="text-secondary">
          {d.firmwareVersion}
          {d.firmwareUpdateAvailable && <span style={{ color: 'var(--color-warning)' }}> ●</span>}
        </span>
      ) },
      { key: 'lastSeen', header: 'Last seen', sortValue: (d) => d.lastSeen, render: (d) => (
        <span className="text-secondary">{relativeTime(d.lastSeen)}</span>
      ) },
    ],
    [selected]
  );

  return (
    <AppShell title="Devices">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search UUID, serial, table name…"
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
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | '')}
              style={selectStyle}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <LocationCascadeSelect value={geo} onChange={setGeo} size="sm" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {selected.size > 0 && (
              <>
                <Button variant="outline" size="sm">
                  Bulk firmware update ({selected.size})
                </Button>
                <Button variant="outline" size="sm">
                  <Download size={14} strokeWidth={1.75} /> Export
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status legend */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <StatusBadge key={s} status={s} size="sm" />
          ))}
        </div>

        <Card padding={0}>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(d) => d.id}
            loading={loading}
            error={error}
            onRetry={load}
            onRowClick={(d) => navigate(`/admin/devices/${d.id}`)}
            emptyTitle="No devices match these filters"
            emptyMessage="Try widening your search or clearing a filter."
            pageSize={10}
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
