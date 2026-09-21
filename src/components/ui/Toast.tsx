import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--space-5)',
          right: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          zIndex: 1000,
          maxWidth: 360,
        }}
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant];
          const colorVar = `var(--color-${toast.variant})`;
          const tintVar = `var(--color-${toast.variant}-tint)`;
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeft: `3px solid ${colorVar}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--radius-full)',
                  background: tintVar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={colorVar} strokeWidth={1.75} />
              </div>
              <span style={{ fontSize: 14, color: 'var(--color-text-primary)', flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 2,
                  lineHeight: 0,
                }}
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
