import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardTable } from '../../components/dashboard/DashboardTable';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { Payment } from '../../types';

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    api.adminPayments().then(setPayments).catch(() => setPayments([]));
  }, []);

  return (
    <DashboardLayout
      title="Payments"
      subtitle="Farmer settlements and platform payment records."
      navItems={adminNav}
    >
      <DashboardTable
        columns={['Reference', 'Amount', 'Type', 'Status', 'Date']}
        isEmpty={payments.length === 0}
        emptyMessage="No payment records yet."
      >
        {payments.map((p) => (
          <tr key={p.id} className="dashboard-table-row">
            <td className="dashboard-table-td font-medium">
              {p.reference || `#${p.id}`}
            </td>
            <td className="dashboard-table-td font-bold text-[#2D5A27]">
              ₹{p.amount.toFixed(2)}
            </td>
            <td className="dashboard-table-td capitalize">{p.payment_type}</td>
            <td className="dashboard-table-td">
              <StatusBadge status={p.status} />
            </td>
            <td className="dashboard-table-td text-sm text-[#273C46]/70">
              {new Date(p.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </DashboardTable>
    </DashboardLayout>
  );
}
