import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { KpiCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { DataTable, Column } from '../../components/ui/DataTable';
import { PaymentReconciliationCard } from '../../components/ui/PaymentReconciliationCard';
import { transactionService } from '../../services/transactionService';
import { reportService } from '../../services/reportService';
import { CountPoint } from '../../mocks/revenue';
import { Transaction, PaymentMethod } from '../../types';

const METHODS: PaymentMethod[] = ['MoMo', 'Airtel'];

export function Payments() {
  const navigate = useNavigate();
  const [stuck, setStuck] = useState<Transaction[]>([]);
  const [all, setAll] = useState<Transaction[]>([]);
  const [volumeTrend, setVolumeTrend] = useState<CountPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    Promise.all([transactionService.list(), transactionService.stuckPayments(), reportService.paymentVolumeTrend()]).then(
      ([allTxns, stuckTxns, trend]) => {
        setAll(allTxns);
        setStuck(stuckTxns);
        setVolumeTrend(trend);
        setLoading(false);
      }
    );
  }, []);

  const successRateByProvider = useMemo(
    () =>
      METHODS.map((method) => {
        const forMethod = all.filter((t) => t.method === method);
        const successful = forMethod.filter((t) => t.status === 'SUCCESS').length;
        return {
          method,
          rate: forMethod.length ? Math.round((successful / forMethod.length) * 100) : 0,
        };
      }),
    [all]
  );

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
    ],
    []
  );

  return (
    <AppShell title="Payments">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : (
            successRateByProvider.map((s) => (
              <KpiCard key={s.method} label={`${s.method} success rate`} value={`${s.rate}%`} accent={s.rate >= 90 ? 'success' : 'warning'} />
            ))
          )}
        </div>

        <Card>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Payment volume</h3>
          {loading ? (
            <Skeleton height={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  tickFormatter={(v: string) => v.slice(5)}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v, 'Transactions']}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card padding={0}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 'var(--space-4) var(--space-5)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <AlertCircle size={18} strokeWidth={1.75} color="var(--color-warning)" />
            <div>
              <h3>Stuck payments</h3>
              <div className="text-secondary" style={{ fontSize: 13 }}>
                Payment succeeded but the device never started a session — reconcile these first.
              </div>
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={stuck}
            rowKey={(t) => t.id}
            loading={loading}
            onRowClick={(t) => setSelected(t)}
            emptyTitle="No stuck payments"
            emptyMessage="Every successful payment has a matching session right now."
          />
        </Card>

        {selected && (
          <PaymentReconciliationCard
            transaction={selected}
            onClose={() => setSelected(null)}
            onViewDevice={() => navigate(`/admin/devices/${selected.deviceId}`)}
          />
        )}
      </div>
    </AppShell>
  );
}
