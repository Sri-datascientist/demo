import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Tractor,
  Users,
  Wallet,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  '/admin': BarChart3,
  '/admin/orders': Package,
  '/admin/inventory': ShoppingBag,
  '/admin/farmers': Tractor,
  '/admin/users': Users,
  '/admin/crop-listings': ClipboardList,
  '/admin/submissions': FileText,
  '/admin/payments': CreditCard,
  '/admin/advisory': Leaf,
  '/admin/settings': Settings,
  '/farmer': LayoutDashboard,
  '/farmer/kyc': FileText,
  '/farmer/profile': Users,
  '/farmer/land': MapPin,
  '/farmer/soil-health': Sprout,
  '/farmer/crops': Leaf,
  '/farmer/advisory': BarChart3,
  '/farmer/selling': ShoppingBag,
  '/farmer/payments': CreditCard,
  '/farmer/support': HelpCircle,
  '/hub': LayoutDashboard,
  '/hub/collector': ClipboardList,
  '/dashboard': LayoutDashboard,
  '/dashboard/orders': Package,
  '/dashboard/profile': Users,
  '/dashboard/addresses': MapPin,
  '/dashboard/wallet': Wallet,
  '/dashboard/track-order': Package,
  '/cart': ShoppingCart,
};

export function getDashboardNavIcon(path: string): LucideIcon {
  return ICON_MAP[path] ?? LayoutDashboard;
}

export function getDashboardRoleLabel(pathname: string): string {
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/farmer')) return 'Farmer';
  if (pathname.startsWith('/hub')) return 'District Hub';
  return 'Customer';
}
