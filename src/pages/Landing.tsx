import { CSSProperties, RefObject, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Ban, Banknote, BarChart3, Building2, Check, CircleDot, Cpu, Download,
  FileText, Gamepad2, GraduationCap, Headphones, Hotel, LayoutDashboard, Lock, Menu, RefreshCw, RotateCcw,
  Server, ShieldCheck, Signal, Smartphone, Ticket, Timer, Users, UtensilsCrossed, Wifi, WifiOff, Wine, X,
} from 'lucide-react';
import './landing.css';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const NAV = [
  { href: '#reports', label: 'Platform' },
  { href: '#range', label: 'Solutions' },
  { href: '#venues', label: 'Venues' },
  { href: '#payments', label: 'Payments' },
  { href: '#contact', label: 'Contact' },
];

/* The four waypoints on the hero route, and the four reports they deliver.
   `at` is the scroll progress at which the vehicle reaches the marker. */
const REPORTS = [
  {
    icon: Timer, label: 'Sessions & play time', refrain: 'You know who played.',
    body: 'Every game logged with start, end, duration and table, so play time always matches what was paid.',
    at: 0.08, cx: 152.8, cy: 94.5, side: 'right',
  },
  {
    icon: Banknote, label: 'Payments', refrain: 'You know what was paid.',
    body: 'Mobile-money payments unlock the table and are reconciled against the session they paid for.',
    at: 0.36, cx: 220.6, cy: 392.5, side: 'left',
  },
  {
    icon: Activity, label: 'Device health', refrain: 'You know which tables are up.',
    body: 'Heartbeat, signal and firmware for every controller, with offline states flagged instantly.',
    at: 0.64, cx: 64, cy: 655.2, side: 'right',
  },
  {
    icon: Lock, label: 'Tampering & alerts', refrain: 'You know what went wrong.',
    body: 'Unusual openings, power cuts and repeated failures raise an alert before they cost you revenue.',
    at: 0.92, cx: 189.2, cy: 925.3, side: 'left',
  },
] as const;

const ROUTE = 'M 196 18 C 40 190, 336 320, 168 494 S 26 772, 252 988';

const RANGE = [
  { icon: Cpu, label: 'Table controllers', desc: 'IoT controllers fitted to the table, on cellular or Wi‑Fi', to: '/login', cta: 'See the hardware' },
  { icon: Smartphone, label: 'Mobile-money payments', desc: 'Customers pay by phone and the table unlocks on its own', to: '/login', cta: 'See the payment flow' },
  { icon: Ticket, label: 'Vouchers', desc: 'Prepaid play that customers can check for themselves', to: '/voucher/check', cta: 'Check a voucher' },
  { icon: LayoutDashboard, label: 'Owner dashboard', desc: 'Live status and daily revenue for your own venues', to: '/login', cta: 'Open the dashboard' },
  { icon: Server, label: 'Admin console', desc: 'Every venue, provisioning, flashing and firmware rollout', to: '/login', cta: 'Open the console' },
  { icon: Headphones, label: 'Support & diagnostics', desc: 'Tickets and remote diagnostics from device vitals', to: '/login', cta: 'Get support' },
];

const TICKER = [
  'Cashless pool tables', 'IoT table controllers', 'Mobile-money payments',
  'Remote firmware updates', 'Live device monitoring', 'Role-scoped access',
];

const VENUES = [
  { icon: CircleDot, name: 'Pool halls', text: 'Know which tables are in play, cut idle time and make sure every game is paid for.' },
  { icon: Wine, name: 'Bars and lounges', text: 'Run tables without staff collecting coins, and see what they earn alongside the bar.' },
  { icon: Hotel, name: 'Hotels', text: 'Offer guests cashless play in the games room with nobody needed on the desk.' },
  { icon: Gamepad2, name: 'Gaming centres', text: 'Put pool next to your other games, with one record of sessions and payments.' },
  { icon: UtensilsCrossed, name: 'Restaurants', text: 'Turn a spare corner into steady revenue that runs itself between services.' },
  { icon: Users, name: 'Clubs', text: 'Members pay by phone or voucher, and the committee sees exactly what came in.' },
  { icon: GraduationCap, name: 'Campus and student unions', text: 'Cashless tables for busy common rooms, with uptime visible to the facilities team.' },
  { icon: Building2, name: 'Community centres', text: 'Simple, transparent table income that is easy to report on and hard to lose.' },
];

