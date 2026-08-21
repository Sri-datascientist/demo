import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  to?: string;
}) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="dashboard-stat-label">{label}</p>
        <p className="dashboard-stat-value capitalize">{value}</p>
        {hint && <p className="dashboard-stat-hint">{hint}</p>}
        {to && <p className="dashboard-stat-link-hint">View details →</p>}
      </div>
      {Icon && (
        <div className="dashboard-stat-icon-wrap">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="dashboard-stat-card dashboard-stat-card-link block no-underline text-inherit">
        {content}
      </Link>
    );
  }

  return <div className="dashboard-stat-card">{content}</div>;
}

export function StatSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h3 className="dashboard-section-title">{title}</h3>
        {description && <p className="dashboard-section-desc">{description}</p>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{children}</div>
    </section>
  );
}
