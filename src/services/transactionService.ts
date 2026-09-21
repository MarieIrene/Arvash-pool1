import { PaymentStatus, PaymentMethod } from '../types';
import { transactions, stuckPayments } from '../mocks/transactions';

const LATENCY = 400;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface TransactionFilter {
  organizationId?: string;
  deviceId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
}

export const transactionService = {
  async list(filter: TransactionFilter = {}) {
    let result = [...transactions];
    if (filter.organizationId) result = result.filter((t) => t.organizationId === filter.organizationId);
    if (filter.deviceId) result = result.filter((t) => t.deviceId === filter.deviceId);
    if (filter.status) result = result.filter((t) => t.status === filter.status);
    if (filter.method) result = result.filter((t) => t.method === filter.method);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.organizationName.toLowerCase().includes(q) ||
          t.tableName.toLowerCase().includes(q) ||
          t.customerPhone.includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    return delay(result);
  },
  async stuckPayments() {
    return delay([...stuckPayments]);
  },
};
