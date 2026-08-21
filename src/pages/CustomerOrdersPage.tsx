import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/dashboard/EmptyState';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { api } from '../lib/api';
import { customerNav } from '../lib/navItems';
import { useCart } from '../contexts/CartContext';
import type { Order } from '../types';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { addItem, refresh } = useCart();
  const [actionMessages, setActionMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    api.myOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const handleBuyAgain = async (productId: number, itemIdForMessage: number) => {
    setActionMessages(prev => ({ ...prev, [itemIdForMessage]: 'Adding...' }));
    try {
      await addItem(productId);
      await refresh();
      setActionMessages(prev => ({ ...prev, [itemIdForMessage]: 'Added to Cart!' }));
      setTimeout(() => {
        setActionMessages(prev => {
          const next = { ...prev };
          delete next[itemIdForMessage];
          return next;
        });
      }, 2000);
    } catch (err) {
      setActionMessages(prev => ({ ...prev, [itemIdForMessage]: 'Failed to add.' }));
    }
  };

  return (
    <DashboardLayout
      title="Your Purchases"
      subtitle="Track active shipments, view invoice records, and buy favorite farm products again."
      navItems={customerNav}
    >
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <EmptyState message="You haven't placed any orders yet." />
          <Link
            to="/products"
            className="inline-flex rounded-full bg-[#2D5A27] text-white px-6 py-3 font-semibold text-sm mt-4 hover:bg-[#2D5A27]/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Card Header */}
              <div className="bg-[#f8faf7] border-b border-neutral-200/60 p-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-500">
                <div>
                  <p className="uppercase font-bold tracking-wider text-[10px] text-neutral-400">Order Placed</p>
                  <p className="font-semibold text-neutral-700 mt-1">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="uppercase font-bold tracking-wider text-[10px] text-neutral-400">Total Price</p>
                  <p className="font-bold text-neutral-800 mt-1 text-sm">₹{order.total_amount.toFixed(2)}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="uppercase font-bold tracking-wider text-[10px] text-neutral-400">Ship To</p>
                  <p className="font-semibold text-neutral-700 mt-1 truncate max-w-[150px]" title={order.shipping_address}>
                    {order.shipping_address}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end justify-center">
                  <p className="uppercase font-bold tracking-wider text-[10px] text-neutral-400">Order ID: #{order.id}</p>
                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate max-w-[150px]">{order.tracking_number}</p>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-5 sm:px-6 space-y-5">
                {/* Status Bar */}
                <div className="flex justify-between items-center border-b pb-4 border-neutral-100 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-800">Status:</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <Link
                    to={`/dashboard/track-order?tracking=${order.tracking_number}`}
                    className="inline-flex items-center rounded-full border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 px-4 py-1.5 text-xs font-semibold transition-colors"
                  >
                    Track Package
                  </Link>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                          alt={item.product_name}
                          className="w-16 h-16 rounded-xl object-cover border"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-[#2D5A27] hover:underline">
                            <Link to={`/products/${item.product_id}`}>{item.product_name}</Link>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-1">Quantity: <span className="font-semibold text-neutral-700">{item.quantity}</span></p>
                          <p className="text-xs text-neutral-400">Unit Price: <span className="font-semibold text-neutral-700">₹{item.price_at_purchase}</span></p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-0 pt-2 sm:pt-0">
                        <p className="font-bold text-neutral-800 text-base">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          {actionMessages[item.product_id] && (
                            <span className="text-[10px] font-bold text-[#2D5A27] animate-pulse">
                              {actionMessages[item.product_id]}
                            </span>
                          )}
                          <button
                            onClick={() => handleBuyAgain(item.product_id, item.product_id)}
                            className="rounded-lg bg-neutral-100 hover:bg-[#2D5A27] hover:text-white px-3 py-1 text-xs font-semibold text-neutral-700 transition-colors"
                          >
                            Buy Again
                          </button>
                        </div>
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
