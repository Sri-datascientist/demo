import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { customerNav } from '../lib/navItems';
import { api } from '../lib/api';
import type { Order } from '../types';

const DELIVERY_STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been approved by the farm partner' },
  { key: 'processing', label: 'Processing & Preparing', description: 'Items are being packed at our facility' },
  { key: 'shipped', label: 'Dispatched', description: 'Parcel has been shipped and is in transit' },
  { key: 'out_for_delivery', label: 'On the Way', description: 'Delivery agent has picked up the order' },
  { key: 'delivered', label: 'Delivered', description: 'Order reached your delivery address' }
];

const STAGE_KEYS = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTrackingPage() {
  const [params, setSearchParams] = useSearchParams();
  const initialTracking = params.get('tracking') || '';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await api.myOrders();
      setOrders(list);
      
      if (list.length > 0) {
        // Auto-select based on query param, otherwise pick the first one (most recent)
        const match = list.find(o => o.tracking_number === initialTracking || String(o.id) === initialTracking);
        setSelectedOrder(match || list[0]);
      }
    } catch (err) {
      setError('Could not retrieve orders. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSearchParams({ tracking: order.tracking_number });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = orders.find(
      o => o.tracking_number.toLowerCase() === searchQuery.trim().toLowerCase() || String(o.id) === searchQuery.trim()
    );
    if (match) {
      setSelectedOrder(match);
      setSearchParams({ tracking: match.tracking_number });
      setError('');
    } else {
      setError(`No local order found matching "${searchQuery}"`);
    }
  };

  // Determine active step index
  const getStepIndex = (status: string) => {
    if (status === 'pending') return 0; // pending acts as stage 1 (Order Placed)
    return STAGE_KEYS.indexOf(status);
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : -1;

  return (
    <DashboardLayout title="Live Shipment Tracking" subtitle="Track your fresh products straight from farm to doorstep." navItems={customerNav}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5A27]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-200 bg-white">
          <p className="page-body mb-6 text-neutral-500">You don't have any orders to track yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Orders list */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or Tracking #"
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#2D5A27] text-white px-4 text-sm font-semibold hover:bg-[#2D5A27]/90 transition-colors"
              >
                Find
              </button>
            </form>

            {error && <p className="text-xs text-red-600 font-medium px-1">{error}</p>}

            <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-sm max-h-[500px] overflow-y-auto">
              <div className="p-4 border-b bg-[#f8faf7]">
                <h3 className="font-semibold text-[#2D5A27] text-sm">Your Orders</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {orders.map((o) => {
                  const isSelected = selectedOrder?.id === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => handleSelectOrder(o)}
                      className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors flex justify-between items-center ${
                        isSelected ? 'bg-[#689F38]/5 border-l-4 border-[#2D5A27]' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-neutral-800">Order #{o.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-mono truncate">{o.tracking_number}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(o.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-[#2D5A27]">₹{o.total_amount.toFixed(2)}</p>
                        <p className="text-[10px] text-neutral-400">{o.items.length} item(s)</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Active shipment tracking */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-6">
                {/* Header info */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-5 border-b border-neutral-100">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D5A27]">Order Tracking</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-mono">TRACKING ID: {selectedOrder.tracking_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Total Bill</p>
                    <p className="text-lg font-extrabold text-neutral-800">₹{selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Cancelled view */}
                {selectedOrder.status === 'cancelled' ? (
                  <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-6 text-center">
                    <span className="text-4xl">❌</span>
                    <h3 className="text-lg font-bold text-neutral-800 mt-2">Order Cancelled</h3>
                    <p className="text-sm text-neutral-500 mt-1">This order has been cancelled and cannot be tracked.</p>
                  </div>
                ) : (
                  /* Stepper Tracker */
                  <div className="py-2">
                    <div className="relative pl-8 space-y-8">
                      {/* Live connector line */}
                      <div className="absolute left-[15px] top-2 bottom-2 w-1.5 bg-neutral-100 rounded-full">
                        <div
                          className="w-full bg-[#2D5A27] rounded-full transition-all duration-700"
                          style={{
                            height: `${(Math.max(0, currentStep) / (DELIVERY_STAGES.length - 1)) * 100}%`
                          }}
                        />
                      </div>

                      {DELIVERY_STAGES.map((stage, idx) => {
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;
                        const isPending = idx > currentStep;

                        return (
                          <div key={stage.key} className="relative flex gap-4 items-start group">
                            {/* Circle Node */}
                            <div
                              className={`absolute -left-[25px] w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-[#2D5A27] border-[#e2ebd5] text-white'
                                  : isActive
                                  ? 'bg-white border-[#2D5A27] text-[#2D5A27] scale-110 shadow-md ring-4 ring-[#2D5A27]/10'
                                  : 'bg-white border-neutral-200 text-neutral-300'
                              }`}
                            >
                              {isCompleted ? (
                                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">{idx + 1}</span>
                              )}
                            </div>

                            {/* Stage Details */}
                            <div className="pl-4">
                              <h4
                                className={`text-sm font-bold transition-colors ${
                                  isActive
                                    ? 'text-[#2D5A27] text-base'
                                    : isCompleted
                                    ? 'text-neutral-800'
                                    : 'text-neutral-400'
                                }`}
                              >
                                {stage.label}
                                {isActive && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 animate-pulse">
                                    Current Stage
                                  </span>
                                )}
                              </h4>
                              <p className={`text-xs mt-0.5 ${isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>
                                {stage.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping & Items summary */}
                <div className="bg-[#f8faf7] rounded-2xl p-5 border border-neutral-100 space-y-4">
                  {selectedOrder.delivery_otp && (selectedOrder.status === 'shipped' || selectedOrder.status === 'out_for_delivery') && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex flex-col items-center text-center">
                      <span className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">🔒 Secure Handover OTP</span>
                      <span className="text-2xl font-extrabold font-mono text-amber-900 tracking-widest">{selectedOrder.delivery_otp}</span>
                      <p className="text-[10px] text-amber-700/80 mt-1">Provide this code to the delivery executive when they reach your doorstep.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">Destination Address</h4>
                      <p className="text-xs text-neutral-700">{selectedOrder.shipping_address}</p>
                    </div>
                    {(selectedOrder.warehouse || selectedOrder.delivery_partner) && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">Fulfillment Details</h4>
                        {selectedOrder.warehouse && (
                          <p className="text-xs text-neutral-700">
                            <strong>Facility:</strong> {selectedOrder.warehouse.name}
                          </p>
                        )}
                        {selectedOrder.delivery_partner && (
                          <p className="text-xs text-neutral-700 mt-1">
                            <strong>Courier:</strong> {selectedOrder.delivery_partner.name} <br/>
                            <strong>Vehicle:</strong> {selectedOrder.delivery_partner.vehicle_number}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-2">Package Items</h4>
                    <div className="divide-y divide-neutral-100">
                      {selectedOrder.items.map((item) => (
                        <div key={item.product_id} className="flex justify-between py-2 text-xs">
                          <span className="text-neutral-600">
                            {item.product_name} <span className="text-xs text-neutral-400">×{item.quantity}</span>
                          </span>
                          <span className="font-semibold text-neutral-800">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-400 shadow-sm">
                Select an order from the list to view its shipment journey.
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