const PROBLEMS = [
  { icon: Ban, title: 'Games played without payment', text: 'Tables only unlock after a confirmed payment, so nobody plays for free.' },
  { icon: Banknote, title: 'Cash that never reaches the till', text: 'Every session is tied to a mobile-money transaction you can trace.' },
  { icon: RotateCcw, title: 'Charged but no game', text: 'Failed sessions are caught automatically and refunded or credited.' },
  { icon: WifiOff, title: 'Tables silently offline', text: 'Device heartbeats show which tables are down, and in which venue.' },
  { icon: RefreshCw, title: 'Out-of-date firmware', text: 'Push and track firmware updates across the whole fleet remotely.' },
  { icon: FileText, title: 'Hours lost on reports', text: 'Revenue per table, venue and day, exported in one click.' },
  { icon: Timer, title: 'Disputes over play time', text: 'Every session is timed and logged, so the record settles the argument.' },
  { icon: Ticket, title: 'Unaccounted vouchers', text: 'Every voucher is issued, redeemed and traced to the table it unlocked.' },
];

const PILLARS = [
  { title: 'Hardware', text: 'IoT controllers built for busy pool halls, fitted to the table and connected over cellular or Wi‑Fi.' },
  { title: 'Payments', text: 'Customers pay by mobile money or voucher. No coins, no cash box, no reconciliation by hand.' },
  { title: 'Support', text: 'Ticketing, remote diagnostics and provisioning from the same console your team already uses.' },
];

const SERVICES = [
  { title: 'Revenue reports', sub: 'Every franc, traced to a table', text: 'Revenue per table, venue and day, with paid-but-not-played sessions flagged for you.' },
  { title: 'Remote device management', sub: 'Fix it without a visit', text: 'Provision, flash and update controllers from the console, and see their vitals live.' },
  { title: 'Customer support', sub: 'Support that can see the table', text: 'Tickets linked to the device and the session, so problems are solved from the facts.' },
];

const PLATFORM = [
  { title: 'For pool-hall owners', text: 'Live status of your own tables and locations, daily revenue and transaction history. You only see what is yours.' },
  { title: 'For platform operators', text: 'Every venue and every table across all owners, with provisioning, firmware rollout and payment reconciliation.' },
  { title: 'For customers', text: 'Pay by phone, get a digital receipt, and check a voucher balance without asking anyone.' },
  { title: 'Remote firmware updates', text: 'Roll out controller firmware venue by venue, and see which tables are on which version.' },
];

const MARQUEE = ['Every table, completely visible', 'Cashless play', '24/7 device monitoring', 'Remote diagnostics'];

const WHY = [
  { icon: Cpu, title: 'Hardware and software together', text: 'One supplier for the controller, the payment flow and the dashboard. When something goes wrong there is no finger-pointing between vendors, just one team that owns the whole path from payment to table.' },
  { icon: ShieldCheck, title: 'Role-scoped by design', text: 'Admins, owners and customers each get exactly the access they need, and nothing more. An owner never sees another owner\'s venues, and a customer only ever sees their own receipts.' },
  { icon: Headphones, title: 'Support that can see the table', text: 'Our team diagnoses issues remotely from device vitals: heartbeat, signal and firmware. Most problems are fixed without anyone having to visit the venue.' },
];

