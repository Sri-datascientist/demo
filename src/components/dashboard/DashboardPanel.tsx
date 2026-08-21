import type { ReactNode } from 'react';

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = '',
  noPadding = false,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      {(title || description || action) && (
        <header className="dashboard-panel-header">
          <div className="min-w-0">
            {title && <h2 className="dashboard-panel-title">{title}</h2>}
            {description && <p className="dashboard-panel-desc">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={noPadding ? bodyClassName : `dashboard-panel-body ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
