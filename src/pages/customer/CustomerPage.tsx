import { ReactNode } from 'react';
import { CircleDot } from 'lucide-react';

export function CustomerPage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 'var(--space-5)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <CircleDot size={20} strokeWidth={1.75} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Arvash Pool</span>
        </div>
        {children}
      </div>
    </div>
  );
}
