import { useAuth } from '../../context/AuthContext';
import { TransactionsPage } from '../admin/Transactions';

export function OwnerTransactions() {
  const { user } = useAuth();
  return <TransactionsPage organizationId={user?.organizationId ?? 'org-1'} title="My transactions" />;
}
