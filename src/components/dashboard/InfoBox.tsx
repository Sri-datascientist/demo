import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

type InfoVariant = 'default' | 'tip' | 'success' | 'warning';

const VARIANTS: Record<InfoVariant, string> = {
  default: 'dashboard-info-box-default',
  tip: 'dashboard-info-box-tip',
  success: 'dashboard-info-box-success',
  warning: 'dashboard-info-box-warning',
};

export function InfoBox({
  title,
  children,
  icon: Icon = Info,
  variant = 'default',
  className = '',
}: {
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  variant?: InfoVariant;
  className?: string;
}) {
  return (
    <div className={`dashboard-info-box ${VARIANTS[variant]} ${className}`}>
      <div className="flex gap-3">
        <div className="dashboard-info-box-icon">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          {title && <p className="dashboard-info-box-title">{title}</p>}
          <div className="dashboard-info-box-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ChecklistItem({
  done,
  label,
  href,
}: {
  done?: boolean;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <span className={`dashboard-check ${done ? 'dashboard-check-done' : ''}`} aria-hidden>
        {done ? '✓' : ''}
      </span>
      <span className={done ? 'text-[#273C46]/70' : 'text-[#1a3320] font-medium'}>{label}</span>
    </>
  );

  if (href && !done) {
    return (
      <Link to={href} className="dashboard-checklist-item dashboard-checklist-item-link">
        {content}
      </Link>
    );
  }

  return <div className="dashboard-checklist-item">{content}</div>;
}
