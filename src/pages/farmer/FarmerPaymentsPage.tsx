import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { Payment } from '../../types';

export default function FarmerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    api.getFarmerPayments().then(setPayments).catch(() => setPayments([]));
  }, []);

  const pending = payments.filter((p) => p.status === 'pending');
  const completed = payments.filter((p) => p.status === 'completed');

  return (
    <DashboardLayout title="Payments" navItems={farmerNav}>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border p-5 bg-white">
          <p className="page-label">Pending</p>
          <p className="text-2xl font-bold text-amber-700">₹{pending.reduce((s, p) => s + p.amount, 0).toFixed(0)}</p>
        </div>
        <div className="rounded-xl border p-5 bg-white">
          <p className="page-label">Completed</p>
          <p className="text-2xl font-bold text-[#2D5A27]">₹{completed.reduce((s, p) => s + p.amount, 0).toFixed(0)}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Transaction history</h2>
      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="rounded-xl border p-4 flex justify-between bg-white">
            <div>
              <p className="font-semibold">₹{p.amount.toFixed(2)} — {p.reference || p.payment_type}</p>
              <p className="text-sm text-neutral-600">{p.notes}</p>
            </div>
            <span className="capitalize font-semibold text-sm">{p.status}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
