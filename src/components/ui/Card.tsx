import { CSSProperties, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
}

export function Card({ padding = 'var(--space-5)', style, children, ...rest }: CardProps) {
  const merged: CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    padding,
    ...style,
  };
  return (
    <div style={merged} {...rest}>
      {children}
    </div>
  );
}
