import type { AnalyticsSummary } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#2D5A27',
  cancelled: '#ef4444',
};

export function AdminAnalyticsCharts({ data }: { data: AnalyticsSummary }) {
  const statusEntries = Object.entries(data.orders_by_status).filter(([, c]) => c > 0);
  const maxStatus = Math.max(...statusEntries.map(([, c]) => c), 1);
  const revenueRows = data.revenue_by_month;
  const maxRevenue = Math.max(...revenueRows.map((r) => r.revenue), 1);

  const platformBars = [
    { label: 'Customers', value: data.total_customers, color: '#2D5A27' },
    { label: 'Farmers', value: data.total_farmers, color: '#689F38' },
    { label: 'Products', value: data.total_products, color: '#0D212C' },
    { label: 'Orders', value: data.total_orders, color: '#3b82f6' },
  ];
  const maxPlatform = Math.max(...platformBars.map((b) => b.value), 1);

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[#2D5A27]">Revenue by month</h3>
          {revenueRows.length === 0 ? (
            <p className="page-body text-neutral-500">No order revenue yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {revenueRows.map((row) => (
                <div key={row.month} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-[#2D5A27]">₹{row.revenue.toFixed(0)}</span>
                  <div
                    className="w-full rounded-t-lg bg-[#2D5A27] transition-all min-h-[4px]"
                    style={{ height: `${(row.revenue / maxRevenue) * 100}%` }}
                    title={`₹${row.revenue}`}
                  />
                  <span className="text-xs text-neutral-500 truncate w-full text-center">{row.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[#2D5A27]">Orders by status</h3>
          {statusEntries.length === 0 ? (
            <p className="page-body text-neutral-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1 capitalize">
                    <span className="font-medium">{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(count / maxStatus) * 100}%`,
                        backgroundColor: STATUS_COLORS[status] || '#689F38',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-[#2D5A27]">Platform overview</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformBars.map((bar) => (
            <div key={bar.label} className="text-center">
              <p className="page-label mb-2">{bar.label}</p>
              <div className="h-24 flex items-end justify-center">
                <div
                  className="w-12 rounded-t-lg"
                  style={{
                    height: `${(bar.value / maxPlatform) * 100}%`,
                    backgroundColor: bar.color,
                    minHeight: bar.value > 0 ? '8px' : '0',
                  }}
                />
              </div>
              <p className="text-2xl font-bold mt-2" style={{ color: bar.color }}>{bar.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 bg-gradient-to-br from-[#2D5A27]/10 to-white">
          <p className="page-label">Total revenue</p>
          <p className="text-3xl font-bold text-[#2D5A27]">₹{data.total_revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="page-label">Low stock items</p>
          <p className="text-3xl font-bold text-amber-700">{data.low_stock_count}</p>
        </div>
        <div className="rounded-xl border p-5 bg-gradient-to-br from-blue-50 to-white">
          <p className="page-label">Pending crop listings</p>
          <p className="text-3xl font-bold text-blue-700">{data.pending_crop_listings}</p>
        </div>
      </div>
    </div>
  );
}
