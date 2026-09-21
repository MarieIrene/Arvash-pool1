import { Voucher } from '../types';
import { findVoucher } from '../mocks/vouchers';

const LATENCY = 500;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export type VoucherCheckResult =
  | { outcome: 'valid'; voucher: Voucher }
  | { outcome: 'redeemed'; voucher: Voucher }
  | { outcome: 'expired'; voucher: Voucher }
  | { outcome: 'not_found' };

export const voucherService = {
  async check(code: string, deviceId: string): Promise<VoucherCheckResult> {
    const voucher = findVoucher(code, deviceId);
    if (!voucher) return delay({ outcome: 'not_found' });
    if (voucher.redeemed) return delay({ outcome: 'redeemed', voucher });
    if (new Date(voucher.expiresAt).getTime() < Date.now()) return delay({ outcome: 'expired', voucher });
    return delay({ outcome: 'valid', voucher });
  },
};
