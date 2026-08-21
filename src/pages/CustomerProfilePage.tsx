import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
  DashboardReadOnlyField,
} from '../components/dashboard/DashboardForm';
import { customerNav } from '../lib/navItems';
import { api } from '../lib/api';
import type { User } from '../types';

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.customerProfile().then((p) => {
      setProfile(p);
      setFullName(p.full_name);
      setPhone(p.phone);
    });
  }, []);

  const handleSave = async () => {
    const updated = await api.updateCustomerProfile({ full_name: fullName, phone });
    setProfile(updated);
    setMessage('Profile updated successfully.');
  };

  if (!profile) {
    return (
      <DashboardLayout title="Profile" navItems={customerNav}>
        Loading...
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" navItems={customerNav}>
      <DashboardFormCard
        title="Account details"
        description="Update your personal information used for orders and delivery."
        className="max-w-2xl"
      >
        <DashboardReadOnlyField label="Email" value={profile.email} />

        <DashboardField label="Full name" htmlFor="profile-full-name">
          <DashboardInput
            id="profile-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </DashboardField>

        <DashboardField label="Phone" htmlFor="profile-phone">
          <DashboardInput
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </DashboardField>

        {message && (
          <p className="text-sm text-green-800 font-medium rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            {message}
          </p>
        )}

        <DashboardFormActions>
          <DashboardButton type="button" onClick={handleSave}>
            Save changes
          </DashboardButton>
        </DashboardFormActions>
      </DashboardFormCard>
    </DashboardLayout>
  );
}
