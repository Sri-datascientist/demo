import { useEffect, useState, type FormEvent } from 'react';
import { Leaf, Scale, Sprout } from 'lucide-react';
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
  RecordDeleteButton,
} from '../../components/dashboard/DashboardRecordCard';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { Crop } from '../../types';

const STAGES = ['planning', 'sowing', 'growing', 'harvesting', 'sold'];

export default function CropManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run, clear } = useFormAction();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    variety: '',
    farming_stage: 'planning',
    expected_yield_kg: '',
    notes: '',
  });

  const load = () => api.getCrops().then(setCrops).catch(() => setCrops([]));

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    load();
  }, [authLoading, user?.role]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () => {
        await api.createCrop({
          name: form.name.trim(),
          variety: form.variety,
          farming_stage: form.farming_stage,
          expected_yield_kg: parseFloat(form.expected_yield_kg) || 0,
          notes: form.notes,
        });
        setShowForm(false);
        setForm({ name: '', variety: '', farming_stage: 'planning', expected_yield_kg: '', notes: '' });
        load();
      },
      { successMessage: 'Crop saved successfully.' },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this crop from your registry?')) return;
    run(async () => {
      await api.deleteCrop(id);
      load();
    }, { successMessage: 'Crop deleted.' });
  };

  return (
    <DashboardLayout
      title="Crop management"
      subtitle="Register crops, track growth stage, and expected yield per season."
      navItems={farmerNav}
    >
      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          clear();
        }}
        className="dashboard-btn-primary mb-6"
      >
        {showForm ? 'Cancel' : 'Add crop'}
      </button>

      <FormFeedback error={error} success={success} loading={loading && !showForm} />

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-2xl mb-6">
          <DashboardFormCard title="Add crop" description="Register a crop on your farm for tracking and advisory.">
            <DashboardField label="Crop name">
              <DashboardInput
                placeholder="e.g. Wheat"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </DashboardField>
            <DashboardField label="Variety">
              <DashboardInput
                placeholder="Variety"
                value={form.variety}
                onChange={(e) => setForm({ ...form, variety: e.target.value })}
              />
            </DashboardField>
            <DashboardField label="Farming stage">
              <DashboardSelect
                value={form.farming_stage}
                onChange={(e) => setForm({ ...form, farming_stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </DashboardSelect>
            </DashboardField>
            <DashboardField label="Expected yield (kg)">
              <DashboardInput
                placeholder="Expected yield (kg)"
                type="number"
                value={form.expected_yield_kg}
                onChange={(e) => setForm({ ...form, expected_yield_kg: e.target.value })}
              />
            </DashboardField>
            <DashboardField label="Notes">
              <DashboardTextarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </DashboardField>
            <FormFeedback error={error} loading={loading} loadingText="Saving..." />
            <DashboardFormActions>
              <DashboardButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save crop'}
              </DashboardButton>
            </DashboardFormActions>
          </DashboardFormCard>
        </form>
      )}

      <DashboardRecordList emptyMessage="No crops registered yet. Add your first crop above.">
        {crops.map((crop) => (
          <div key={crop.id}>
            <DashboardRecordCard
              icon={Leaf}
              title={crop.name}
              subtitle={crop.variety ? `Variety: ${crop.variety}` : undefined}
              meta={[
                { label: 'Stage', value: crop.farming_stage, icon: Sprout },
                { label: 'Yield', value: `${crop.expected_yield_kg} kg`, icon: Scale },
              ]}
              actions={<RecordDeleteButton onClick={() => handleDelete(crop.id)} disabled={loading} />}
            >
              {crop.notes ? crop.notes : undefined}
            </DashboardRecordCard>
          </div>
        ))}
      </DashboardRecordList>
    </DashboardLayout>
  );
}
