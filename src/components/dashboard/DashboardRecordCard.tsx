import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

export type RecordMetaItem = {
  label: string;
  value: string;
  icon?: LucideIcon;
};

export function DashboardRecordCard({
  title,
  subtitle,
  meta = [],
  actions,
  children,
  highlight = false,
  icon: Icon,
}: {
  key?: any;
  title: string;
  subtitle?: string;
  meta?: RecordMetaItem[];
  actions?: ReactNode;
  children?: ReactNode;
  highlight?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <article
      className={`dashboard-record-card ${highlight ? 'dashboard-record-card-highlight' : ''}`}
    >
      <div className="dashboard-record-main">
        {Icon && (
          <div className="dashboard-record-icon">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
        )}
        <div className="dashboard-record-content min-w-0 flex-1">
          <div className="dashboard-record-header">
            <div className="min-w-0">
              <h3 className="dashboard-record-title">{title}</h3>
              {subtitle && <p className="dashboard-record-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="dashboard-record-actions">{actions}</div>}
          </div>

          {meta.length > 0 && (
            <dl className="dashboard-record-meta">
              {meta.map((item) => (
                <div key={item.label} className="dashboard-record-meta-item">
                  {item.icon && (
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-[#689F38]" strokeWidth={2} />
                  )}
                  <dt className="dashboard-record-meta-label">{item.label}</dt>
                  <dd className="dashboard-record-meta-value capitalize">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {children && <div className="dashboard-record-extra">{children}</div>}
        </div>
      </div>
    </article>
  );
}

export function RecordDeleteButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="dashboard-record-action dashboard-record-action-danger"
    >
      <Trash2 className="h-4 w-4" strokeWidth={2} />
      <span>Delete</span>
    </button>
  );
}

export function DashboardRecordList({
  children,
  emptyMessage,
}: {
  children: ReactNode;
  emptyMessage?: string;
}) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  if (isEmpty && emptyMessage) {
    return (
      <div className="dashboard-record-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <div className="dashboard-record-list">{children}</div>;
}
