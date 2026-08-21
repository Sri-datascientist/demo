import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardNavIcon, getDashboardRoleLabel } from '../lib/dashboardNavIcons';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  path: string;
}

export function DashboardLayout({
  title,
  subtitle,
  navItems,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const roleLabel = getDashboardRoleLabel(location.pathname);

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/farmer' || path === '/admin' || path === '/hub') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="dashboard-shell min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="dashboard-sidebar lg:w-[260px] shrink-0">
          <div className="dashboard-sidebar-inner">
            <div className="mb-6 px-1">
              <Logo size="sm" linkToHome className="h-8 mb-4" />
              <span className="dashboard-role-badge">{roleLabel}</span>
              {user && (
                <p className="mt-3 text-sm font-semibold text-[#1a3320] truncate">{user.full_name}</p>
              )}
            </div>

            <nav className="dashboard-nav flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
              {navItems.map((item) => {
                const Icon = getDashboardNavIcon(item.path);
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`dashboard-nav-item ${active ? 'dashboard-nav-item-active' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-60 lg:hidden" />}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => logout()}
              className="dashboard-nav-item mt-4 w-full text-left text-[#273C46]/70 hover:text-rose-700 hover:bg-rose-50/80"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="dashboard-main flex-1 min-w-0">
          <header className="dashboard-header flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="dashboard-title">{title}</h1>
              {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
            </div>
            <p className="text-xs text-[#6b7c74] shrink-0">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </header>
          <div className="dashboard-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
