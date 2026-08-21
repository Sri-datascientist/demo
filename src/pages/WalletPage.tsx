import { useEffect, useState } from 'react';
import { Gift, Star } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import { StatCard } from '../components/dashboard/StatCard';
import { customerNav } from '../lib/navItems';
import { api } from '../lib/api';
import type { Wallet } from '../types';

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    api.getWallet().then(setWallet).catch(() => setWallet(null));
  }, []);

  return (
    <DashboardLayout title="Wallet & Rewards" navItems={customerNav}>
      {wallet && (
        <div className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="Loyalty points" value={wallet.points} hint="Earn points on every order" icon={Star} />
            <StatCard
              label="Loyalty tier"
              value={wallet.loyalty_tier}
              hint="Bronze → Silver → Gold"
              icon={Gift}
            />
          </div>

          <DashboardPanel
            title="Offers & loyalty"
            description="Active benefits on your Oyedesi account"
          >
            <ul className="space-y-2 text-[0.9375rem] text-[#273c46] leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[#689F38] font-bold">•</span>
                10% off on first order (new customers)
              </li>
              <li className="flex gap-2">
                <span className="text-[#689F38] font-bold">•</span>
                Double points on organic grains category
              </li>
              <li className="flex gap-2">
                <span className="text-[#689F38] font-bold">•</span>
                Free delivery on orders above ₹500
              </li>
            </ul>
          </DashboardPanel>
        </div>
      )}
    </DashboardLayout>
  );
}
