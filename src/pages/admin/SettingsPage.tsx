import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { OurAddressSection } from '../../components/OurAddressSection';
import { adminNav } from '../../lib/navItems';
import { COMPANY_CONTACT } from '../../lib/companyContact';

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" navItems={adminNav}>
      <div className="max-w-2xl space-y-6">
        <DashboardPanel title="Company contact" description={COMPANY_CONTACT.companyName}>
          <OurAddressSection title="Our Address" />
        </DashboardPanel>

        <DashboardPanel title="Roles & permissions">
          <p className="text-[0.9375rem] text-[#273c46] leading-relaxed">
            Admin, Farmer, Customer, and District Hub roles are configured. Extend RBAC here when needed.
          </p>
        </DashboardPanel>

        <DashboardPanel title="Notifications">
          <p className="text-[0.9375rem] text-[#273c46] leading-relaxed">
            Email, SMS, and push notification providers can be integrated via environment variables.
          </p>
        </DashboardPanel>

        <DashboardPanel title="System configuration">
          <ul className="space-y-2 text-[0.9375rem] text-[#273c46] leading-relaxed">
            <li className="flex gap-2">
              <span className="text-[#689F38] font-bold">•</span>
              OTP: configure SMTP/SMS in backend `.env`
            </li>
            <li className="flex gap-2">
              <span className="text-[#689F38] font-bold">•</span>
              Maps: add Google Maps API key for land location picker
            </li>
            <li className="flex gap-2">
              <span className="text-[#689F38] font-bold">•</span>
              Payments: integrate Razorpay/Stripe for settlements
            </li>
          </ul>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
