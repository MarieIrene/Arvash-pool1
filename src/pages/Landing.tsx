import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Banknote, BarChart3, Check, CircleDot, Cpu, Download,
  Headphones, Lock, Menu, ShieldCheck, Smartphone, Timer, Wifi, Wrench, X,
} from 'lucide-react';
import './landing.css';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const NAV = [
  { href: '#reports', label: 'Platform' },
  { href: '#problems', label: 'Solutions' },
  { href: '#payments', label: 'Payments' },
  { href: '#why', label: 'Why Arvash' },
  { href: '#contact', label: 'Contact' },
];

const REPORTS = [
  { icon: Timer, title: 'Sessions & play time', text: 'Every game is logged — start, end, duration and the table it ran on — so play time always matches what was paid.' },
  { icon: Banknote, title: 'Payments', text: 'Mobile-money payments unlock the table automatically and are reconciled against the session they paid for.' },
  { icon: Activity, title: 'Device health', text: 'Heartbeat, signal strength and firmware version for every controller, with offline and error states flagged instantly.' },
  { icon: Lock, title: 'Tampering & alerts', text: 'Unusual openings, power cuts and repeated failures raise alerts before they turn into lost revenue.' },
];

const PROBLEMS = [
  { title: 'Games played without payment', text: 'Tables only unlock after a confirmed payment.' },
  { title: 'Cash that never reaches the till', text: 'Every session is tied to a mobile-money transaction.' },
  { title: 'Customers charged but no game', text: 'Failed sessions are caught and refunded or credited.' },
  { title: 'Tables silently offline', text: 'Device heartbeats show which tables are down, and where.' },
  { title: 'Out-of-date firmware', text: 'Push and track firmware updates across the fleet remotely.' },
  { title: 'Hours lost on manual reports', text: 'Revenue per table, venue and day — exported in one click.' },
];

const PILLARS = [
  { title: 'Hardware', text: 'IoT controllers built for busy pool halls — fitted to the table, connected over cellular or Wi‑Fi.' },
  { title: 'Payments', text: 'Customers pay by mobile money or voucher. No coins, no cash box, no reconciliation by hand.' },
  { title: 'Support', text: 'Ticketing, remote diagnostics and provisioning from the same console your team already uses.' },
];

const AUDIENCES = [
  {
    tag: 'For platform operators',
    title: 'The whole fleet, one console',
    points: ['Every venue and every table across all owners', 'Provisioning, flashing and firmware rollout', 'Payment reconciliation and support tickets'],
  },
  {
    tag: 'For pool-hall owners',
    title: 'Your business, nothing else',
    points: ['Live status of your own tables and locations', 'Daily revenue and transaction history', 'Role-scoped access — you only see what is yours'],
  },
];

const WHY = [
  { icon: Cpu, title: 'Hardware and software together', text: 'One supplier for the controller, the payment flow and the dashboard — no finger-pointing between vendors.' },
  { icon: ShieldCheck, title: 'Role-scoped by design', text: 'Admins, owners and customers each get exactly the access they need, and nothing more.' },
  { icon: Headphones, title: 'Support that can see the table', text: 'Our team diagnoses issues remotely from device vitals, so most problems are fixed without a visit.' },
];

const STATS = [
  { value: '24/7', label: 'Device monitoring' },
  { value: '100%', label: 'Cashless sessions' },
  { value: '1', label: 'Console for every venue' },
  { value: '<1 min', label: 'To spot an offline table' },
];