const STATS = [
  { value: '24', unit: '/7', label: 'Device monitoring' },
  { value: '100', unit: '%', label: 'Cashless sessions' },
  { value: '1', unit: '', label: 'Console for every venue' },
  { value: '<1', unit: 'min', label: 'To spot an offline table' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)');

/* Writes scroll progress through `track` (0 at its top, 1 when its bottom meets
   the viewport bottom) to `--p` on `target`. Turns itself off under reduced
   motion, and marks the target `data-live` while running. */
function useScrollProgress(
  target: RefObject<HTMLElement>,
  track: RefObject<HTMLElement>,
  onProgress?: (p: number) => void,
) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = target.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mq = reducedMotion();
    let frame = 0;
    let live = false;

    const update = () => {
      frame = 0;
      if (!live) return;
      const rect = tr.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      el.style.setProperty('--p', p.toFixed(4));
      cb.current?.(p);
    };
    const schedule = () => { frame ||= requestAnimationFrame(update); };
    const apply = () => {
      live = !mq.matches;
      el.toggleAttribute('data-live', live);
      if (live) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        el.style.removeProperty('--p');
      }
    };

    mq.addEventListener('change', apply);
    apply();
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [target, track]);
}

/* Elements below the fold start hidden and resolve as the reader reaches them,
   staggered by their inline `--n`. Anything already on screen is left alone. */
function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window) || reducedMotion().matches) return;
    const items = el.querySelectorAll<HTMLElement>('.lp-reveal, .lp-reveal-soft, .lp-reveal-fade');
    const step = 60;
    const cap = 5;
    const timers: number[] = [];

    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = entry.target as HTMLElement;
        seen.unobserve(item);
        const n = Math.min(parseFloat(item.style.getPropertyValue('--n')) || 0, cap);
        if (n > 0) timers.push(window.setTimeout(() => item.removeAttribute('data-reveal'), n * step));
        else item.removeAttribute('data-reveal');
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

    const fold = window.innerHeight * 0.92;
    items.forEach((item) => {
      if (item.getBoundingClientRect().top < fold) return;
      item.setAttribute('data-reveal', '');
      seen.observe(item);
    });
    const frame = requestAnimationFrame(() => el.classList.add('reveal-ready'));

    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [root]);
}

/* The header takes the theme of whichever band sits directly beneath it, and
   turns translucent once the page has scrolled. */
function useHeaderTheme(root: RefObject<HTMLElement>, header: RefObject<HTMLElement>) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = root.current;
    const head = header.current;
    if (!el || !head) return;
    const bands = Array.from(el.querySelectorAll<HTMLElement>('[data-nav]'));
    const visible = new Set<HTMLElement>();
    let io: IntersectionObserver | undefined;

    const pick = () => {
      const first = bands.find((b) => visible.has(b));
      if (first) setTheme(first.dataset.nav === 'light' ? 'light' : 'dark');
    };
    const observe = () => {
      io?.disconnect();
      visible.clear();
      const h = head.getBoundingClientRect().height;
      const below = Math.max(0, window.innerHeight - h - 12);
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target as HTMLElement);
          else visible.delete(e.target as HTMLElement);
        }
        pick();
      }, { rootMargin: `-${h}px 0px -${below}px 0px`, threshold: 0 });
      bands.forEach((b) => io!.observe(b));
    };

    let timer = 0;
    const onResize = () => { clearTimeout(timer); timer = window.setTimeout(observe, 150); };
    observe();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      io?.disconnect();
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [root, header]);

  return { theme, scrolled };
}

