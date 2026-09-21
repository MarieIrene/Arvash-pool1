import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  requireTypedText?: string; // if set, user must type this exact text to confirm
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  requireTypedText,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  if (!open) return null;

  const canConfirm = !requireTypedText || typed === requireTypedText;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 22, 26, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 420,
          padding: 'var(--space-5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: danger ? 'var(--color-danger-tint)' : 'var(--color-warning-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: danger ? 'var(--color-danger)' : 'var(--color-warning)',
            }}
          >
            <AlertTriangle size={18} strokeWidth={1.75} />
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>{title}</h3>
        <p className="text-secondary" style={{ fontSize: 14, marginBottom: requireTypedText ? 'var(--space-3)' : 'var(--space-5)' }}>
          {description}
        </p>
        {requireTypedText && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Type "{requireTypedText}" to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger-outline' : 'primary'}
            size="sm"
            disabled={!canConfirm}
            onClick={() => {
              onConfirm();
              setTyped('');
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
