import { useEffect, useState, type FormEvent } from 'react';
import { MapPin } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  DashboardButton,
  DashboardCheckbox,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
} from '../components/dashboard/DashboardForm';
import { DashboardRecordCard, RecordDeleteButton } from '../components/dashboard/DashboardRecordCard';
import { customerNav } from '../lib/navItems';
import { api } from '../lib/api';
import type { Address } from '../types';

const emptyForm = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  is_default: false,
};

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.getAddresses().then(setAddresses).catch(() => setAddresses([]));
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.createAddress(form);
    setForm(emptyForm);
    load();
  };

  return (
    <DashboardLayout title="Addresses" navItems={customerNav}>
      <form onSubmit={handleSubmit} className="max-w-2xl mb-10">
        <DashboardFormCard
          title="Add address"
          description="Save delivery locations for faster checkout."
          className="mb-0"
        >
          <DashboardField label="Label" htmlFor="address-label">
            <DashboardInput
              id="address-label"
              placeholder="Home, Office, Farm…"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </DashboardField>

          <DashboardField label="Address line 1" htmlFor="address-line1">
            <DashboardInput
              id="address-line1"
              required
              placeholder="Street, building, area"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
          </DashboardField>

          <DashboardField label="Address line 2" htmlFor="address-line2">
            <DashboardInput
              id="address-line2"
              placeholder="Apartment, landmark (optional)"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
          </DashboardField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DashboardField label="City" htmlFor="address-city">
              <DashboardInput
                id="address-city"
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </DashboardField>
            <DashboardField label="Pincode" htmlFor="address-pincode">
              <DashboardInput
                id="address-pincode"
                required
                placeholder="560041"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </DashboardField>
          </div>

          <DashboardField label="State" htmlFor="address-state">
            <DashboardInput
              id="address-state"
              placeholder="Karnataka"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </DashboardField>

          <DashboardCheckbox
            checked={form.is_default}
            onChange={(is_default) => setForm({ ...form, is_default })}
          >
            Set as default address
          </DashboardCheckbox>

          <DashboardFormActions>
            <DashboardButton type="submit">Add address</DashboardButton>
          </DashboardFormActions>
        </DashboardFormCard>
      </form>

      <div className="max-w-2xl">
        <h2 className="dashboard-section-title mb-4">Saved addresses</h2>
        {addresses.length === 0 ? (
          <p className="dashboard-empty-state">No saved addresses yet.</p>
        ) : (
          <div className="dashboard-record-list">
            {addresses.map((a) => (
              <DashboardRecordCard
                key={a.id}
                title={a.label}
                subtitle={[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                icon={MapPin}
                actions={
                  <>
                    {a.is_default && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/60">
                        Default
                      </span>
                    )}
                    <RecordDeleteButton onClick={() => api.deleteAddress(a.id).then(load)} />
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
