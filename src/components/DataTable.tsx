import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  rows,
  emptyTitle = 'No records yet',
  emptyDescription = 'This table will populate once backend data is available.',
}: DataTableProps<T>) {
  return (
    <div className="table-shell">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <strong className="text-sm font-semibold text-slate-900">{emptyTitle}</strong>
                  <span className="max-w-md text-sm text-slate-500">{emptyDescription}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
