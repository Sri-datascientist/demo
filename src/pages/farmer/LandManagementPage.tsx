import { useEffect, useState, type FormEvent } from 'react';
import { Droplets, MapPin, Ruler } from 'lucide-react';
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
  RecordDeleteButton,
} from '../../components/dashboard/DashboardRecordCard';
import { farmerNav } from '../../lib/navItems';
import { LandMapPicker } from '../../components/farmer/LandMapPicker';
import { api } from '../../lib/api';
import { hasGoogleMapsApiKey } from '../../lib/env';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { Land } from '../../types';

const emptyForm = {
  name: '',
  area_acres: '',
  location_text: '',
  latitude: '',
  longitude: '',
  soil_type: '',
  soil_ph: '',
  soil_moisture: '',
  notes: '',
};

export default function LandManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run, clear } = useFormAction();
  const [lands, setLands] = useState<Land[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const load = () => api.getLands().then(setLands).catch(() => setLands([]));

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    load();
  }, [authLoading, user?.role]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (hasGoogleMapsApiKey && (!form.latitude || !form.longitude)) {
      setFormError('Please pick the land location on the map before saving.');
      return;
    }

    if (!hasGoogleMapsApiKey && !form.location_text.trim()) {
      setFormError('Please enter a location description.');
      return;
    }

    run(
      async () => {
        await api.createLand({
          name: form.name.trim(),
          area_acres: parseFloat(form.area_acres),
          location_text: form.location_text,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          soil_type: form.soil_type,
          soil_ph: form.soil_ph ? parseFloat(form.soil_ph) : null,
          soil_moisture: form.soil_moisture,
          notes: form.notes,
        });
        setShowForm(false);
        setForm(emptyForm);
        load();
      },
      { successMessage: 'Land saved successfully.' },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this land record?')) return;
    run(async () => {
      await api.deleteLand(id);
      load();
    }, { successMessage: 'Land deleted.' });
  };

  return (
    <DashboardLayout
      title="Land management"
      subtitle="Register plots, map locations, and track soil characteristics per field."
      navItems={farmerNav}
    >
      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          setFormError('');
          clear();
        }}
        className="dashboard-btn-primary mb-6"
      >
        {showForm ? 'Cancel' : 'Add land'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
          <DashboardFormCard title="Register land" description="Add plot details, location, and soil characteristics.">
            {!hasGoogleMapsApiKey && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Add your Google Maps key to <code className="font-mono">demo-main/.env</code> as{' '}
                <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code>, then restart{' '}
                <code className="font-mono">npm run dev</code>.
              </p>
            )}

            <DashboardField label="Land name">
              <DashboardInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Land name" />
            </DashboardField>
            <DashboardField label="Area (acres)">
              <DashboardInput required type="number" step="0.1" value={form.area_acres} onChange={(e) => setForm({ ...form, area_acres: e.target.value })} placeholder="Area (acres)" />
            </DashboardField>

            {hasGoogleMapsApiKey ? (
              <LandMapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                locationText={form.location_text}
                onLocationChange={(lat, lng, address) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    location_text: address || prev.location_text || 'Marked on map',
                  }))
                }
              />
            ) : (
              <DashboardField label="Location">
                <DashboardInput required value={form.location_text} onChange={(e) => setForm({ ...form, location_text: e.target.value })} placeholder="Village, district, state" />
              </DashboardField>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardField label="Soil type">
                <DashboardInput value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })} placeholder="Soil type" />
              </DashboardField>
              <DashboardField label="Soil pH">
                <DashboardInput type="number" step="0.1" value={form.soil_ph} onChange={(e) => setForm({ ...form, soil_ph: e.target.value })} placeholder="Soil pH" />
              </DashboardField>
            </div>
            <DashboardField label="Soil moisture">
              <DashboardInput value={form.soil_moisture} onChange={(e) => setForm({ ...form, soil_moisture: e.target.value })} placeholder="Soil moisture" />
            </DashboardField>
            <DashboardField label="Notes">
              <DashboardTextarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notes" />
            </DashboardField>

            {formError && <p className="text-sm text-red-600 font-medium">{formError}</p>}
            <FormFeedback error={error} success={success} loading={loading} loadingText="Saving..." />
            <DashboardFormActions>
              <DashboardButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save land'}
              </DashboardButton>
            </DashboardFormActions>
          </DashboardFormCard>
        </form>
      )}

      <DashboardRecordList emptyMessage="No land registered yet. Add your first plot above.">
        {lands.map((land) => (
          <div key={land.id}>
            <DashboardRecordCard
            icon={MapPin}
            title={land.name}
            subtitle={land.location_text || 'Location not set'}
            meta={[
              { label: 'Area', value: `${land.area_acres} acres`, icon: Ruler },
              { label: 'Soil', value: land.soil_type || '—', icon: Droplets },
              { label: 'pH', value: land.soil_ph != null ? String(land.soil_ph) : '—' },
            ]}
            actions={<RecordDeleteButton onClick={() => handleDelete(land.id)} disabled={loading} />}
          >
            {land.notes ? land.notes : undefined}
            </DashboardRecordCard>
          </div>
        ))}
      </DashboardRecordList>
    </DashboardLayout>
  );
}
