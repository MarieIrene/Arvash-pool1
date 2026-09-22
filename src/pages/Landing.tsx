import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleDot, MonitorSmartphone, Wallet, ShieldCheck } from 'lucide-react';
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
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <CircleDot size={18} strokeWidth={1.75} />
          </div>
          <span>Arvash Pool</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Log in <ArrowUpRight size={15} />
          </Button>
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-copy">
            <div className="landing-eyebrow"><span /> SMART POOL OPERATIONS</div>
            <h1>Run your pool-table fleet from one console</h1>
            <p className="text-secondary">
              Arvash Pool manages IoT-enabled pool tables end to end — mobile-money payments, remote device health,
              firmware, and support — for platform operators and individual pool-hall owners alike.
            </p>
            <div className="landing-actions">
              <Link to="/login"><Button variant="primary">Log in to your dashboard <ArrowUpRight size={16} /></Button></Link>
            </div>
          </div>
        </section>
        <div className="landing-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature">
              <div className="landing-feature-icon">
                <f.icon size={17} strokeWidth={1.75} />
              </div>
              <div className="landing-feature-title">{f.title}</div>
              <div className="text-secondary landing-feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
