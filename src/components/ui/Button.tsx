import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'outline' | 'text' | 'danger-outline';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontWeight: 600,
  fontFamily: 'inherit',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
  whiteSpace: 'nowrap',
};

function styleFor(variant: Variant, size: Size): React.CSSProperties {
  const padding = size === 'sm' ? '6px 12px' : '9px 16px';
  const fontSize = size === 'sm' ? 13 : 14;

  switch (variant) {
    case 'primary':
      return {
        ...BASE,
        padding,
        fontSize,
        background: 'var(--color-primary)',
        color: '#ffffff',
        border: '1px solid var(--color-primary)',
      };
    case 'outline':
      return {
        ...BASE,
        padding,
        fontSize,
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-strong)',
      };
    case 'danger-outline':
      return {
        ...BASE,
        padding,
        fontSize,
        background: 'var(--color-surface)',
        color: 'var(--color-danger)',
        border: '1px solid var(--color-danger)',
      };
    case 'text':
      return {
        ...BASE,
        padding: size === 'sm' ? '6px 8px' : '9px 10px',
        fontSize,
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
      };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', size = 'md', style, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          ...styleFor(variant, size),
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (variant === 'primary') e.currentTarget.style.background = 'var(--color-primary-hover)';
          if (variant === 'outline') e.currentTarget.style.background = 'var(--color-surface-sunken)';
          if (variant === 'text') e.currentTarget.style.background = 'var(--color-surface-sunken)';
          if (variant === 'danger-outline') e.currentTarget.style.background = 'var(--color-danger-tint)';
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          if (variant === 'primary') e.currentTarget.style.background = 'var(--color-primary)';
          if (variant === 'outline') e.currentTarget.style.background = 'var(--color-surface)';
          if (variant === 'text') e.currentTarget.style.background = 'transparent';
          if (variant === 'danger-outline') e.currentTarget.style.background = 'var(--color-surface)';
        }}
        {...rest}
      />
    );
  }
);
Button.displayName = 'Button';
