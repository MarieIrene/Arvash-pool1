import { ReactNode, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from './Skeleton';
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
  const gridTemplateColumns = columns.map((column) => column.width ?? 'minmax(0, 1fr)').join(' ');

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
      <div className="data-table" role="table" aria-rowcount={pageRows.length + 1}>
        <div
          className="data-table-header"
          role="row"
          style={{ gridTemplateColumns }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              role="columnheader"
              aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              onClick={() => col.sortValue && toggleSort(col.key)}
              onKeyDown={(event) => {
                if (col.sortValue && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  toggleSort(col.key);
                }
              }}
              tabIndex={col.sortValue ? 0 : undefined}
              className={`data-table-heading${col.sortValue ? ' is-sortable' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {col.header}
                {col.sortValue && sortKey === col.key && (
                  sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                )}
              </span>
            </div>
          ))}
        </div>
        <div role="rowgroup">
          {loading && Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="data-table-row data-table-loading-row"
              role="row"
              style={{ gridTemplateColumns }}
            >
              {columns.map((col) => (
                <div key={col.key} className="data-table-cell" role="cell" aria-label={col.header}>
                  <Skeleton />
                </div>
              ))}
            </div>
          ))}
          {!loading && !error && pageRows.map((row) => (
            <div
              key={rowKey(row)}
              role="row"
              className={`data-table-row${onRowClick ? ' is-clickable' : ''}`}
              style={{ gridTemplateColumns }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <div key={col.key} className="data-table-cell" role="cell" aria-label={col.header}>
                  <span className="data-table-label" aria-hidden="true">{col.header}</span>
                  <div className="data-table-cell-content">{col.render(row)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
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
