import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Box,
  ClipboardCheck,
  Package,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { AdminAnalyticsCharts } from '../../components/admin/AdminAnalyticsCharts';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { InfoBox } from '../../components/dashboard/InfoBox';
import { QuickAction } from '../../components/dashboard/QuickAction';
import { StatCard, StatSection } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { AnalyticsSummary, Order, Product } from '../../types';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const inhouseProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          !p.farmer_profile_id &&
          (!p.farmer_name ||
            p.farmer_name.toLowerCase() === 'oyedesi' ||
            p.farmer_name.toLowerCase() === 'oyedesi mill')
      ),
    [products]
  );

  const farmerProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.farmer_profile_id ||
          (p.farmer_name &&
            p.farmer_name.toLowerCase() !== 'oyedesi' &&
            p.farmer_name.toLowerCase() !== 'oyedesi mill')
      ),
    [products]
  );

  const lowStockInhouseCount = useMemo(
    () => inhouseProducts.filter((p) => p.stock_quantity <= 10).length,
    [inhouseProducts]
  );

  const lowStockFarmerCount = useMemo(
    () => farmerProducts.filter((p) => p.stock_quantity <= 10).length,
    [farmerProducts]
  );

  useEffect(() => {
    api.adminAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
    api.adminOrders().then((o) => setRecentOrders(o.slice(0, 5))).catch(() => setRecentOrders([]));
    api.adminInventory().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (window.location.hash === '#analytics') {
      setTimeout(() => {
        document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [analytics]);

  const needsAttention =
    analytics
      ? analytics.low_stock_count +
        analytics.pending_crop_listings +
        analytics.pending_soil_reports +
        analytics.open_support_tickets
      : 0;

  return (
    <DashboardLayout
      title="Admin overview"
      subtitle="Platform analytics, operations, and marketplace health."
      navItems={adminNav}
    >
      {analytics && (
        <>
          <StatSection title="Platform metrics" description="Core marketplace numbers.">
            <StatCard
              label="Total revenue"
              value={`₹${analytics.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              hint="Gross order value"
              icon={Banknote}
              to="/admin/revenue"
            />
            <StatCard
              label="Orders"
              value={analytics.total_orders}
              hint="All orders"
              icon={Package}
              to="/admin/orders"
            />
            <StatCard
              label="Customers"
              value={analytics.total_customers}
              hint="Registered buyers"
              icon={Users}
              to="/admin/users"
            />
            <StatCard
              label="Farmers"
              value={analytics.total_farmers}
              hint="On platform"
              icon={Users}
              to="/admin/farmers"
            />
          </StatSection>

          <StatSection title="Inventory & submissions" description="Items that may need your action.">
            <StatCard
              label="In-House Products"
              value={inhouseProducts.length}
              hint="OyeDesi catalog"
              icon={Box}
              to="/admin/inhouse-inventory"
            />
            <StatCard
              label="Farmer Products"
              value={farmerProducts.length}
              hint="Sourced catalog"
              icon={Box}
              to="/admin/farmer-inventory"
            />
            <StatCard
              label="In-House Low Stock"
              value={lowStockInhouseCount}
              hint="≤ 10 units"
              icon={AlertTriangle}
              to="/admin/inhouse-inventory?lowStock=1"
            />
            <StatCard
              label="Farmer Low Stock"
              value={lowStockFarmerCount}
              hint="≤ 10 units"
              icon={AlertTriangle}
              to="/admin/farmer-inventory?lowStock=1"
            />
            <StatCard
              label="Pending listings"
              value={analytics.pending_crop_listings}
              hint="Crop sales queue"
              icon={ClipboardCheck}
              to="/admin/crop-listings?pending=1"
            />
            <StatCard
              label="Open tickets"
              value={analytics.open_support_tickets}
              hint="Support queue"
              icon={AlertTriangle}
              to="/admin/submissions?tab=support"
            />
          </StatSection>

          {needsAttention > 0 && (
            <InfoBox title="Action queue" variant="warning" icon={AlertTriangle}>
              {analytics.pending_soil_reports} soil report(s) pending review,{' '}
              {analytics.open_support_tickets} open support ticket(s), and{' '}
              {analytics.pending_crop_listings} crop listing(s) awaiting processing. Visit{' '}
              <Link to="/admin/submissions" className="font-semibold text-[#2D5A27] hover:underline">
                Submissions
              </Link>{' '}
              or{' '}
              <Link to="/admin/crop-listings" className="font-semibold text-[#2D5A27] hover:underline">
                Crop listings
              </Link>{' '}
              to resolve.
            </InfoBox>
          )}
        </>
      )}

      <DashboardPanel title="Quick actions" description="Common admin workflows." className="mb-6 mt-6">
        <div className="flex flex-wrap gap-2">
          <QuickAction to="/admin/orders" label="Orders" icon={Package} variant="primary" />
          <QuickAction to="/admin/inhouse-inventory" label="In-House Products" icon={Box} />
          <QuickAction to="/admin/farmer-inventory" label="Farmer Products" icon={Box} />
          <QuickAction to="/admin/farmers" label="Farmers" icon={Users} />
          <QuickAction to="/admin/users" label="Customers" icon={Users} />
          <QuickAction to="/admin/crop-listings" label="Listings" icon={ClipboardCheck} />
          <QuickAction to="/admin/submissions" label="Submissions" icon={ClipboardCheck} />
        </div>
      </DashboardPanel>

      <section id="analytics" className="mb-6">
        <DashboardPanel title="Analytics" description="Revenue and order distribution." noPadding>
          {analytics ? (
            <div className="p-5">
              <AdminAnalyticsCharts data={analytics} />
            </div>
          ) : (
            <EmptyState message="Loading analytics…" />
          )}
        </DashboardPanel>
      </section>

      <DashboardPanel
        title="Recent orders"
        description="Latest transactions on the marketplace."
        action={
          recentOrders.length > 0 ? (
            <Link to="/admin/orders" className="text-sm font-semibold text-[#2D5A27] hover:underline">
              View all
            </Link>
          ) : undefined
        }
      >
        {recentOrders.length === 0 ? (
          <EmptyState message="No orders yet." />
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="dashboard-order-card">
                <div>
                  <p className="font-semibold text-[#1a3320]">Order #{order.id}</p>
                  <p className="text-xs font-mono text-[#6b7c74]">{order.tracking_number}</p>
                  <div className="mt-2">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <p className="font-bold text-lg text-[#2D5A27]">₹{order.total_amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </DashboardLayout>
  );
}
