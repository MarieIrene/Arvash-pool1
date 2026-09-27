import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleDot, Download, MonitorSmartphone, Wallet, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setInstallMessage('');
    if (!installPrompt) {
      setInstallMessage('Choose “Install Arvash Pool” from your browser menu.');
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === 'accepted') setIsInstalled(true);
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <CircleDot size={18} strokeWidth={1.75} />
          </div>
          <span>Arvash Pool</span>
        </div>
        <div className="landing-header-actions">
          {!isInstalled && (
            <Button variant="primary" size="sm" aria-label="Install Arvash Pool" onClick={handleInstall}>
              <Download size={15} /> Install
            </Button>
          )}
          <Link to="/login">
            <Button variant="outline" size="sm">
              Log in <ArrowUpRight size={15} />
            </Button>
          </Link>
          {installMessage && <span className="install-message" role="status">{installMessage}</span>}
        </div>
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
