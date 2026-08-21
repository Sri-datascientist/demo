import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
  DashboardTextarea,
} from '../../components/dashboard/DashboardForm';
import { hubNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { CropListing } from '../../types';

const GRADES = [
  { value: 'A', label: 'Grade A — Premium' },
  { value: 'B', label: 'Grade B — Standard' },
  { value: 'C', label: 'Grade C — Basic' },
];

export default function HubCollectorPage() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<CropListing | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [grade, setGrade] = useState('A');
  const [gradeNotes, setGradeNotes] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    const status = filter === 'pending' ? undefined : filter;
    api.hubInspections(status).then(setListings).catch(() => setListings([]));
  };

  useEffect(() => { load(); }, [filter]);

  const pendingListings = listings.filter(
    (l) => l.status === 'submitted' || l.status === 'quality_check',
  );

  const handleSchedule = async () => {
    if (!selected || !scheduleAt) return;
    await api.hubScheduleInspection(selected.id, new Date(scheduleAt).toISOString(), scheduleNotes);
    setMessage('Inspection scheduled.');
    setSelected(null);
    load();
  };

  const handleGrade = async (approve: boolean) => {
    if (!selected) return;
    const quality_grade = approve ? grade : 'rejected';
    const status = approve ? 'approved' : 'rejected';
    await api.hubGradeListing(selected.id, quality_grade, status, gradeNotes);
    setMessage(approve ? `Approved as Grade ${grade}` : 'Listing rejected.');
    setSelected(null);
    load();
  };

  return (
    <DashboardLayout title="Quality Collector" navItems={hubNav}>
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'pending', label: 'Awaiting QC' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'quality_check', label: 'In inspection' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f.key ? 'bg-[#2D5A27] text-white' : 'border border-[#2D5A27]/30 text-[#2D5A27]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 text-green-700 font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          {message}
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-[#2D5A27]">
            {filter === 'pending' ? 'Awaiting inspection' : 'Listings'} ({pendingListings.length || listings.length})
          </h2>
          {(filter === 'pending' ? pendingListings : listings).map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setSelected(l);
                setMessage('');
                setScheduleAt(
                  l.inspection_scheduled_at ? l.inspection_scheduled_at.slice(0, 16) : '',
                );
                setGradeNotes(l.inspection_notes || '');
                setGrade(l.quality_grade === 'B' || l.quality_grade === 'C' ? l.quality_grade : 'A');
              }}
              className={`w-full text-left rounded-xl border p-5 bg-white transition-colors ${
                selected?.id === l.id ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20' : ''
              }`}
            >
              <div className="flex justify-between gap-2 mb-1">
                <p className="font-bold text-lg">{l.crop_name}</p>
                <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-[#689F38]/15 capitalize">
                  {l.status}
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                {l.farmer_name} · {l.farmer_code}
              </p>
              <p className="page-body text-sm mt-1">
                {l.quantity_kg} kg @ ₹{l.price_per_kg}/kg · Grade: {l.quality_grade}
              </p>
              {l.inspection_scheduled_at && (
                <p className="text-xs text-[#2D5A27] mt-2 font-semibold">
                  Scheduled: {new Date(l.inspection_scheduled_at).toLocaleString()}
                </p>
              )}
            </button>
          ))}
          {listings.length === 0 && <p className="page-body">No listings in this queue.</p>}
        </div>

        <DashboardFormCard
          title={selected ? `Inspect: ${selected.crop_name}` : 'Inspection panel'}
          description={selected ? 'Schedule visits and assign crop grades.' : 'Select a listing from the queue to begin.'}
          className="h-fit"
        >
          {selected ? (
            <>
              <div className="grid gap-2 text-sm text-[#273c46]">
                <p><span className="font-semibold text-[#1a3320]">Farmer:</span> {selected.farmer_name} ({selected.farmer_code})</p>
                <p><span className="font-semibold text-[#1a3320]">Quantity:</span> {selected.quantity_kg} kg</p>
                <p><span className="font-semibold text-[#1a3320]">Price:</span> ₹{selected.price_per_kg}/kg · MSP ₹{selected.msp_per_kg}</p>
                <p><span className="font-semibold text-[#1a3320]">Notes:</span> {selected.notes || '—'}</p>
              </div>

              {(selected.status === 'submitted' || selected.status === 'quality_check') && (
                <>
                  <div className="border-t border-[#eef2ef] pt-5 space-y-4">
                    <p className="dashboard-label">Schedule inspection</p>
                    <DashboardField label="Date & time">
                      <DashboardInput
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                      />
                    </DashboardField>
                    <DashboardField label="Inspection notes">
                      <DashboardTextarea
                        placeholder="Inspection notes"
                        value={scheduleNotes}
                        onChange={(e) => setScheduleNotes(e.target.value)}
                        rows={2}
                      />
                    </DashboardField>
                    <DashboardButton type="button" variant="secondary" onClick={handleSchedule}>
                      Schedule visit
                    </DashboardButton>
                  </div>

                  <div className="border-t border-[#eef2ef] pt-5 space-y-4">
                    <p className="dashboard-label">Crop grading (A / B / C)</p>
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setGrade(g.value)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                            grade === g.value
                              ? 'bg-[#2D5A27] text-white shadow-sm'
                              : 'border border-[#e2e8e4] text-[#273c46] hover:bg-[#f4f7f5]'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                    <DashboardField label="Grading notes">
                      <DashboardTextarea
                        placeholder="Grading notes"
                        value={gradeNotes}
                        onChange={(e) => setGradeNotes(e.target.value)}
                        rows={2}
                      />
                    </DashboardField>
                    <DashboardFormActions>
                      <DashboardButton type="button" onClick={() => handleGrade(true)}>
                        Approve with grade
                      </DashboardButton>
                      <DashboardButton type="button" variant="danger" onClick={() => handleGrade(false)}>
                        Reject
                      </DashboardButton>
                    </DashboardFormActions>
                  </div>
                </>
              )}

              {(selected.status === 'approved' || selected.status === 'rejected') && (
                <p className="text-sm capitalize font-semibold text-[#2D5A27]">
                  Final: {selected.status} · Grade {selected.quality_grade}
                </p>
              )}
            </>
          ) : (
            <p className="dashboard-empty-state border-none bg-transparent p-0 text-left">
              Select a listing from the queue to schedule or grade.
            </p>
          )}
        </DashboardFormCard>
      </div>
    </DashboardLayout>
  );
}
