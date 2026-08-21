import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { FormFeedback } from '../../components/FormFeedback';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardFormGrid,
  DashboardReadOnlyField,
  DashboardTextarea,
} from '../../components/dashboard/DashboardForm';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { FarmerProfile } from '../../types';

export default function FarmerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run } = useFormAction();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [address, setAddress] = useState('');
  const [documents, setDocuments] = useState('');

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    api.farmerProfile().then((p) => {
      setProfile(p);
      setAddress(p.address);
      setDocuments(p.documents_json);
    });
  }, [authLoading, user?.role]);

  const handleSave = () => {
    run(
      async () => {
        const updated = await api.updateFarmerProfile({ address, documents_json: documents });
        setProfile(updated);
      },
      { successMessage: 'Profile updated successfully.' },
    );
  };

  if (!profile) {
    return <DashboardLayout title="Profile" navItems={farmerNav}>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="Farmer Profile" navItems={farmerNav}>
      <DashboardFormCard
        title="Profile overview"
        description="Your registered farmer details and verification status."
        className="max-w-2xl mb-6"
      >
        <DashboardFormGrid>
          <DashboardReadOnlyField label="Farmer ID" value={profile.farmer_code} />
          <DashboardReadOnlyField label="Verification" value={profile.verification_status} />
          <DashboardReadOnlyField label="Name" value={profile.full_name} />
          <DashboardReadOnlyField label="Email" value={profile.email} />
          <DashboardReadOnlyField label="Phone" value={profile.phone || '—'} />
        </DashboardFormGrid>
      </DashboardFormCard>

      <DashboardFormCard
        title="Update details"
        description="Keep your address and document references current."
        className="max-w-2xl"
      >
        <DashboardField label="Address" htmlFor="farmer-address">
          <DashboardTextarea
            id="farmer-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </DashboardField>

        <DashboardField
          label="Documents (JSON list)"
          htmlFor="farmer-documents"
          hint="Upload integration can be added later."
        >
          <DashboardTextarea
            id="farmer-documents"
            value={documents}
            onChange={(e) => setDocuments(e.target.value)}
            rows={3}
            placeholder='[{"name":"Land record","url":""}]'
            className="font-mono text-sm"
          />
        </DashboardField>

        <FormFeedback error={error} success={success} loading={loading} loadingText="Saving..." />

        <DashboardFormActions>
          <DashboardButton type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </DashboardButton>
        </DashboardFormActions>
      </DashboardFormCard>
    </DashboardLayout>
  );
}
