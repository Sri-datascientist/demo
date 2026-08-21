import { useEffect, useState, type FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardInput,
  DashboardSelect,
  DashboardTextarea,
} from '../../components/dashboard/DashboardForm';
import { DashboardRecordList, RecordDeleteButton } from '../../components/dashboard/DashboardRecordCard';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { Advisory } from '../../types';

export default function AdvisoryManagementPage() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [form, setForm] = useState({ advisory_type: 'soil', title: '', content: '' });

  const load = () => api.adminAdvisories().then(setAdvisories).catch(() => setAdvisories([]));
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.adminCreateAdvisory(form);
    setForm({ advisory_type: 'soil', title: '', content: '' });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this advisory?')) return;
    await api.adminDeleteAdvisory(id);
    load();
  };

  return (
    <DashboardLayout title="Advisory Management" navItems={adminNav}>
      <form onSubmit={handleSubmit} className="max-w-2xl mb-10">
        <DashboardFormCard
          title="Publish advisory"
          description="Share soil, crop, fertilizer, or weather guidance with farmers."
        >
          <DashboardField label="Type" htmlFor="advisory-type">
            <DashboardSelect
              id="advisory-type"
              value={form.advisory_type}
              onChange={(e) => setForm({ ...form, advisory_type: e.target.value })}
            >
              <option value="soil">Soil</option>
              <option value="crop">Crop</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="weather">Weather</option>
            </DashboardSelect>
          </DashboardField>

          <DashboardField label="Title" htmlFor="advisory-title">
            <DashboardInput
              id="advisory-title"
              required
              placeholder="Advisory headline"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </DashboardField>

          <DashboardField label="Content" htmlFor="advisory-content">
            <DashboardTextarea
              id="advisory-content"
              required
              placeholder="Detailed guidance for farmers"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
            />
          </DashboardField>

          <DashboardFormActions>
            <DashboardButton type="submit">Publish</DashboardButton>
          </DashboardFormActions>
        </DashboardFormCard>
      </form>

      <div className="max-w-2xl">
        <h2 className="dashboard-section-title mb-4">Published advisories</h2>
        <DashboardRecordList emptyMessage="No advisories published yet.">
          {advisories.map((a) => (
            <div key={a.id} className="dashboard-record-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#2D5A27]">
                    {a.advisory_type}
                  </span>
                  <h3 className="dashboard-record-title mt-1">{a.title}</h3>
                  <p className="text-sm text-[#273c46]/85 leading-relaxed mt-2">{a.content}</p>
                </div>
                <RecordDeleteButton onClick={() => remove(a.id)} />
              </div>
            </div>
          ))}
        </DashboardRecordList>
      </div>
    </DashboardLayout>
  );
}
