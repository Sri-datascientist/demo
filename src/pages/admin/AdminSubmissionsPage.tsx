import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import type { Crop, Land, ProductReview, SoilHealthReport, SupportTicket } from '../../types';

type Tab = 'soil' | 'support' | 'lands' | 'crops' | 'reviews';

const tabs: { id: Tab; label: string }[] = [
  { id: 'soil', label: 'Soil Reports' },
  { id: 'support', label: 'Support Tickets' },
  { id: 'lands', label: 'Farmer Lands' },
  { id: 'crops', label: 'Farmer Crops' },
  { id: 'reviews', label: 'Product Reviews' },
];

export default function AdminSubmissionsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'soil';
  const [tab, setTab] = useState<Tab>(tabs.some((t) => t.id === initialTab) ? initialTab : 'soil');
  const [soilReports, setSoilReports] = useState<SoilHealthReport[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ticketEdits, setTicketEdits] = useState<Record<number, { status: string; response: string }>>({});

  const loadSoil = () => api.adminSoilReports().then(setSoilReports).catch(() => setSoilReports([]));
  const loadTickets = () => api.adminSupportTickets().then(setTickets).catch(() => setTickets([]));
  const loadLands = () => api.adminLands().then(setLands).catch(() => setLands([]));
  const loadCrops = () => api.adminCrops().then(setCrops).catch(() => setCrops([]));
  const loadReviews = () => api.adminReviews().then(setReviews).catch(() => setReviews([]));

  useEffect(() => {
    const q = searchParams.get('tab') as Tab | null;
    if (q && tabs.some((t) => t.id === q)) setTab(q);
  }, [searchParams]);

  const openTickets = useMemo(
    () => tickets.filter((t) => t.status === 'open' || t.status === 'in_progress'),
    [tickets],
  );

  useEffect(() => {
    loadSoil();
    loadTickets();
    loadLands();
    loadCrops();
    loadReviews();
  }, []);

  const updateSoilStatus = async (id: number, status: string) => {
    await api.adminUpdateSoilReport(id, status);
    loadSoil();
  };

  const updateTicket = async (ticket: SupportTicket) => {
    const edit = ticketEdits[ticket.id];
    const status = edit?.status || ticket.status;
    const response = edit?.response ?? ticket.admin_response;
    await api.adminUpdateSupportTicket(ticket.id, status, response || undefined);
    loadTickets();
  };

  return (
    <DashboardLayout
      title={tab === 'support' ? 'Support tickets' : 'Submissions'}
      subtitle={
        tab === 'support'
          ? 'Open and in-progress customer support requests requiring admin response.'
          : 'Soil reports, support tickets, farmer registry data, and customer reviews.'
      }
      navItems={adminNav}
    >
      {tab === 'support' && (
        <p className="mb-4 text-sm">
          <Link to="/admin/submissions" className="font-semibold text-[#2D5A27] hover:underline">
            ← All submissions
          </Link>
          {' · '}
          <span className="text-[#5a6b63]">{openTickets.length} open ticket(s)</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20'
                : 'bg-white border border-[#2D5A27]/12 text-[#2D5A27] hover:bg-[#689F38]/8'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'soil' && (
        <div className="dashboard-table-wrap overflow-x-auto">
          <table className="dashboard-table w-full text-left">
            <thead>
              <tr>
                <th className="dashboard-table-th">Report</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Land</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {soilReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">No soil reports submitted yet.</td>
                </tr>
              )}
              {soilReports.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4 font-medium">{r.report_name}</td>
                  <td className="p-4">
                    <div>{r.farmer_name || '—'}</div>
                    <div className="text-xs text-gray-500">{r.farmer_code}</div>
                  </td>
                  <td className="p-4">{r.land_name || '—'}</td>
                  <td className="p-4 text-sm max-w-xs truncate">{r.notes || '—'}</td>
                  <td className="p-4"><StatusBadge status={r.status} /></td>
                  <td className="p-4 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => updateSoilStatus(r.id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'support' && (
        <div className="space-y-4">
          {(searchParams.get('tab') === 'support' ? openTickets : tickets).length === 0 && (
            <p className="dashboard-empty-state">No support tickets to show.</p>
          )}
          {(searchParams.get('tab') === 'support' ? openTickets : tickets).map((t) => {
            const edit = ticketEdits[t.id] || { status: t.status, response: t.admin_response };
            return (
              <div key={t.id} className="rounded-xl border p-5 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold">{t.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t.user_name} ({t.user_email}) · {t.user_role} · {t.category}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="page-body mb-4">{t.description}</p>
                {t.admin_response && !ticketEdits[t.id] && (
                  <p className="text-sm bg-gray-50 rounded-lg p-3 mb-4">
                    <span className="font-semibold">Previous response:</span> {t.admin_response}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 items-end">
                  <select
                    value={edit.status}
                    onChange={(e) =>
                      setTicketEdits({ ...ticketEdits, [t.id]: { ...edit, status: e.target.value } })
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <input
                    placeholder="Admin response"
                    value={edit.response}
                    onChange={(e) =>
                      setTicketEdits({ ...ticketEdits, [t.id]: { ...edit, response: e.target.value } })
                    }
                    className="rounded-lg border px-3 py-2 text-sm flex-1 min-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => updateTicket(t)}
                    className="rounded-full bg-[#2D5A27] text-white px-4 py-2 text-sm font-semibold"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(t.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'lands' && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#689F38]/10">
              <tr>
                <th className="p-4">Land</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Area</th>
                <th className="p-4">Location</th>
                <th className="p-4">Soil</th>
                <th className="p-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {lands.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">No lands registered yet.</td>
                </tr>
              )}
              {lands.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-4 font-medium">{l.name}</td>
                  <td className="p-4">
                    <div>{l.farmer_name || '—'}</div>
                    <div className="text-xs text-gray-500">{l.farmer_code}</div>
                  </td>
                  <td className="p-4">{l.area_acres} ac</td>
                  <td className="p-4 text-sm max-w-xs truncate">{l.location_text || '—'}</td>
                  <td className="p-4 text-sm">{l.soil_type || '—'}</td>
                  <td className="p-4 text-sm">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'crops' && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#689F38]/10">
              <tr>
                <th className="p-4">Crop</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Land</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Expected yield</th>
                <th className="p-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {crops.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">No crops registered yet.</td>
                </tr>
              )}
              {crops.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4">
                    <div className="font-medium">{c.name}</div>
                    {c.variety && <div className="text-xs text-gray-500">{c.variety}</div>}
                  </td>
                  <td className="p-4">
                    <div>{c.farmer_name || '—'}</div>
                    <div className="text-xs text-gray-500">{c.farmer_code}</div>
                  </td>
                  <td className="p-4">{c.land_name || '—'}</td>
                  <td className="p-4 capitalize">{c.farming_stage}</td>
                  <td className="p-4">{c.expected_yield_kg} kg</td>
                  <td className="p-4 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="dashboard-empty-state">No product reviews yet.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border p-5 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-bold">{r.product_name || `Product #${r.product_id}`}</h3>
                <span className="text-amber-600 font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {r.user_name} ({r.user_email})
              </p>
              {r.comment && <p className="page-body">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
