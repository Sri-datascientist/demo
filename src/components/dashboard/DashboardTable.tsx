import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export function DashboardTable({
  columns,
  children,
  isEmpty = false,
  emptyMessage = 'No data to display.',
}: {
  columns: string[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}) {
  if (isEmpty) {
    return (
      <div className="dashboard-panel">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="dashboard-table-wrap overflow-x-auto">
      <table className="dashboard-table w-full text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="dashboard-table-th">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function DashboardTableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      className={`dashboard-table-row ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function DashboardTableCell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`dashboard-table-td ${className}`}>{children}</td>;
}
