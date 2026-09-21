import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CustomerPage } from './CustomerPage';
import { Card } from '../../components/ui/Card';
import { getTransactionById } from '../../mocks/transactions';

export function PaymentReceipt() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = transactionId ? getTransactionById(transactionId) : undefined;

  if (!transaction) {
    return (
      <CustomerPage>
        <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <XCircle size={40} strokeWidth={1.5} color="var(--color-danger)" />
          <h3 style={{ fontSize: 16 }}>Receipt not found</h3>
          <p className="text-secondary" style={{ fontSize: 14 }}>
            This payment link may have expired or is no longer valid.
          </p>
        </Card>
      </CustomerPage>
    );
  }

  return (
    <CustomerPage>
      <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
        <CheckCircle2 size={44} strokeWidth={1.5} color="var(--color-success)" />
        <h2 style={{ fontSize: 20 }}>Payment received</h2>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{transaction.amount.toLocaleString()} RWF</div>
        <div className="text-secondary" style={{ fontSize: 14 }}>
          {transaction.gamesCount} game{transaction.gamesCount === 1 ? '' : 's'} purchased via {transaction.method}
        </div>
        <div
          style={{
            width: '100%',
            marginTop: 'var(--space-3)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-sunken)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Table</span>
            <span style={{ fontWeight: 600 }}>{transaction.tableName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Venue</span>
            <span style={{ fontWeight: 600 }}>{transaction.organizationName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Date</span>
            <span style={{ fontWeight: 600 }}>{new Date(transaction.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </CustomerPage>
  );
}