export function Landing() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [rangeCurrent, setRangeCurrent] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const spiralRef = useRef<HTMLElement>(null);
  const spiralTrackRef = useRef<HTMLDivElement>(null);

  useReveal(rootRef);
  useScrollProgress(journeyRef, journeyRef);
  useScrollProgress(spiralRef, spiralTrackRef, (p) => setRangeCurrent(Math.round(p * (RANGE.length - 1))));
  const { theme, scrolled } = useHeaderTheme(rootRef, headerRef);

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

  const navTheme = menuOpen ? 'dark' : theme;

  return (
    <div className="lp" ref={rootRef}>
      <header
        ref={headerRef}
        className="lp-nav"
        data-theme={navTheme}
        data-state={scrolled || menuOpen ? 'scrolled' : 'top'}
      >
        <div className="lp-container-wide lp-nav-inner">
          <a href="#top" className="lp-brand" onClick={() => setMenuOpen(false)}>
            <span className="lp-brand-mark"><CircleDot size={18} strokeWidth={1.75} /></span>
            Arvash Pool
          </a>
          <nav className={`lp-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/login" className="lp-nav-mobile-only lp-btn lp-btn-md lp-btn-primary">Log in <ArrowUpRight size={16} /></Link>
          </nav>
          <div className="lp-nav-actions">
            {!isInstalled && (
              <button type="button" className="lp-btn lp-btn-sm lp-btn-chip" aria-label="Install Arvash Pool" onClick={handleInstall}>
                <Download size={15} /> <span className="lp-hide-sm">Install</span>
              </button>
            )}
            <Link to="/login" className="lp-btn lp-btn-sm lp-btn-primary lp-hide-sm">Log in <ArrowUpRight size={15} /></Link>
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
        {/* Hero: a scroll-driven journey. The route on the right draws itself
            as the reports on the left glide past the read head. */}
        <section ref={journeyRef} className="lp-journey lp-on-dark" data-nav="dark">
          <div className="lp-journey-wash" aria-hidden="true" />
          <div className="lp-container-wide lp-rel">
            <div className="lp-journey-grid">
              <div>
                <div className="lp-journey-panel lp-hero-intro">
                  <p className="lp-eyebrow lp-mb-6">Smart pool operations in Rwanda</p>
                  <h1 className="lp-display-xl">Every table, completely visible</h1>
                  <p className="lp-lead lp-measure lp-mt-7">
                    Arvash Pool connects every table, payment and venue you run to one platform: who played, what they
                    paid, and whether every table is online.
                  </p>
                  <div className="lp-actions lp-mt-10">
                    <Link to="/login" className="lp-btn lp-btn-lg lp-btn-primary">Log in to your dashboard</Link>
                    <a href="#reports" className="lp-btn lp-btn-lg lp-btn-secondary-dark">Explore the platform</a>
                  </div>
                </div>

                <div id="reports" className="lp-journey-panel lp-journey-payoff lp-report">
                  <div className="lp-report-stage">
                    <div className="lp-report-head">
                      <div className="lp-report-meta">
                        <p className="lp-eyebrow">What an Arvash table reports</p>
                        <p className="lp-counter" aria-hidden="true">
                          <span className="lp-counter-slot">
                            {REPORTS.map((_, i) => (
                              <span key={i} className="lp-counter-n" style={{ '--i': i } as Vars}>{pad(i + 1)}</span>
                            ))}
                          </span>
                          <span className="lp-counter-total">/ {pad(REPORTS.length)}</span>
                        </p>
                      </div>
                      <span className="lp-meter" aria-hidden="true"><span className="lp-meter-fill" /></span>
                      <h2 className="lp-report-title lp-h2">Every game, every payment, every heartbeat</h2>
                      <div className="lp-report-say lp-measure">
                        <p className="lp-say lp-say-lead lp-lead">
                          Sessions, payments, device health and alerts on the same connection, into one console.
                        </p>
                        <p className="lp-say lp-say-closing lp-lead">
                          Four reports from every table. By closing time you have a record of a night you were never there for.
                        </p>
                      </div>
                      <dl className="lp-specs">
                        <div className="lp-spec">
                          <dt className="lp-spec-label">Device monitoring</dt>
                          <dd className="lp-spec-value">24<span className="lp-spec-unit">/7</span></dd>
                        </div>
                        <div className="lp-spec">
                          <dt className="lp-spec-label">Cashless sessions</dt>
                          <dd className="lp-spec-value">100<span className="lp-spec-unit">%</span></dd>
                        </div>
                      </dl>
                    </div>

                    <div className="lp-window">
                      <div className="lp-window-clip">
                        <div className="lp-window-cam">
                          <ol className="lp-strip">
                            {REPORTS.map((r, i) => (
                              <li key={r.label} className="lp-row" style={{ '--i': i } as Vars}>
                                <span className="lp-row-n">{pad(i + 1)}</span>
                                <span className="lp-row-text">
                                  <span className="lp-row-label"><r.icon size={15} strokeWidth={2} />{r.label}</span>
                                  <span className="lp-row-refrain">{r.refrain}</span>
                                  <span className="lp-row-body">{r.body}</span>
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      <span className="lp-readhead" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lp-journey-rail" aria-hidden="true">
                <div className="lp-journey-stage">
                  <svg className="lp-journey-svg" viewBox="0 0 360 1000" fill="none" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="lp-journey-fade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7ba8d4" stopOpacity="0" />
                        <stop offset="10%" stopColor="#7ba8d4" />
                        <stop offset="90%" stopColor="#7ba8d4" />
                        <stop offset="100%" stopColor="#7ba8d4" stopOpacity="0" />
                      </linearGradient>
                      <filter id="lp-journey-glow" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="7" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    <path d={ROUTE} stroke="#ffffff" strokeOpacity="0.13" strokeWidth="3" strokeLinecap="round" />
                    <path
                      className="lp-journey-trace"
                      d={ROUTE}
                      pathLength={1}
                      stroke="url(#lp-journey-fade)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="url(#lp-journey-glow)"
                    />
                    {REPORTS.map((r) => (
                      <g key={r.label} className="lp-journey-marker" style={{ '--at': r.at } as Vars}>
                        <circle cx={r.cx} cy={r.cy} r="17" fill="#ffffff" />
                        <circle cx={r.cx} cy={r.cy} r="17" fill="none" stroke="#3b6ea5" strokeOpacity="0.45" strokeWidth="1.5" />
                        <circle cx={r.cx} cy={r.cy} r="4.5" fill="#3b6ea5" />
                      </g>
                    ))}
                    <g className="lp-journey-vehicle">
                      <circle r="26" fill="#7ba8d4" fillOpacity="0.16" />
                      <circle r="9" fill="#7ba8d4" filter="url(#lp-journey-glow)" />
                    </g>
                  </svg>
                  {REPORTS.map((r) => (
                    <span
                      key={r.label}
                      className={`lp-journey-label lp-journey-label-${r.side}`}
                      style={{ '--at': r.at, '--y': `${r.cy / 10}%` } as Vars}
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The range: a helix of cards the camera descends as you scroll. */}
        <section
          id="range"
          ref={spiralRef}
          className="lp-spiral lp-on-dark"
          data-nav="dark"
          style={{ '--count': RANGE.length } as Vars}
        >
          <div ref={spiralTrackRef} className="lp-spiral-track">
            <div className="lp-spiral-viewport">
              <div className="lp-container lp-spiral-layout">
                <div className="lp-spiral-menu">
                  <p className="lp-eyebrow">The platform</p>
                  <h2 className="lp-h2 lp-mt-4">Six parts, one system for every table</h2>
                  <p className="lp-spiral-counter" aria-hidden="true">
                    <span className="lp-counter-slot">
                      {RANGE.map((_, i) => (
                        <span key={i} className="lp-spiral-counter-n" style={{ '--i': i } as Vars}>{pad(i + 1)}</span>
                      ))}
                    </span>
                    <span className="lp-counter-total">/ {pad(RANGE.length)}</span>
                    <span className="lp-spiral-counter-rail"><span className="lp-meter-fill" /></span>
                  </p>
                  <p className="lp-spiral-menu-title">What are you looking for?</p>
                  <ul className="lp-spiral-list">
                    {RANGE.map((item, i) => (
                      <li key={item.label}>
                        <Link to={item.to} className="lp-spiral-link" data-current={i === rangeCurrent ? '' : undefined}>
                          <span className="lp-spiral-link-index">{pad(i + 1)}</span>
                          <span className="lp-spiral-link-label">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lp-spiral-stage">
                  <div className="lp-spiral-spine" aria-hidden="true">
                    <span className="lp-spiral-spine-line" />
                    <span className="lp-spiral-glow" />
                  </div>
                  <div className="lp-spiral-ring">
                    {RANGE.map((item, i) => (
                      <Link key={item.label} to={item.to} className="lp-spiral-item" style={{ '--i': i } as Vars}>
                        <span className="lp-spiral-card">
                          <span className="lp-spiral-card-icon"><item.icon size={18} strokeWidth={1.75} /></span>
                          <span className="lp-spiral-card-label">{item.label}</span>
                          <span className="lp-spiral-card-desc">{item.desc}</span>
                          <span className="lp-spiral-card-cta">{item.cta} <ArrowRight size={15} /></span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="lp-ticker" data-nav="light">
          <div className="lp-container-wide">
            <ul>
              {TICKER.map((t, i) => (
                <li key={t}>{i > 0 && <span className="lp-ticker-dot" />}{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Venues */}
        <section id="venues" className="lp-section lp-soft" data-nav="light">
          <div className="lp-container">
            <div className="lp-head-row">
              <div className="lp-reveal">
                <p className="lp-eyebrow lp-mb-4">Venues we serve</p>
                <h2 className="lp-h2">Built for how Rwanda actually plays</h2>
                <p className="lp-lead lp-muted lp-measure lp-mt-5">
                  A pool hall, a hotel games room and a student union have almost nothing in common except that somebody
                  needs to know the tables are paid for and working. These are the places we build for.
                </p>
              </div>
              <Link to="/login" className="lp-btn lp-btn-md lp-btn-secondary">Talk to us</Link>
            </div>
            <ul className="lp-venue-wall">
              {VENUES.map((v, i) => (
                <li key={v.name} style={{ '--n': i % 4 } as Vars} className="lp-venue-cell">
                  <div className="lp-venue lp-reveal-fade" style={{ '--n': i % 4 } as Vars}>
                    <span className="lp-venue-rule" />
                    <span className="lp-venue-index">{pad(i + 1)}</span>
                    <span className="lp-venue-icon"><v.icon size={20} strokeWidth={1.75} /></span>
                    <span className="lp-venue-name">{v.name}</span>
                    <span className="lp-venue-summary">{v.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Start here */}
        <section className="lp-section" data-nav="light">
          <div className="lp-container">
            <div className="lp-reveal">
              <p className="lp-eyebrow lp-mb-4">Start here</p>
              <h2 className="lp-h2">What are you trying to stop losing?</h2>
              <p className="lp-lead lp-muted lp-measure lp-mt-5">
                Pick what is costing your venue most. We will point you at the part of the system built for it, and you
                can decide from there whether it is worth a conversation.
              </p>
            </div>
            <ul className="lp-problem-grid lp-mt-10">
              {PROBLEMS.map((p, i) => (
                <li key={p.title} className="lp-reveal-soft" style={{ '--n': i % 4 } as Vars}>
                  <Link to="/login" className="lp-problem">
                    <span className="lp-problem-icon"><p.icon size={16} strokeWidth={2} /></span>
                    <span className="lp-h4">{p.title}</span>
                    <span className="lp-problem-text">{p.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pillars */}
        <section className="lp-section" data-nav="light">
          <div className="lp-container">
            <div className="lp-reveal">
              <p className="lp-eyebrow lp-mb-4">Our value proposition</p>
              <h2 className="lp-h2">Three things we hold ourselves to</h2>
            </div>
            <ul className="lp-pillars lp-mt-10">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="lp-pillar lp-reveal" style={{ '--n': i } as Vars}>
                  <p className="lp-label">{pad(i + 1)}</p>
                  <h3 className="lp-h3 lp-mt-3">{p.title}</h3>
                  <p className="lp-muted lp-mt-3">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Payments feature */}
        <section id="payments" className="lp-section lp-section-lg lp-on-dark lp-contour" data-nav="dark">
          <div className="lp-container-wide">
            <div className="lp-feature">
              <div>
                <p className="lp-eyebrow lp-mb-4">Cashless play</p>
                <h2 className="lp-h2">Pay with your phone, play in seconds</h2>
                <p className="lp-lead lp-measure lp-mt-5">
                  Customers pay by mobile money or voucher and the table unlocks on its own. Every payment is matched to
                  the session it started, and the ones that don't match are flagged for you.
                </p>
                <p className="lp-measure lp-mt-4 lp-faint">Keep every table paid for, every night.</p>
                <ul className="lp-checks lp-mt-8">
                  {['Mobile money payments', 'Voucher payments', 'Automatic table unlock', 'Digital receipts', 'Paid-but-not-played checks', 'Daily reconciliation'].map((c, i) => (
                    <li key={c} className="lp-reveal" style={{ '--n': i % 3 } as Vars}><Check size={18} />{c}</li>
                  ))}
                </ul>
                <div className="lp-actions lp-mt-9">
                  <Link to="/login" className="lp-btn lp-btn-md lp-btn-primary">See it in the dashboard</Link>
                  <Link to="/voucher/check" className="lp-btn lp-btn-md lp-btn-on-dark">Check a voucher</Link>
                </div>
              </div>
              <div className="lp-phone lp-reveal-soft" aria-hidden="true">
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
          </div>
        </section>

        {/* Device monitoring feature */}
        <section className="lp-section lp-section-lg" data-nav="light">
          <div className="lp-container">
            <div className="lp-feature lp-feature-flip">
              <div className="lp-monitor lp-reveal-soft" aria-hidden="true">
                <div className="lp-monitor-head">
                  <span>Kigali · Main hall</span>
                  <span className="lp-monitor-live"><span className="lp-dot" /> Live</span>
                </div>
                {[
                  { t: 'Table 01', s: 'In play', sig: 92, ok: true },
                  { t: 'Table 02', s: 'Idle', sig: 88, ok: true },
                  { t: 'Table 03', s: 'In play', sig: 76, ok: true },
                  { t: 'Table 04', s: 'Offline', sig: 0, ok: false },
                  { t: 'Table 05', s: 'In play', sig: 81, ok: true },
                ].map((row) => (
                  <div key={row.t} className="lp-monitor-row" data-ok={row.ok ? '' : undefined}>
                    <span className="lp-monitor-name"><CircleDot size={15} /> {row.t}</span>
                    <span className="lp-monitor-state">{row.s}</span>
                    <span className="lp-monitor-signal"><Signal size={14} /> {row.ok ? `${row.sig}%` : '—'}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="lp-eyebrow lp-mb-4">Device monitoring</p>
                <h2 className="lp-h2">See a table go down before your customers do</h2>
                <p className="lp-lead lp-muted lp-measure lp-mt-5">
                  Every controller reports a heartbeat, its signal strength and firmware version. The console shows which
                  tables are down and where, and our support team can usually fix them remotely, without a visit.
                </p>
                <div className="lp-actions lp-mt-9">
                  <Link to="/login" className="lp-btn lp-btn-md lp-btn-primary">See device status</Link>
                  <a href="#contact" className="lp-btn lp-btn-md lp-btn-secondary">Talk to support</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="lp-section lp-soft" data-nav="light">
          <div className="lp-container">
            <div className="lp-reveal">
              <p className="lp-eyebrow lp-mb-4">Services</p>
              <h2 className="lp-h2">What we do with the data once it arrives</h2>
              <p className="lp-lead lp-muted lp-measure lp-mt-5">
                Hardware is half the job. These three services decide whether the reporting becomes a management tool or
                another dashboard nobody opens.
              </p>
            </div>
            <div className="lp-services">
              {SERVICES.map((s, i) => (
                <article key={s.title} className="lp-service lp-reveal" style={{ '--n': i } as Vars}>
                  <span className="lp-label">{pad(i + 1)}</span>
                  <h3 className="lp-h3 lp-mt-3"><Link to="/login" className="lp-stretch">{s.title}</Link></h3>
                  <p className="lp-service-sub">{s.sub}</p>
                  <p className="lp-muted lp-measure lp-mt-3">{s.text}</p>
                  <p className="lp-service-go">See how {s.title} works <ArrowRight size={16} /></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* On the platform */}
        <section className="lp-section lp-on-dark lp-ink-2" data-nav="dark">
          <div className="lp-container">
            <div className="lp-platform">
              <div>
                <p className="lp-eyebrow lp-mb-4">On the platform</p>
                <h2 className="lp-h2">One system, the right view for everyone</h2>
                <div className="lp-platform-icons">
                  <span><Wifi size={18} /> Live device status</span>
                  <span><BarChart3 size={18} /> Revenue reports</span>
                </div>
              </div>
              <ul className="lp-platform-grid">
                {PLATFORM.map((p, i) => (
                  <li key={p.title} className="lp-reveal" style={{ '--n': i } as Vars}>
                    <h3 className="lp-h4">{p.title}</h3>
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="lp-marquee" data-nav="dark" role="presentation">
          <div className="lp-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}>{m}<span className="lp-marquee-dot" /></span>
            ))}
          </div>
        </div>

        {/* Why */}
        <section id="why" className="lp-section" data-nav="light">
          <div className="lp-container">
            <div className="lp-head-row">
              <div className="lp-reveal">
                <p className="lp-eyebrow lp-mb-4">Why Arvash Pool</p>
                <h2 className="lp-h2">What separates us from the rest</h2>
                <p className="lp-lead lp-muted lp-measure lp-mt-5">
                  The three things we point to when someone asks why they should trust us with their tables.
                </p>
              </div>
              <a href="#contact" className="lp-btn lp-btn-md lp-btn-secondary">Get in touch</a>
            </div>
            <ul className="lp-pillars lp-why lp-mt-12">
              {WHY.map((w, i) => (
                <li key={w.title} className="lp-reveal" style={{ '--n': i } as Vars}>
                  <p className="lp-why-n">{pad(i + 1)}</p>
                  <h3 className="lp-h3 lp-mt-4">{w.title}</h3>
                  <p className="lp-muted lp-mt-3">{w.text}</p>
                </li>
              ))}
            </ul>
            <div className="lp-stats">
              <dl>
                {STATS.map((s) => (
                  <div key={s.label} className="lp-stat">
                    <dt>{s.label}</dt>
                    <dd>{s.value}<span>{s.unit}</span></dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="lp-cta lp-on-dark lp-contour" data-nav="dark">
          <div className="lp-cta-glow" aria-hidden="true" />
          <div className="lp-container lp-rel">
            <div className="lp-cta-inner">
              <div>
                <p className="lp-eyebrow lp-mb-4">Get started</p>
                <h2 className="lp-h2">Tell us what you need to see</h2>
                <p className="lp-lead lp-measure lp-mt-5">
                  Whether you run one pool hall or a hundred tables, describe your venue and we will show you how Arvash
                  Pool fits, what it covers, and what it costs.
                </p>
              </div>
              <div className="lp-cta-actions">
                <Link to="/login" className="lp-btn lp-btn-lg lp-btn-primary">Log in</Link>
                {!isInstalled && (
                  <button type="button" className="lp-btn lp-btn-lg lp-btn-on-dark" onClick={handleInstall}>
                    <Download size={17} /> Install the app
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer lp-on-dark" data-nav="dark">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-brand">
                <span className="lp-brand-mark"><CircleDot size={18} strokeWidth={1.75} /></span>
                Arvash Pool
              </div>
              <p className="lp-footer-tagline">Smart pool-table operations: payments, devices and support in one place.</p>
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
