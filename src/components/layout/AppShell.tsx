import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusTarget = target.matches('input, button, select, textarea, [tabindex]')
      ? target
      : target.querySelector<HTMLElement>('input, button, select, textarea, [tabindex]');
    focusTarget?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} />
        <main className="app-main" style={{ flex: 1, padding: 'var(--space-6)', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
