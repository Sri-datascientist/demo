import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Leaf,
  MapPin,
  Package,
  Sprout,
  Tractor,
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { ChecklistItem, InfoBox } from '../../components/dashboard/InfoBox';
import { QuickAction } from '../../components/dashboard/QuickAction';
import { StatCard, StatSection } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/dashboard/StatusBadge';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { FarmerDashboardSummary } from '../../types';

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FarmerDashboardSummary | null>(null);

  useEffect(() => {
    api.farmerDashboard().then(setSummary).catch(() => setSummary(null));
  }, []);

  const kycDone = summary?.kyc_status === 'verified';
  const verified = summary?.verification_status === 'verified';
  const hasLand = summary ? summary.total_land_acres > 0 : false;
  const hasCrops = summary ? summary.active_crops > 0 : false;

  return (
    <DashboardLayout
      title="Farmer overview"
      subtitle="Track your land, crops, advisories, and sales from one place."
      navItems={farmerNav}
    >
      <WelcomeBanner
        name={user?.full_name || 'Farmer'}
        detail={user?.email}
        badges={
          summary && (
            <>
              <StatusBadge status={summary.verification_status} />
              <StatusBadge status={summary.kyc_status} />
            </>
          )
        }
      />

      {summary && (
        <>
          <StatSection title="Farm summary" description="Live counts from your registered data.">
            <StatCard
              label="Total land"
              value={`${summary.total_land_acres.toFixed(1)} acres`}
              hint="Registered plots"
              icon={MapPin}
            />
            <StatCard label="Active crops" value={summary.active_crops} hint="In your registry" icon={Sprout} />
            <StatCard
              label="Advisory alerts"
              value={summary.advisory_alerts}
              hint="Unread recommendations"
              icon={BarChart3}
            />
            <StatCard
              label="Listings pending"
              value={summary.crop_selling_pending}
              hint="Awaiting hub review"
              icon={Package}
            />
          </StatSection>

          <StatSection title="Payments & verification" description="Settlement and account status.">
            <StatCard
              label="Payments pending"
              value={`₹${summary.payments_pending.toLocaleString('en-IN')}`}
              hint="Outstanding balance"
              icon={Banknote}
            />
            <StatCard
              label="Verification"
              value={summary.verification_status}
              hint="Admin review status"
              icon={Tractor}
            />
            <StatCard
              label="KYC status"
              value={summary.kyc_status.replace(/_/g, ' ')}
              hint="Aadhaar / identity"
              icon={AlertCircle}
            />
          </StatSection>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardPanel title="Quick actions" description="Common farm tasks." className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <QuickAction to="/farmer/land" label="Manage land" icon={MapPin} variant="primary" />
            <QuickAction to="/farmer/crops" label="Manage crops" icon={Leaf} />
            <QuickAction to="/farmer/selling" label="Sell crop" icon={Package} />
            <QuickAction to="/farmer/soil-health" label="Soil health" icon={Sprout} />
            <QuickAction to="/farmer/advisory" label="Advisory" icon={BarChart3} />
            <QuickAction to="/farmer/kyc" label="KYC" icon={AlertCircle} />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Setup checklist" description="Complete these to sell on Oyedesi.">
          <ChecklistItem done={kycDone} label="Complete KYC / Aadhaar" href="/farmer/kyc" />
          <ChecklistItem done={verified} label="Get profile verified" href="/farmer/profile" />
          <ChecklistItem done={hasLand} label="Register at least one land" href="/farmer/land" />
          <ChecklistItem done={hasCrops} label="Add crops to registry" href="/farmer/crops" />
          <ChecklistItem label="Submit a crop listing" href="/farmer/selling" />
        </DashboardPanel>
      </div>

      <InfoBox title="How selling works" variant="tip">
        Register your land and crops, submit a listing for quality check at the district hub, then
        receive payment after approval. Track soil reports and advisories here to improve yield and
        pricing.
      </InfoBox>

      {!summary && (
        <DashboardPanel title="Getting started" className="mt-4">
          <p className="text-sm text-[#5a6b63] mb-4">
            We could not load your dashboard summary. Complete your profile and add land to see live metrics.
          </p>
          <Link to="/farmer/profile" className="dashboard-btn-primary inline-flex">
            Complete profile
          </Link>
        </DashboardPanel>
      )}
    </DashboardLayout>
  );
}
