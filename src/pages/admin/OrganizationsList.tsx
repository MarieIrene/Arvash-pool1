import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { orgService } from '../../services/orgService';
import { Organization } from '../../types';

export function OrganizationsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [healthTier, setHealthTier] = useState<'' | 'has_errors'>('');
  const [region, setRegion] = useState('');
  const [onboardOpen, setOnboardOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    orgService
      .list()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const regions = useMemo(() => Array.from(new Set(rows.map((o) => o.region))).sort(), [rows]);

  const filtered = useMemo(() => {
    let result = rows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.name.toLowerCase().includes(q) || o.ownerName.toLowerCase().includes(q));
    }
    if (healthTier === 'has_errors') result = result.filter((o) => o.errorCount > 0);
    if (region) result = result.filter((o) => o.region === region);
    return result;
  }, [rows, search, healthTier, region]);

  const columns: Column<Organization>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Organization',
        sortValue: (o) => o.name,
        render: (o) => (
          <div>
            <div style={{ fontWeight: 600 }}>{o.name}</div>
            <div className="caption">{o.ownerName}</div>
          </div>
        ),
      },
      { key: 'locations', header: 'Locations', sortValue: (o) => o.locationCount, render: (o) => o.locationCount },
      { key: 'devices', header: 'Devices', sortValue: (o) => o.deviceCount, render: (o) => o.deviceCount },
      {
        key: 'ratio',
        header: 'Online / offline',
        sortValue: (o) => o.onlineCount,
        render: (o) => (
          <span className="text-secondary">
            {o.onlineCount} / {o.offlineCount}
            {o.errorCount > 0 && <span style={{ color: 'var(--color-danger)' }}> · {o.errorCount} error</span>}
          </span>
        ),
      },
      {
        key: 'revenue',
        header: 'Revenue this month',
        sortValue: (o) => o.revenueThisMonth,
        render: (o) => `${o.revenueThisMonth.toLocaleString()} RWF`,
      },
      { key: 'status', header: 'Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} size="sm" /> },
    ],
    []
  );

  return (
    <AppShell title="Organizations">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or owner…"
                style={{ ...inputStyle, paddingLeft: 32, minWidth: 220 }}
              />
            </div>
            <select value={healthTier} onChange={(e) => setHealthTier(e.target.value as '' | 'has_errors')} style={selectStyle}>
              <option value="">All health tiers</option>
              <option value="has_errors">Has devices in error</option>
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
              <option value="">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={() => setOnboardOpen(true)}>
            <Plus size={14} strokeWidth={1.75} /> Onboard new owner
          </Button>
        </div>

        <Card padding={0}>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(o) => o.id}
            loading={loading}
            error={error}
            onRetry={load}
            onRowClick={(o) => navigate(`/admin/organizations/${o.id}`)}
            emptyTitle="No organizations match these filters"
            emptyMessage="Try clearing a filter or searching a different name."
          />
        </Card>
      </div>

      {onboardOpen && (
        <OnboardOwnerModal
          onClose={() => setOnboardOpen(false)}
          onSubmit={() => {
            setOnboardOpen(false);
            toast.show('Owner onboarded. They will receive login instructions by email.', 'success');
          }}
        />
      )}
    </AppShell>
  );
}

function OnboardOwnerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner.trim()) return;
    onSubmit();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 22, 26, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 420,
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Onboard new owner</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 6 }}>
            Business name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Kigali Cue Club" required />
        </div>
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 6 }}>
            Owner name
          </label>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} style={inputStyle} placeholder="Jean-Paul Habimana" required />
        </div>
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 6 }}>
            Contact phone
          </label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle} placeholder="+250 7XX XXX XXX" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Onboard owner
          </Button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
};

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