export function Landing() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(0);

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

  const pad = (n: number) => String(n).padStart(2, '0');
  const report = REPORTS[activeReport];

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#top" className="lp-brand" onClick={() => setMenuOpen(false)}>
            <span className="lp-brand-mark"><CircleDot size={18} strokeWidth={1.75} /></span>
            Arvash Pool
          </a>
          <nav className={`lp-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/login" className="lp-nav-mobile-only lp-btn lp-btn-primary">Log in <ArrowUpRight size={16} /></Link>
          </nav>
          <div className="lp-nav-actions">
            {!isInstalled && (
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" aria-label="Install Arvash Pool" onClick={handleInstall}>
                <Download size={15} /> <span className="lp-hide-sm">Install</span>
              </button>
            )}
            <Link to="/login" className="lp-btn lp-btn-primary lp-btn-sm lp-hide-sm">Log in <ArrowUpRight size={15} /></Link>
            <button
              type="button"
              className="lp-menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {installMessage && <div className="lp-install-message" role="status">{installMessage}</div>}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="lp-hero lp-dark">
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-label lp-label-accent">Smart pool operations</p>
              <h1 className="lp-display">Every table, completely visible</h1>
              <p className="lp-lead">
                Arvash Pool connects your pool tables, payments and venues to one platform — who played, what they paid,
                and whether every table is online, from a single console.
              </p>
              <div className="lp-actions">
                <Link to="/login" className="lp-btn lp-btn-primary">Log in to your dashboard <ArrowUpRight size={17} /></Link>
                <a href="#reports" className="lp-btn lp-btn-outline-light">Explore the platform <ArrowRight size={17} /></a>
              </div>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <div className="lp-table">
                <div className="lp-table-felt">
                  {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`lp-pocket lp-pocket-${i}`} />)}
                  <span className="lp-ball lp-ball-cue" />
                  <span className="lp-ball lp-ball-a" />
                  <span className="lp-ball lp-ball-b" />
                  <span className="lp-ball lp-ball-c" />
                </div>
              </div>
              <div className="lp-float lp-float-top">
                <span className="lp-dot lp-dot-live" /> Table 04 · In play
                <strong>18:42</strong>
              </div>
              <div className="lp-float lp-float-bottom">
                <Smartphone size={16} /> Payment confirmed
                <strong>Session unlocked</strong>
              </div>
            </div>
          </div>
        </section>

        {/* What a table reports */}
        <section id="reports" className="lp-section lp-dark lp-dark-alt">
          <div className="lp-container">
            <div className="lp-section-head">
              <p className="lp-label lp-label-accent">What an Arvash table reports</p>
              <h2 className="lp-h2">Every game, every payment, every heartbeat</h2>
            </div>

            <div className="lp-reports">
              <div className="lp-report-tabs" role="tablist" aria-label="Reported data">
                {REPORTS.map((r, i) => (
                  <button
                    key={r.title}
                    type="button"
                    role="tab"
                    aria-selected={i === activeReport}
                    className={`lp-report-tab${i === activeReport ? ' is-active' : ''}`}
                    onClick={() => setActiveReport(i)}
                  >
                    <span className="lp-num">{pad(i + 1)}</span>
                    {r.title}
                  </button>
                ))}
              </div>
              <div className="lp-report-panel" role="tabpanel">
                <div className="lp-report-count">{pad(activeReport + 1)} / {pad(REPORTS.length)}</div>
                <report.icon size={34} strokeWidth={1.5} className="lp-report-icon" />
                <h3 className="lp-h3">{report.title}</h3>
                <p>{report.text}</p>
                <div className="lp-report-stats">
                  <div><strong>Real-time</strong><span>status updates</span></div>
                  <div><strong>Every</strong><span>session reconciled</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems */}
        <section id="problems" className="lp-section">
          <div className="lp-container lp-split">
            <div className="lp-section-head lp-sticky">
              <p className="lp-label">Start here</p>
              <h2 className="lp-h2">What are you trying to stop losing?</h2>
              <p className="lp-muted">Pick the problem that costs your pool hall the most. Arvash Pool was built around each one.</p>
            </div>
            <ul className="lp-problem-list">
              {PROBLEMS.map((p, i) => (
                <li key={p.title}>
                  <Link to="/login" className="lp-problem">
                    <span className="lp-num">{pad(i + 1)}</span>
                    <span className="lp-problem-body">
                      <strong>{p.title}</strong>
                      <span>{p.text}</span>
                    </span>
                    <ArrowRight size={20} className="lp-problem-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pillars */}
        <section className="lp-section lp-soft">
          <div className="lp-container">
            <div className="lp-section-head">
              <p className="lp-label">Our approach</p>
              <h2 className="lp-h2">Three things we hold ourselves to</h2>
            </div>
            <div className="lp-pillars">
              {PILLARS.map((p, i) => (
                <div key={p.title} className="lp-pillar">
                  <span className="lp-num lp-num-lg">{pad(i + 1)}</span>
                  <h3 className="lp-h3">{p.title}</h3>
                  <p className="lp-muted">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payments feature */}
        <section id="payments" className="lp-section lp-dark">
          <div className="lp-container lp-feature">
            <div>
              <p className="lp-label lp-label-accent">Cashless play</p>
              <h2 className="lp-h2">Pay with your phone, play in seconds</h2>
              <p className="lp-lead">
                Customers pay by mobile money or voucher and the table unlocks on its own. Every payment is matched to the
                session it started — and the ones that don't match are flagged for you.
              </p>
              <ul className="lp-checks">
                <li><Check size={18} /> Mobile money and voucher payments</li>
                <li><Check size={18} /> Automatic table unlock on confirmation</li>
                <li><Check size={18} /> Digital receipts customers can check themselves</li>
                <li><Check size={18} /> Reconciliation of paid-but-not-played sessions</li>
              </ul>
              <div className="lp-actions">
                <Link to="/login" className="lp-btn lp-btn-primary">See it in the dashboard <ArrowUpRight size={17} /></Link>
                <Link to="/voucher/check" className="lp-btn lp-btn-outline-light">Check a voucher</Link>
              </div>
            </div>
            <div className="lp-phone" aria-hidden="true">
              <div className="lp-phone-screen">
                <div className="lp-phone-head"><CircleDot size={16} /> Arvash Pool</div>
                <div className="lp-phone-amount">500 <small>RWF</small></div>
                <div className="lp-phone-meta">Table 04 · 30 minutes</div>
                <div className="lp-phone-status"><Check size={16} /> Payment received</div>
                <div className="lp-phone-row"><span>Session</span><strong>Started</strong></div>
                <div className="lp-phone-row"><span>Method</span><strong>Mobile money</strong></div>
              </div>
            </div>
          </div>
        </section>

        {/* Audiences */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head">
              <p className="lp-label">On the platform</p>
              <h2 className="lp-h2">One system, the right view for everyone</h2>
            </div>
            <div className="lp-audiences">
              {AUDIENCES.map((a, i) => (
                <div key={a.tag} className="lp-audience">
                  <div className="lp-audience-top">
                    <span className="lp-num">{pad(i + 1)}</span>
                    <span className="lp-tag">{a.tag}</span>
                  </div>
                  <h3 className="lp-h3">{a.title}</h3>
                  <ul className="lp-checks lp-checks-dark">
                    {a.points.map((pt) => <li key={pt}><Check size={18} /> {pt}</li>)}
                  </ul>
                  <Link to="/login" className="lp-link">Log in <ArrowRight size={16} /></Link>
                </div>
              ))}
            </div>
            <div className="lp-strip">
              <span><Wifi size={18} /> Live device status</span>
              <span><BarChart3 size={18} /> Revenue reports</span>
              <span><Wrench size={18} /> Remote firmware updates</span>
            </div>
          </div>
        </section>

        {/* Why */}
        <section id="why" className="lp-section lp-soft">
          <div className="lp-container">
            <div className="lp-section-head">
              <p className="lp-label">Why Arvash Pool</p>
              <h2 className="lp-h2">What separates us from the rest</h2>
            </div>
            <div className="lp-pillars">
              {WHY.map((w, i) => (
                <div key={w.title} className="lp-pillar">
                  <div className="lp-why-top">
                    <span className="lp-num">{pad(i + 1)}</span>
                    <w.icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="lp-h3">{w.title}</h3>
                  <p className="lp-muted">{w.text}</p>
                </div>
              ))}
            </div>
            <div className="lp-stats">
              {STATS.map((s) => (
                <div key={s.label} className="lp-stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="lp-cta lp-dark">
          <div className="lp-container lp-cta-inner">
            <div>
              <p className="lp-label lp-label-accent">Get started</p>
              <h2 className="lp-h2">Tell us what you need to see</h2>
              <p className="lp-lead">Whether you run one pool hall or a hundred tables, we'll show you how Arvash Pool fits.</p>
            </div>
            <div className="lp-actions">
              <Link to="/login" className="lp-btn lp-btn-primary">Log in <ArrowUpRight size={17} /></Link>
              {!isInstalled && (
                <button type="button" className="lp-btn lp-btn-outline-light" onClick={handleInstall}>
                  <Download size={17} /> Install the app
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer lp-dark">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-brand">
                <span className="lp-brand-mark"><CircleDot size={18} strokeWidth={1.75} /></span>
                Arvash Pool
              </div>
              <p className="lp-footer-tagline">Smart pool-table operations — payments, devices and support in one place.</p>
            </div>
            <div>
              <h4 className="lp-footer-title">Platform</h4>
              <a href="#reports">What a table reports</a>
              <a href="#payments">Cashless payments</a>
              <a href="#why">Why Arvash</a>
            </div>
            <div>
              <h4 className="lp-footer-title">Customers</h4>
              <Link to="/voucher/check">Check a voucher</Link>
              <Link to="/login">Owner login</Link>
              <Link to="/forgot-password">Reset password</Link>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} Arvash Pool. All rights reserved.</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
