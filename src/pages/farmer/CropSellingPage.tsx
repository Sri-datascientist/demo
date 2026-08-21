import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Package, Scale } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { FormFeedback } from '../../components/FormFeedback';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
  DashboardTextarea,
} from '../../components/dashboard/DashboardForm';
import {
  DashboardRecordCard,
  DashboardRecordList,
} from '../../components/dashboard/DashboardRecordCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { CropListing, KycStatus } from '../../types';

export default function CropSellingPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run, clear } = useFormAction();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [kyc, setKyc] = useState<KycStatus | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop_name: '', quantity_kg: '', price_per_kg: '', msp_per_kg: '', notes: '' });

  const load = () => {
    api.getListings().then(setListings).catch(() => setListings([]));
    api.getKycStatus().then(setKyc).catch(() => setKyc(null));
  };

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    load();
  }, [authLoading, user?.role]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () => {
        await api.createListing({
          crop_name: form.crop_name.trim(),
          quantity_kg: parseFloat(form.quantity_kg),
          price_per_kg: parseFloat(form.price_per_kg),
          msp_per_kg: parseFloat(form.msp_per_kg) || 0,
          notes: form.notes,
        });
        setShowForm(false);
        setForm({ crop_name: '', quantity_kg: '', price_per_kg: '', msp_per_kg: '', notes: '' });
        load();
      },
      { successMessage: 'Crop listing created.' },
    );
  };

  const handleSubmitListing = (id: number) => {
    run(async () => {
      await api.submitListing(id);
      load();
    }, { successMessage: 'Submitted for quality inspection.' });
  };

  return (
    <DashboardLayout
      title="Sell crop"
      subtitle="Create listings and submit them for district hub quality inspection."
      navItems={farmerNav}
    >
      {kyc?.kyc_status !== 'verified' && (
        <div className="dashboard-info-box dashboard-info-box-warning mb-6">
          <p className="text-sm text-amber-900">
            Complete{' '}
            <Link to="/farmer/kyc" className="font-semibold underline text-[#2D5A27]">
              Aadhaar KYC
            </Link>{' '}
            before submitting crops for inspection.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          clear();
        }}
        className="dashboard-btn-primary mb-6"
      >
        {showForm ? 'Cancel' : 'New listing'}
      </button>

      <FormFeedback error={error} success={success} loading={loading && !showForm} />

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-2xl mb-6">
          <DashboardFormCard title="New listing" description="Set quantity and price before submitting for quality inspection.">
            <DashboardField label="Crop name">
              <DashboardInput required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} placeholder="Crop name" />
            </DashboardField>
            <DashboardField label="Quantity (kg)">
              <DashboardInput required type="number" min="0" step="0.01" value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} placeholder="Quantity (kg)" />
            </DashboardField>
            <DashboardField label="Price per kg (₹)">
              <DashboardInput required type="number" min="0" step="0.01" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} placeholder="Price per kg" />
            </DashboardField>
            <DashboardField label="MSP per kg (₹)">
              <DashboardInput type="number" min="0" step="0.01" value={form.msp_per_kg} onChange={(e) => setForm({ ...form, msp_per_kg: e.target.value })} placeholder="MSP per kg (optional)" />
            </DashboardField>
            <DashboardField label="Notes">
              <DashboardTextarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notes" />
            </DashboardField>
            <FormFeedback error={error} loading={loading} loadingText="Creating..." />
            <DashboardFormActions>
              <DashboardButton type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create listing'}
              </DashboardButton>
            </DashboardFormActions>
          </DashboardFormCard>
        </form>
      )}

      <DashboardRecordList emptyMessage="No listings yet. Create a listing to sell your crop.">
        {listings.map((l) => (
          <div key={l.id}>
            <DashboardRecordCard
            icon={Package}
            title={l.crop_name}
            subtitle={l.notes || 'No notes on this listing'}
            meta={[
              { label: 'Quantity', value: `${l.quantity_kg} kg`, icon: Scale },
              { label: 'Price', value: `₹${l.price_per_kg}/kg`, icon: IndianRupee },
              { label: 'MSP', value: `₹${l.msp_per_kg}/kg`, icon: IndianRupee },
              { label: 'Status', value: l.status },
              { label: 'Grade', value: l.quality_grade },
            ]}
            actions={
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <StatusBadge status={l.status} />
                {l.status === 'draft' && (
                  <button
                    type="button"
                    disabled={loading || kyc?.kyc_status !== 'verified'}
                    onClick={() => handleSubmitListing(l.id)}
                    className="dashboard-record-action dashboard-record-action-primary"
                  >
                    Submit for QC
                  </button>
                )}
              </div>
            }
            />
          </div>
        ))}
      </DashboardRecordList>
    </DashboardLayout>
  );
}
