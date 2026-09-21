import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-5)',
        gap: 'var(--space-2)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-sunken)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {icon ?? <Inbox size={22} strokeWidth={1.5} />}
      </div>
      <h3 style={{ fontSize: 16 }}>{title}</h3>
      {message && (
        <p className="text-secondary" style={{ maxWidth: 360, fontSize: 14 }}>
          {message}
        </p>
      )}
      {ctaLabel && onCta && (
        <Button variant="primary" size="sm" onClick={onCta} style={{ marginTop: 'var(--space-3)' }}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "We couldn't load this data.", onRetry }: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-5)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-danger-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)',
        }}
      >
        !
      </div>
      <p className="text-secondary" style={{ fontSize: 14 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
