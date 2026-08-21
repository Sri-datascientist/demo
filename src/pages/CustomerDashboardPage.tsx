import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MapPin, Package, ShoppingBag, Wallet } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import { InfoBox } from '../components/dashboard/InfoBox';
import { QuickAction } from '../components/dashboard/QuickAction';
import { StatCard, StatSection } from '../components/dashboard/StatCard';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { EmptyState } from '../components/dashboard/EmptyState';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { customerNav } from '../lib/navItems';
import type { Order } from '../types';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.myOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const activeCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <DashboardLayout
      title="Your dashboard"
      subtitle="Orders, wallet, addresses, and tracking — all in one place."
      navItems={customerNav}
    >
      <WelcomeBanner name={user?.full_name || 'Customer'} detail={user?.email} />

      <StatSection title="Order overview" description="Summary of your marketplace activity.">
        <StatCard label="Total orders" value={orders.length} hint="All time" icon={Package} />
        <StatCard label="Active orders" value={activeCount} hint="In progress" icon={Activity} />
        <StatCard label="Delivered" value={deliveredCount} hint="Completed" icon={Package} />
        <StatCard
          label="Total spent"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          hint="On Oyedesi"
          icon={Wallet}
        />
      </StatSection>

      <div className="flex flex-wrap gap-2 mb-6">
        <QuickAction to="/products" label="Shop produce" icon={ShoppingBag} variant="primary" />
        <QuickAction to="/dashboard/orders" label="My orders" icon={Package} />
        <QuickAction to="/dashboard/track-order" label="Track order" icon={Activity} />
        <QuickAction to="/dashboard/wallet" label="Wallet" icon={Wallet} />
        <QuickAction to="/dashboard/addresses" label="Addresses" icon={MapPin} />
        <QuickAction to="/cart" label="View cart" icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardPanel
          title="Recent orders"
          description="Your latest purchases."
          className="lg:col-span-2"
          action={
            orders.length > 0 ? (
              <Link to="/dashboard/orders" className="text-sm font-semibold text-[#2D5A27] hover:underline">
                View all
              </Link>
            ) : undefined
          }
        >
          {orders.length === 0 ? (
            <EmptyState
              message="No orders yet."
              action={
                <Link to="/products" className="dashboard-btn-primary">
                  Browse products
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="dashboard-order-card">
                  <div>
                    <p className="font-semibold text-[#1a3320]">Order #{order.id}</p>
                    <p className="text-xs font-mono text-[#6b7c74] mt-0.5">{order.tracking_number}</p>
                    <div className="mt-2">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#2D5A27]">₹{order.total_amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel title="Account shortcuts" description="Manage your profile and delivery details.">
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/dashboard/profile" className="text-[#2D5A27] font-medium hover:underline">
                Edit profile & phone
              </Link>
            </li>
            <li>
              <Link to="/dashboard/addresses" className="text-[#2D5A27] font-medium hover:underline">
                Saved addresses
              </Link>
            </li>
            <li>
              <Link to="/dashboard/wallet" className="text-[#2D5A27] font-medium hover:underline">
                Wallet & loyalty points
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[#2D5A27] font-medium hover:underline">
                Contact support
              </Link>
            </li>
          </ul>
        </DashboardPanel>
      </div>

      <InfoBox title="Fresh from farm to doorstep" variant="tip">
        Oyedesi connects you directly with verified farmers. Orders are packed after quality checks at
        district hubs — use Track Order for live status and your wallet for loyalty rewards on repeat
        purchases.
      </InfoBox>
    </DashboardLayout>
  );
}
