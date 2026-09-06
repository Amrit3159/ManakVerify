import React from 'react';

// ============================================================
// Types
// ============================================================

export interface TableColumn<T> {
  key:       string;
  header:    string;
  render?:   (row: T, index: number) => React.ReactNode;
  width?:    string;
  align?:    'left' | 'center' | 'right';
  sortable?: boolean;
}

interface TableProps<T> {
  columns:     TableColumn<T>[];
  data:        T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  isLoading?:  boolean;
  onRowClick?: (row: T) => void;
  className?:  string;
}

// ============================================================
// Component
// ============================================================

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data to display.',
  isLoading    = false,
  onRowClick,
  className    = '',
}: TableProps<T>) {
  const alignClass = (align?: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right')  return 'text-right';
    return 'text-left';
  };

  return (
    <div className={['overflow-x-auto rounded-xl border border-gray-200', className].join(' ')}>
      <table className="data-table">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={alignClass(col.align)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map(col => (
                  <td key={col.key} className={alignClass(col.align)}>
                    {col.render
                      ? col.render(row, idx)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
