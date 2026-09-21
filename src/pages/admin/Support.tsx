import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ticketService } from '../../services/ticketService';
import { Ticket, TicketType, TicketStatus } from '../../types';
import { organizations } from '../../mocks/organizations';

const TYPES: TicketType[] = ['payment_mismatch', 'voucher_issue', 'hardware_fault'];
const STATUSES: TicketStatus[] = ['OPEN', 'INVESTIGATING', 'RESOLVED'];

const TYPE_LABEL: Record<TicketType, string> = {
  payment_mismatch: 'Payment mismatch',
  voucher_issue: 'Voucher issue',
  hardware_fault: 'Hardware fault',
};

export function Support() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<TicketType | ''>('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [orgId, setOrgId] = useState('');

  const load = () => {
    setLoading(true);
    ticketService.list({ type: type || undefined, status: status || undefined, organizationId: orgId || undefined }).then((data) => {
      setRows(data);
      setLoading(false);
    });
  };

  useEffect(load, [type, status, orgId]);

  const columns: Column<Ticket>[] = useMemo(
    () => [
      {
        key: 'subject',
        header: 'Ticket',
        sortValue: (t) => t.subject,
        render: (t) => (
          <div>
            <div style={{ fontWeight: 600 }}>{t.subject}</div>
            <div className="caption">{t.organizationName}</div>
          </div>
        ),
      },
      { key: 'type', header: 'Type', sortValue: (t) => t.type, render: (t) => TYPE_LABEL[t.type] },
      { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => <StatusBadge status={t.status} size="sm" /> },
      { key: 'updated', header: 'Updated', sortValue: (t) => t.updatedAt, render: (t) => (
        <span className="text-secondary">{new Date(t.updatedAt).toLocaleString()}</span>
      ) },
    ],
    []
  );

  return (
    <AppShell title="Support">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <select value={type} onChange={(e) => setType(e.target.value as TicketType | '')} style={selectStyle}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus | '')} style={selectStyle}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)} style={selectStyle}>
            <option value="">All organizations</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <Card padding={0}>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(t) => t.id}
            loading={loading}
            onRowClick={(t) => navigate(`/admin/support/${t.id}`)}
            emptyTitle="No tickets match these filters"
            emptyMessage="Try clearing a filter."
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
