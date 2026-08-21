import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { api } from '../../lib/api';
import type { Order } from '../../types';
import { adminNav } from '../../lib/navItems';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Dispatched' },
  { key: 'out_for_delivery', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
];

const STATUS_SELECT_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.adminOrders();
      setOrders(list);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await api.adminUpdateOrder(id, status);
      await load();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtering Logic
  const filteredOrders = orders.filter((order) => {
    // 1. Filter by Tab
    if (activeTab !== 'all' && order.status !== activeTab) {
      return false;
    }
    
    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const orderIdStr = String(order.id);
      const tracking = order.tracking_number.toLowerCase();
      const userName = (order.user_name || '').toLowerCase();
      const userEmail = (order.user_email || '').toLowerCase();
      
      return (
        orderIdStr === q ||
        tracking.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q)
      );
    }
    
    return true;
  });

  return (
    <DashboardLayout
      title="Store Orders Manager"
      subtitle="Fulfill shipments, update dispatch stages, and manage customer order histories."
      navItems={adminNav}
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer Name, Email, Order ID, or Tracking ID..."
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
          />
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Showing {filteredOrders.length} of {orders.length} order(s)
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === 'all' 
            ? orders.length 
            : orders.filter(o => o.status === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 -mb-[2px] transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'border-[#2D5A27] text-[#2D5A27]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                isActive ? 'bg-[#2D5A27] text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5A27]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-white">
          <p className="text-neutral-500 text-sm">No orders found matching the filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-xs hover:shadow-sm transition-all"
            >
              {/* Card Title Header */}
              <div className="bg-[#f8faf7] border-b border-neutral-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-800 text-sm">Order #{order.id}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-neutral-400 font-mono">TRACKING: {order.tracking_number}</span>
                </div>
                <div className="text-neutral-500">
                  Placed on:{' '}
                  <span className="font-semibold text-neutral-800">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Card Main Panels */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-neutral-100">
                {/* Panel 1: Customer & Address */}
                <div className="lg:col-span-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">Customer Details</h4>
                  <div className="text-xs text-neutral-600 space-y-1">
                    <p><strong>Name:</strong> {order.user_name}</p>
                    <p><strong>Email:</strong> {order.user_email}</p>
                    <p><strong>Phone:</strong> {order.user_phone || 'Not provided'}</p>
                  </div>
                  <div className="pt-2">
                    <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Shipping Address</h5>
                    <p className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/40 leading-relaxed">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>

                {/* Panel 2: Fulfillment Allocations */}
                <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-x border-neutral-100 pt-4 lg:pt-0 lg:px-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">Fulfillment Logistics</h4>
                    <Link
                      to="/admin/delivery-partners"
                      className="text-[10px] text-[#2D5A27] hover:underline font-bold"
                    >
                      Manage Assignments →
                    </Link>
                  </div>
                  <div className="text-xs text-neutral-600 space-y-2.5">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Warehouse Facility</p>
                      <p className="font-semibold text-neutral-700 mt-0.5">
                        {order.warehouse ? order.warehouse.name : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Courier Partner</p>
                      <p className="font-semibold text-neutral-700 mt-0.5">
                        {order.delivery_partner 
                          ? `${order.delivery_partner.name} (${order.delivery_partner.vehicle_number})` 
                          : 'Unassigned'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dispatch OTP</p>
                        <p className="font-mono mt-0.5 text-xs">
                          {order.dispatch_otp || 'N/A'} {order.dispatch_verified ? '✅' : '⏳'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Delivery OTP</p>
                        <p className="font-mono mt-0.5 text-xs">
                          {order.delivery_otp || 'N/A'} {order.delivery_verified ? '✅' : '⏳'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Status Quick Control */}
                <div className="lg:col-span-3 space-y-3 pt-4 lg:pt-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-2">Order Action</h4>
                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white capitalize focus:outline-none focus:ring-1 focus:ring-[#2D5A27] disabled:opacity-60"
                    >
                      {STATUS_SELECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-right border-t pt-4 border-neutral-100 lg:border-0 lg:pt-0">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Order Value</p>
                    <p className="text-2xl font-extrabold text-[#2D5A27] mt-0.5">₹{order.total_amount.toFixed(2)}</p>
                    <p className="text-[10px] text-neutral-400 mt-1 capitalize">Payment: <span className="font-semibold text-neutral-700">{order.payment_method}</span></p>
                  </div>
                </div>
              </div>

              {/* Items List Detail Drawer */}
              <div className="bg-[#fcfdfb] px-6 py-4 border-t border-neutral-100">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Order Items</h5>
                <div className="divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                          alt={item.product_name}
                          className="w-10 h-10 rounded-lg object-cover border"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-neutral-800">{item.product_name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Product ID: #{item.product_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-700">
                          ₹{item.price_at_purchase.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="font-bold text-neutral-800 mt-0.5">
                          ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
