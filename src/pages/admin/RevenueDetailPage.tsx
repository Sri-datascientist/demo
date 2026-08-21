import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Package, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { AdminAnalyticsCharts } from '../../components/admin/AdminAnalyticsCharts';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { StatCard, StatSection } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { AnalyticsSummary, Order, Payment } from '../../types';

export default function RevenueDetailPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    api.adminAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
    api.adminOrders().then(setOrders).catch(() => setOrders([]));
    api.adminPayments().then(setPayments).catch(() => setPayments([]));
  }, []);

  const avgOrderValue = useMemo(() => {
    if (!analytics || analytics.total_orders === 0) return 0;
    return analytics.total_revenue / analytics.total_orders;
  }, [analytics]);

  const latestMonthRevenue = useMemo(() => {
    if (!analytics?.revenue_by_month.length) return 0;
    return analytics.revenue_by_month[analytics.revenue_by_month.length - 1].revenue;
  }, [analytics]);

  const completedPayments = payments.filter((p) => p.status === 'completed');

  return (
    <DashboardLayout
      title="Revenue review"
      subtitle="Detailed breakdown of marketplace revenue, orders, and payment activity."
      navItems={adminNav}
    >
      {analytics && (
        <StatSection title="Revenue summary" description="Key financial metrics across the platform.">
          <StatCard
            label="Total revenue"
            value={`₹${analytics.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            hint="Gross order value"
            icon={Banknote}
          />
          <StatCard
            label="Total orders"
            value={analytics.total_orders}
            hint="All-time orders"
            icon={Package}
            to="/admin/orders"
          />
          <StatCard
            label="Avg order value"
            value={`₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            hint="Revenue ÷ orders"
            icon={TrendingUp}
          />
          <StatCard
            label="Latest month"
            value={`₹${latestMonthRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            hint="Most recent month in chart"
            icon={TrendingUp}
          />
        </StatSection>
      )}

      <DashboardPanel title="Revenue analytics" description="Monthly trends and order status distribution." className="mb-6">
        {analytics ? (
          <AdminAnalyticsCharts data={analytics} />
        ) : (
          <EmptyState message="Loading revenue analytics…" />
        )}
      </DashboardPanel>

      <DashboardPanel
        title="Order revenue ledger"
        description="Every order contributing to gross marketplace revenue."
        action={
          orders.length > 0 ? (
            <Link to="/admin/orders" className="text-sm font-semibold text-[#2D5A27] hover:underline">
              Manage orders
            </Link>
          ) : undefined
        }
        className="mb-6"
      >
        {orders.length === 0 ? (
          <EmptyState message="No orders recorded yet." />
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="dashboard-order-card">
                <div>
                  <p className="font-semibold text-[#1a3320]">Order #{order.id}</p>
                  <p className="text-xs font-mono text-[#6b7c74]">{order.tracking_number}</p>
                  <p className="text-xs text-[#6b7c74] mt-1">
                    {new Date(order.created_at).toLocaleString('en-IN')}
                  </p>
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

      <DashboardPanel
        title="Payment records"
        description="Farmer settlements and platform payment history linked to revenue operations."
        action={
          <Link to="/admin/payments" className="text-sm font-semibold text-[#2D5A27] hover:underline">
            All payments
          </Link>
        }
      >
        {payments.length === 0 ? (
          <EmptyState message="No payment records yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="dashboard-table w-full text-left">
              <thead>
                <tr>
                  <th className="dashboard-table-th">Reference</th>
                  <th className="dashboard-table-th">Amount</th>
                  <th className="dashboard-table-th">Type</th>
                  <th className="dashboard-table-th">Status</th>
                  <th className="dashboard-table-th">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((p) => (
                  <tr key={p.id} className="dashboard-table-row">
                    <td className="dashboard-table-td font-medium">{p.reference || `#${p.id}`}</td>
                    <td className="dashboard-table-td font-bold text-[#2D5A27]">₹{p.amount.toFixed(2)}</td>
                    <td className="dashboard-table-td capitalize">{p.payment_type}</td>
                    <td className="dashboard-table-td">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="dashboard-table-td text-sm text-[#273C46]/70">
                      {new Date(p.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {completedPayments.length > 0 && (
              <p className="mt-4 text-sm text-[#5a6b63]">
                {completedPayments.length} completed payment(s) totaling ₹
                {completedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}
      </DashboardPanel>
    </DashboardLayout>
  );
}
