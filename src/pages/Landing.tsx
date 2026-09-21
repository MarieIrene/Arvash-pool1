import { Link } from 'react-router-dom';
import { CircleDot, MonitorSmartphone, Wallet, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

const FEATURES = [
  {
    icon: MonitorSmartphone,
    title: 'Fleet visibility',
    text: 'See every table across every venue — online, offline, or in error — from one console.',
  },
  {
    icon: Wallet,
    title: 'Payment reconciliation',
    text: "Catch payments that succeeded but never started a session, before a customer has to complain.",
  },
  {
    icon: ShieldCheck,
    title: 'Role-scoped access',
    text: 'Platform admins see the whole fleet; pool owners see only their own business.',
  },
];

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <CircleDot size={18} strokeWidth={1.75} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Arvash Pool</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Log in
          </Button>
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: 720, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
          <h1 style={{ fontSize: 40 }}>Run your pool-table fleet from one console</h1>
          <p className="text-secondary" style={{ fontSize: 16, maxWidth: 560 }}>
            Arvash Pool manages IoT-enabled pool tables end to end — mobile-money payments, remote device health,
            firmware, and support — for platform operators and individual pool-hall owners alike.
          </p>
          <Link to="/login">
            <Button variant="primary" style={{ padding: '10px 24px' }}>
              Log in to your dashboard
            </Button>
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)', width: '100%' }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-tint)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <f.icon size={17} strokeWidth={1.75} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{f.title}</div>
                <div className="text-secondary" style={{ fontSize: 13 }}>
                  {f.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
