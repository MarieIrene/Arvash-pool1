import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
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
