import { useEffect, useState, type FormEvent } from 'react';
import { Calendar, MapPin, Sprout } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { FormFeedback } from '../../components/FormFeedback';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
  DashboardSelect,
  DashboardTextarea,
} from '../../components/dashboard/DashboardForm';
import {
  DashboardRecordCard,
  DashboardRecordList,
} from '../../components/dashboard/DashboardRecordCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { InfoBox } from '../../components/dashboard/InfoBox';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { Land, SoilHealthReport } from '../../types';

export default function SoilHealthPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run, clear } = useFormAction();
  const [reports, setReports] = useState<SoilHealthReport[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ report_name: '', land_id: '', notes: '' });

  const landName = (landId?: number | null) =>
    lands.find((l) => l.id === landId)?.name ?? 'Not linked';

  const load = () => {
    api.getSoilReports().then(setReports).catch(() => setReports([]));
    api.getLands().then(setLands).catch(() => setLands([]));
  };

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    load();
  }, [authLoading, user?.role]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () => {
        await api.createSoilReport({
          report_name: form.report_name.trim(),
          land_id: form.land_id ? parseInt(form.land_id, 10) : undefined,
          notes: form.notes,
        });
        setShowForm(false);
        setForm({ report_name: '', land_id: '', notes: '' });
        load();
      },
      { successMessage: 'Soil report submitted successfully.' },
    );
  };

  return (
    <DashboardLayout
      title="Soil health"
      subtitle="Submit lab report references linked to your registered land."
      navItems={farmerNav}
    >
      <InfoBox title="About soil reports" variant="tip" className="mb-6">
        Record lab references here. Full file upload and automated analysis will be added in a later
        release — admins review submissions from the Submissions page.
      </InfoBox>

      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          clear();
        }}
        className="dashboard-btn-primary mb-6"
      >
        {showForm ? 'Cancel' : 'Add soil report'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-2xl mb-6">
          <DashboardFormCard title="Add soil report" description="Link a lab reference to one of your registered land plots.">
            <DashboardField label="Report name / lab reference">
              <DashboardInput required value={form.report_name} onChange={(e) => setForm({ ...form, report_name: e.target.value })} placeholder="Report name / lab reference" />
            </DashboardField>
            <DashboardField label="Land (optional)">
              <DashboardSelect value={form.land_id} onChange={(e) => setForm({ ...form, land_id: e.target.value })}>
                <option value="">Land (optional)</option>
                {lands.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </DashboardSelect>
            </DashboardField>
            <DashboardField label="Notes">
              <DashboardTextarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Notes" />
            </DashboardField>
            <FormFeedback error={error} success={success} loading={loading} loadingText="Submitting..." />
            <DashboardFormActions>
              <DashboardButton type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit report'}
              </DashboardButton>
            </DashboardFormActions>
          </DashboardFormCard>
        </form>
      )}

      <DashboardRecordList emptyMessage="No soil reports yet. Submit your first lab reference above.">
        {reports.map((r) => (
          <div key={r.id}>
            <DashboardRecordCard
            icon={Sprout}
            title={r.report_name}
            subtitle={r.notes || 'No additional notes'}
            meta={[
              { label: 'Land', value: landName(r.land_id), icon: MapPin },
              { label: 'Status', value: r.status },
              {
                label: 'Submitted',
                value: new Date(r.created_at).toLocaleDateString('en-IN'),
                icon: Calendar,
              },
            ]}
            actions={<StatusBadge status={r.status} />}
            />
          </div>
        ))}
      </DashboardRecordList>
    </DashboardLayout>
  );
}
