import { useEffect, useMemo, useState } from 'react';
import { Download, Search, AlertCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { transactionService } from '../../services/transactionService';
import { Transaction, PaymentStatus, PaymentMethod } from '../../types';

const STATUSES: PaymentStatus[] = ['SUCCESS', 'PENDING', 'FAILED'];
const METHODS: PaymentMethod[] = ['MoMo', 'Airtel'];

export function TransactionsPage({ organizationId, title = 'Transactions' }: { organizationId?: string; title?: string }) {
  return (
    <AppShell title={title}>
      <TransactionsTable organizationId={organizationId} />
    </AppShell>
  );
}

export function TransactionsTable({ organizationId }: { organizationId?: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [stuckCount, setStuckCount] = useState(0);

  const load = () => {
    setLoading(true);
    setError(false);
    transactionService
      .list({ organizationId, search: search || undefined, status: status || undefined, method: method || undefined })
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
  }, [search, status, method, organizationId]);

  useEffect(() => {
    transactionService.stuckPayments().then((s) => {
      const scoped = organizationId ? s.filter((t) => t.organizationId === organizationId) : s;
      setStuckCount(scoped.length);
    });
  }, [organizationId]);

  const columns: Column<Transaction>[] = useMemo(
    () => [
      { key: 'referenceNumber', header: 'Reference no.', sortValue: (t) => t.referenceNumber, render: (t) => <span style={{ fontWeight: 600 }}>{t.referenceNumber}</span> },
      { key: 'referenceUuid', header: 'Reference UUID', sortValue: (t) => t.referenceUuid, render: (t) => <span className="table-code" title={t.referenceUuid}>{t.referenceUuid}</span> },
      { key: 'timestamp', header: 'Date / time', sortValue: (t) => t.timestamp, render: (t) => (
        <span className="text-secondary">{new Date(t.timestamp).toLocaleString()}</span>
      ) },
      { key: 'org', header: 'Organization', sortValue: (t) => t.organizationName, render: (t) => t.organizationName },
      { key: 'device', header: 'Device', sortValue: (t) => t.tableName, render: (t) => t.tableName },
      { key: 'amount', header: 'Amount', sortValue: (t) => t.amount, render: (t) => `${t.amount.toLocaleString()} RWF` },
      { key: 'method', header: 'Method', sortValue: (t) => t.method, render: (t) => t.method },
      { key: 'games', header: 'Games', sortValue: (t) => t.gamesCount, render: (t) => t.gamesCount },
      {
        key: 'status',
        header: 'Status',
        sortValue: (t) => t.status,
        render: (t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusBadge status={t.status} size="sm" />
            {t.status === 'SUCCESS' && !t.hasSession && (
              <span title="Payment succeeded but no session was recorded" style={{ color: 'var(--color-warning)', display: 'flex' }}>
                <AlertCircle size={14} strokeWidth={1.75} />
              </span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {stuckCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-warning-tint)',
              border: '1px solid var(--color-warning)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} strokeWidth={1.75} color="var(--color-warning)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{stuckCount} stuck payments</div>
                <div className="text-secondary" style={{ fontSize: 13 }}>
                  Payment succeeded but the device never started a session. These need reconciliation.
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStatus('SUCCESS')}>
              Review
            </Button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search org, table, phone…"
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
            <select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | '')} style={selectStyle}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | '')} style={selectStyle}>
              <option value="">All providers</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.show('Transactions exported to CSV.', 'success')}>
            <Download size={14} strokeWidth={1.75} /> Export CSV
          </Button>
        </div>

        <Card padding={0}>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(t) => t.id}
            loading={loading}
            error={error}
            onRetry={load}
            emptyTitle="No transactions match these filters"
            emptyMessage="Try a different date range or clear a filter."
            pageSize={12}
          />
        </Card>
    </div>
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
