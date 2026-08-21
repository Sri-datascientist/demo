import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { CropListing } from '../../types';

export default function CropApprovalPage() {
  const [searchParams] = useSearchParams();
  const pendingOnly = searchParams.get('pending') === '1';
  const [listings, setListings] = useState<CropListing[]>([]);

  const load = () => api.adminCropListings().then(setListings).catch(() => setListings([]));
  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm('Delete this crop listing?')) return;
    await api.adminDeleteCropListing(id);
    load();
  };

  const visibleListings = useMemo(
    () =>
      pendingOnly
        ? listings.filter((l) => l.status === 'submitted' || l.status === 'quality_check')
        : listings,
    [listings, pendingOnly],
  );

  return (
    <DashboardLayout
      title={pendingOnly ? 'Pending crop listings' : 'Crop listings'}
      subtitle={
        pendingOnly
          ? 'Listings awaiting quality check or hub inspection before they can proceed.'
          : 'All farmer crop sale listings on the marketplace.'
      }
      navItems={adminNav}
    >
      {pendingOnly && (
        <p className="mb-4 text-sm">
          <Link to="/admin/crop-listings" className="font-semibold text-[#2D5A27] hover:underline">
            ← View all listings
          </Link>
        </p>
      )}
      <p className="page-body mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        Quality inspection and A/B/C grading are handled by the District Hub collector. Admin view is read-only.
      </p>
      <div className="space-y-4">
        {visibleListings.length === 0 ? (
          <p className="rounded-xl border bg-white p-8 text-center text-[#5a6b63]">
            {pendingOnly ? 'No pending crop listings in the queue.' : 'No crop listings yet.'}
          </p>
        ) : (
          visibleListings.map((l) => (
          <div key={l.id} className="rounded-xl border p-5 bg-white">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-bold text-lg">{l.crop_name}</p>
                <p className="page-body text-sm">{l.farmer_name} · {l.farmer_code}</p>
                <p className="page-body">{l.quantity_kg} kg @ ₹{l.price_per_kg}/kg | MSP ₹{l.msp_per_kg}</p>
                <p className="text-sm capitalize">
                  Status: {l.status} | Grade: <span className="font-semibold">{l.quality_grade}</span>
                </p>
                {l.inspection_scheduled_at && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Inspection: {new Date(l.inspection_scheduled_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(l.id)}
                className="rounded-full border border-red-300 text-red-500 px-4 py-2 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </DashboardLayout>
  );
}
