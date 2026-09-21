export function Skeleton({ width = '100%', height = 14, radius = 6 }: { width?: number | string; height?: number; radius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--color-surface-sunken) 25%, var(--color-border) 37%, var(--color-surface-sunken) 63%)',
        backgroundSize: '400% 100%',
        animation: 'arvash-shimmer 1.4s ease infinite',
      }}
    />
  );
}

export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} style={{ flex: 1 }}>
          <Skeleton />
        </div>
      ))}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <Skeleton width={80} height={12} />
      <Skeleton width={100} height={28} />
      <Skeleton width={60} height={12} />
    </div>
  );
}
