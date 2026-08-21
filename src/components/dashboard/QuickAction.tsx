import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function QuickAction({
  to,
  label,
  icon: Icon,
  variant = 'secondary',
}: {
  to: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}) {
  const base =
    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D5A27]';
  const styles =
    variant === 'primary'
      ? 'bg-[#2D5A27] text-white hover:bg-[#244a20]'
      : 'border border-[#e2e8e4] bg-white text-[#1a3320] hover:bg-[#f4f7f5] hover:border-[#c5d4cb]';

  return (
    <Link to={to} className={`${base} ${styles}`}>
      {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
      {label}
    </Link>
  );
}
