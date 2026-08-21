import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function WelcomeBanner({
  name,
  detail,
  badges,
}: {
  name: string;
  detail?: string;
  badges?: ReactNode;
}) {
  return (
    <div className="dashboard-welcome-banner mb-6">
      <div className="min-w-0">
        <p className="dashboard-welcome-greeting">Welcome back</p>
        <h2 className="dashboard-welcome-name">{name}</h2>
        {detail && <p className="dashboard-welcome-detail">{detail}</p>}
        {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
      </div>
    </div>
  );
}
