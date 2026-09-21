import { FormEvent, useState } from 'react';
import { CheckCircle2, XCircle, Clock, HelpCircle } from 'lucide-react';
import { CustomerPage } from './CustomerPage';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { voucherService, VoucherCheckResult } from '../../services/voucherService';

export function VoucherCheck() {
  const [code, setCode] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoucherCheckResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !deviceId.trim()) return;
    setLoading(true);
    const outcome = await voucherService.check(code, deviceId);
    setResult(outcome);
    setLoading(false);
  };

  return (
    <CustomerPage>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18 }}>Check a voucher</h2>
          <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
            Enter the voucher code and the device UUID to confirm it's valid.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Voucher code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD1234"
              style={inputStyle}
              autoCapitalize="characters"
            />
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Device UUID
            </label>
            <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="dev-0001" style={inputStyle} />
          </div>
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 16px' }}>
            {loading ? 'Checking…' : 'Check voucher'}
          </Button>
        </form>

        {result && <VoucherResult result={result} />}
      </Card>
    </CustomerPage>
  );
}

function VoucherResult({ result }: { result: VoucherCheckResult }) {
  const config: Record<VoucherCheckResult['outcome'], { icon: typeof CheckCircle2; color: string; title: string; message: string }> = {
    valid: {
      icon: CheckCircle2,
      color: 'var(--color-success)',
      title: 'Voucher is valid',
      message: 'This voucher can be redeemed at the device now.',
    },
    redeemed: {
      icon: XCircle,
      color: 'var(--color-danger)',
      title: 'Already redeemed',
      message: 'This voucher has already been used and cannot be redeemed again.',
    },
    expired: {
      icon: Clock,
      color: 'var(--color-warning)',
      title: 'Voucher expired',
      message: 'This voucher is past its expiry date.',
    },
    not_found: {
      icon: HelpCircle,
      color: 'var(--color-text-muted)',
      title: 'Voucher not found',
      message: 'Double-check the code and device UUID and try again.',
    },
  };

  const { icon: Icon, color, title, message } = config[result.outcome];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-sunken)',
      }}
    >
      <Icon size={28} strokeWidth={1.5} color={color} />
      <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
      <div className="text-secondary" style={{ fontSize: 13 }}>
        {message}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
};
