import { useEffect, useState, type FormEvent } from 'react';
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
import { DashboardRecordList } from '../../components/dashboard/DashboardRecordCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFormAction } from '../../hooks/useFormAction';
import type { SupportTicket } from '../../types';

export default function FarmerSupportPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error, success, run } = useFormAction();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const load = () => api.farmerSupportTickets().then(setTickets).catch(() => setTickets([]));

  useEffect(() => {
    if (authLoading || user?.role !== 'farmer') return;
    load();
  }, [authLoading, user?.role]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () => {
        await api.createFarmerSupportTicket({
          category: 'farmer',
          subject: subject.trim(),
          description: description.trim(),
        });
        setSubject('');
        setDescription('');
        load();
      },
      { successMessage: 'Support ticket submitted.' },
    );
  };

  return (
    <DashboardLayout title="Support" navItems={farmerNav}>
      <form onSubmit={handleSubmit} className="max-w-2xl mb-10">
        <DashboardFormCard
          title="Raise a ticket"
          description="Describe your issue and our team will follow up."
        >
          <DashboardField label="Subject" htmlFor="support-subject">
            <DashboardInput
              id="support-subject"
              required
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </DashboardField>

          <DashboardField label="Description" htmlFor="support-description">
            <DashboardTextarea
              id="support-description"
              required
              placeholder="Describe your issue in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </DashboardField>

          <FormFeedback error={error} success={success} loading={loading} loadingText="Submitting..." />

          <DashboardFormActions>
            <DashboardButton type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit ticket'}
            </DashboardButton>
          </DashboardFormActions>
        </DashboardFormCard>
      </form>

      <div className="max-w-2xl">
        <h2 className="dashboard-section-title mb-4">Complaint tracking</h2>
        <DashboardRecordList emptyMessage="No support tickets yet.">
          {tickets.map((t) => (
            <div key={t.id} className="dashboard-record-card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <h3 className="dashboard-record-title">{t.subject}</h3>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm text-[#273c46]/85 leading-relaxed">{t.description}</p>
              {t.admin_response && (
                <p className="mt-3 text-sm rounded-lg bg-[#689F38]/10 border border-[#689F38]/15 px-4 py-3 text-[#1a3320]">
                  <span className="font-semibold text-[#2D5A27]">Response: </span>
                  {t.admin_response}
                </p>
              )}
            </div>
          ))}
        </DashboardRecordList>
      </div>
    </DashboardLayout>
  );
}
