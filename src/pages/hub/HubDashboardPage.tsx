import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Clock, ListOrdered, XCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { InfoBox } from '../../components/dashboard/InfoBox';
import { QuickAction } from '../../components/dashboard/QuickAction';
import { StatCard, StatSection } from '../../components/dashboard/StatCard';
import { hubNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { HubDashboardSummary } from '../../types';

const WORKFLOW_STEPS = [
  { step: '1', title: 'Review submissions', detail: 'Farmers submit crop listings from their dashboard.' },
  { step: '2', title: 'Schedule inspection', detail: 'Assign a date and notes for field or hub visit.' },
  { step: '3', title: 'Grade quality', detail: 'Assign Grade A, B, or C — or reject if standards are not met.' },
  { step: '4', title: 'Approve for sale', detail: 'Approved listings appear on the customer marketplace.' },
];

export default function HubDashboardPage() {
  const [summary, setSummary] = useState<HubDashboardSummary | null>(null);

  useEffect(() => {
    api.hubDashboard().then(setSummary).catch(() => setSummary(null));
  }, []);

  return (
    <DashboardLayout
      title="District hub"
      subtitle="Quality collection and crop grading for farmers in your district."
      navItems={hubNav}
    >
      {summary && (
        <StatSection title="Inspection queue" description="Your district hub workload this week.">
          <StatCard
            label="Pending inspections"
            value={summary.pending_inspections}
            hint="Needs scheduling"
            icon={Clock}
          />
          <StatCard
            label="Scheduled today"
            value={summary.scheduled_today}
            hint="On your calendar"
            icon={ClipboardList}
          />
          <StatCard
            label="Approved (7 days)"
            value={summary.approved_this_week}
            hint="Passed QC"
            icon={CheckCircle2}
          />
          <StatCard
            label="Rejected (7 days)"
            value={summary.rejected_this_week}
            hint="Did not meet grade"
            icon={XCircle}
          />
        </StatSection>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardPanel
          title="Quality collector"
          description="Open the tool to schedule visits and assign grades."
          className="lg:col-span-1"
        >
          <QuickAction
            to="/hub/collector"
            label="Open collector"
            icon={ClipboardList}
            variant="primary"
          />
          <p className="mt-4 text-sm text-[#5a6b63] leading-relaxed">
            Filter by status, pick a listing, schedule inspection, then record the final grade and notes
            for the farmer.
          </p>
        </DashboardPanel>

        <DashboardPanel
          title="Grading workflow"
          description="Standard steps for every crop listing."
          className="lg:col-span-2"
        >
          <ol className="space-y-3">
            {WORKFLOW_STEPS.map((item) => (
              <li key={item.step} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef3f0] text-xs font-bold text-[#2D5A27]">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-[#1a3320]">{item.title}</p>
                  <p className="text-[#5a6b63] mt-0.5">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </DashboardPanel>
      </div>

      <InfoBox title="Grade reference" icon={ListOrdered} variant="tip">
        <strong>Grade A</strong> — premium quality, best price band.{' '}
        <strong>Grade B</strong> — standard market quality.{' '}
        <strong>Grade C</strong> — basic grade, suitable for bulk or processing. Rejected listings
        return to the farmer with your inspection notes.
      </InfoBox>
    </DashboardLayout>
  );
}
