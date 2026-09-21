import { ReactNode, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonRow } from './Skeleton';
import { EmptyState, ErrorState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records match your current filters.',
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    cursor: col.sortValue ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortValue && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length}>
                    <SkeletonRow columns={columns.length} />
                  </td>
                </tr>
              ))}
            {!loading && !error && pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.background = 'var(--color-surface-sunken)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 14 }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && error && <ErrorState onRetry={onRetry} />}
      {!loading && !error && rows.length === 0 && <EmptyState title={emptyTitle} message={emptyMessage} />}

      {!loading && !error && rows.length > 0 && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span className="caption">
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
              style={iconButtonStyle(page === 0)}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Next page"
              style={iconButtonStyle(page === totalPages - 1)}
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function iconButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
