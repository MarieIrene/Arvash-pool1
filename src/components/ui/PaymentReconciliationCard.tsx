import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import { Transaction } from '../../types';

interface PaymentReconciliationCardProps {
  transaction: Transaction;
  title?: string;
  onClose?: () => void;
  onViewDevice?: () => void;
}

export function PaymentReconciliationCard({ transaction, title, onClose, onViewDevice }: PaymentReconciliationCardProps) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3>{title ?? `Reconciliation — ${transaction.tableName}`}</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Close
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-sunken)' }}>
          <div className="label" style={{ marginBottom: 8 }}>
            Payment record
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <div>{new Date(transaction.timestamp).toLocaleString()}</div>
            <div>
              {transaction.amount.toLocaleString()} RWF via {transaction.method}
            </div>
            <div>{transaction.gamesCount} games purchased</div>
            <StatusBadge status={transaction.status} size="sm" />
          </div>
        </div>
        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-sunken)' }}>
          <div className="label" style={{ marginBottom: 8 }}>
            Device session
          </div>
          <EmptyState title="No session found" message="The device never reported starting a session for this payment." />
        </div>
      </div>
      {onViewDevice && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button
            onClick={onViewDevice}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View device →
          </button>
        </div>
      )}
    </Card>
  );
}
