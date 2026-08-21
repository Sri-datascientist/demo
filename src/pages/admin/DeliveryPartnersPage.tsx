import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { api } from '../../lib/api';
import { adminNav } from '../../lib/navItems';
import type { Order } from '../../types';

interface DeliveryPartner {
  id: number;
  name: string;
  phone: string;
  vehicle_number: string;
  status: string;
  created_at: string;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Create partner form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');
  const [partnerLoading, setPartnerLoading] = useState(false);

  // OTP Verification inputs state
  const [dispatchOtps, setDispatchOtps] = useState<Record<number, string>>({});
  const [deliveryOtps, setDeliveryOtps] = useState<Record<number, string>>({});
  const [fulfillmentMessages, setFulfillmentMessages] = useState<Record<number, string>>({});

  const loadData = () => {
    api.adminDeliveryPartners().then(setPartners).catch(() => setPartners([]));
    api.adminWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
    api.adminOrders().then(setOrders).catch(() => setOrders([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !vehicle) return;
    setPartnerLoading(true);
    setPartnerMessage('');
    try {
      await api.adminCreateDeliveryPartner({ name, phone, vehicle_number: vehicle });
      setName('');
      setPhone('');
      setVehicle('');
      setPartnerMessage('Partner registered successfully!');
      loadData();
    } catch (err) {
      setPartnerMessage('Failed to register delivery partner.');
    } finally {
      setPartnerLoading(false);
    }
  };

  const handleAssign = async (orderId: number, whId: number, partnerId: number) => {
    if (!whId || !partnerId) return;
    setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Assigning...' }));
    try {
      await api.adminAssignFulfillment(orderId, { warehouse_id: whId, delivery_partner_id: partnerId });
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Assigned successfully!' }));
      loadData();
    } catch (err) {
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Assignment failed.' }));
    }
  };

  const handleVerifyDispatch = async (orderId: number) => {
    const otp = dispatchOtps[orderId];
    if (!otp) return;
    setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Verifying dispatch...' }));
    try {
      await api.adminVerifyDispatch(orderId, otp);
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Dispatch verified!' }));
      loadData();
    } catch (err) {
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Invalid Dispatch OTP.' }));
    }
  };

  const handleVerifyDelivery = async (orderId: number) => {
    const otp = deliveryOtps[orderId];
    if (!otp) return;
    setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Verifying delivery...' }));
    try {
      await api.adminVerifyDelivery(orderId, otp);
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Delivery complete!' }));
      loadData();
    } catch (err) {
      setFulfillmentMessages(prev => ({ ...prev, [orderId]: 'Invalid Delivery OTP.' }));
    }
  };

  return (
    <DashboardLayout title="Delivery Partners & Fleet" subtitle="Manage logistics partners, allocate warehouse dispatches, and verify secure deliveries." navItems={adminNav}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Register Partner */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardPanel title="Register Courier Partner">
            <form onSubmit={handleCreatePartner} className="space-y-4 mt-3">
              {partnerMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  partnerMessage.includes('success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  {partnerMessage}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1.5">Executive Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1.5">Phone Number</label>
                <input
                  required
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1.5">Vehicle Plate Number</label>
                <input
                  required
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. KA-03-MB-9876"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={partnerLoading}
                className="w-full rounded-full bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white py-3 font-semibold transition-colors disabled:opacity-60 text-sm mt-2"
              >
                {partnerLoading ? 'Registering...' : 'Register Partner'}
              </button>
            </form>
          </DashboardPanel>

          <DashboardPanel title="Active Courier Fleet">
            {partners.length === 0 ? (
              <p className="text-neutral-500 text-sm py-2">No partners registered yet.</p>
            ) : (
              <div className="space-y-3 mt-3">
                {partners.map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-neutral-100 bg-[#f8faf7] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-neutral-800">{p.name}</p>
                      <p className="text-neutral-400 font-mono mt-0.5">{p.vehicle_number} | {p.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${
                      p.status === 'idle' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>
        </div>

        {/* Right Side: Active Shipments and OTP Verification */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardPanel title="Shipment Dispatch & Delivery Lifecycle">
            {orders.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4">No active customer orders.</p>
            ) : (
              <div className="space-y-4 mt-3">
                {orders.map((order) => {
                  const [selectedWh, setSelectedWh] = useState(order.warehouse_id || 0);
                  const [selectedPartner, setSelectedPartner] = useState(order.delivery_partner_id || 0);

                  return (
                    <div key={order.id} className="p-5 rounded-2xl border border-neutral-200/80 bg-white space-y-4 shadow-xs">
                      {/* Order info */}
                      <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-800">Order #{order.id}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">TRACKING: {order.tracking_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-[#2D5A27]">₹{order.total_amount.toFixed(2)}</p>
                          <p className="text-[10px] text-neutral-400">Total Bill</p>
                        </div>
                      </div>

                      {/* Display Status Notification */}
                      {fulfillmentMessages[order.id] && (
                        <p className="text-xs font-semibold text-[#2D5A27]">{fulfillmentMessages[order.id]}</p>
                      )}

                      {/* Lifecycle Stage Actions */}
                      {order.status === 'pending' || order.status === 'confirmed' ? (
                        /* STAGE 1: Assignment */
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Fulfillment Assignment</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Select Warehouse</label>
                              <select
                                value={selectedWh}
                                onChange={(e) => setSelectedWh(Number(e.target.value))}
                                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white"
                              >
                                <option value={0}>Choose Warehouse...</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Select Delivery Executive</label>
                              <select
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(Number(e.target.value))}
                                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white"
                              >
                                <option value={0}>Choose Courier...</option>
                                {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.vehicle_number})</option>)}
                              </select>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssign(order.id, selectedWh, selectedPartner)}
                            disabled={!selectedWh || !selectedPartner}
                            className="rounded-full bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white px-5 py-2 font-semibold text-xs transition-colors disabled:opacity-50"
                          >
                            Assign & Generate OTPs
                          </button>
                        </div>
                      ) : order.status === 'processing' && !order.dispatch_verified ? (
                        /* STAGE 2: Dispatch OTP Verification */
                        <div className="space-y-3 bg-[#689F38]/5 rounded-xl p-4 border border-[#2D5A27]/10">
                          <p className="text-xs font-bold text-[#2D5A27] uppercase tracking-wide flex items-center gap-1.5">
                            📦 Stage 2: Verify Warehouse Pickup
                          </p>
                          <p className="text-xs text-neutral-600">
                            <strong>Assigned Warehouse:</strong> {order.warehouse?.name} <br/>
                            <strong>Courier Executive:</strong> {order.delivery_partner?.name} ({order.delivery_partner?.vehicle_number})
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="bg-white rounded-lg px-3 py-2 border font-bold text-sm font-mono text-[#2D5A27]">
                              OTP: {order.dispatch_otp}
                            </div>
                            <span className="text-[10px] text-neutral-400">Dispatcher Verification Code</span>
                          </div>
                          <div className="flex gap-2 max-w-xs">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter Dispatch OTP"
                              value={dispatchOtps[order.id] || ''}
                              onChange={(e) => setDispatchOtps(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="rounded-xl border border-neutral-200 px-3 py-2 text-xs w-full bg-white font-mono"
                            />
                            <button
                              onClick={() => handleVerifyDispatch(order.id)}
                              className="rounded-xl bg-[#2D5A27] text-white px-4 text-xs font-semibold whitespace-nowrap hover:bg-[#2D5A27]/90 transition-colors"
                            >
                              Verify Dispatch
                            </button>
                          </div>
                        </div>
                      ) : (order.status === 'shipped' || order.status === 'out_for_delivery') && !order.delivery_verified ? (
                        /* STAGE 3: Delivery OTP Verification */
                        <div className="space-y-3 bg-amber-50/50 rounded-xl p-4 border border-amber-200/50">
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                            🛵 Stage 3: Verify Customer Handover
                          </p>
                          <p className="text-xs text-neutral-600">
                            <strong>Shipped From:</strong> {order.warehouse?.name} <br/>
                            <strong>Delivering Executive:</strong> {order.delivery_partner?.name} (Call: {order.delivery_partner?.phone})
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="bg-white rounded-lg px-3 py-2 border font-bold text-sm font-mono text-amber-800">
                              OTP: {order.delivery_otp}
                            </div>
                            <span className="text-[10px] text-neutral-400">Share this code with the driver on handover</span>
                          </div>
                          <div className="flex gap-2 max-w-xs">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter Customer OTP"
                              value={deliveryOtps[order.id] || ''}
                              onChange={(e) => setDeliveryOtps(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="rounded-xl border border-neutral-200 px-3 py-2 text-xs w-full bg-white font-mono"
                            />
                            <button
                              onClick={() => handleVerifyDelivery(order.id)}
                              className="rounded-xl bg-[#2D5A27] text-white px-4 text-xs font-semibold whitespace-nowrap hover:bg-[#2D5A27]/90 transition-colors"
                            >
                              Confirm Delivery
                            </button>
                          </div>
                        </div>
                      ) : order.status === 'delivered' ? (
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-1.5 font-semibold">
                          ✅ Order successfully delivered and verified via Customer OTP.
                        </div>
                      ) : (
                        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs text-neutral-500 font-semibold">
                          Order is cancelled or finalized.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DashboardPanel>
        </div>

      </div>
    </DashboardLayout>
  );
}
