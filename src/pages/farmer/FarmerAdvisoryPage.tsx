import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { Advisory } from '../../types';

const typeLabels: Record<string, string> = {
  soil: 'Soil recommendations',
  crop: 'Crop suggestions',
  fertilizer: 'Fertilizer advice',
  weather: 'Weather alerts',
};

export default function FarmerAdvisoryPage() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);

  const load = () => api.getFarmerAdvisories().then(setAdvisories).catch(() => setAdvisories([]));
  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.markAdvisoryRead(id);
    load();
  };

  return (
    <DashboardLayout title="AI Advisory" navItems={farmerNav}>
      <p className="page-body mb-6">Soil, crop, fertilizer and weather advisories for your farm.</p>
      <div className="space-y-4">
        {advisories.map((a) => (
          <div key={a.id} className={`rounded-xl border p-5 bg-white ${!a.is_read ? 'border-[#2D5A27]/40 bg-[#689F38]/5' : ''}`}>
            <div className="flex justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase text-[#2D5A27]">{typeLabels[a.advisory_type] || a.advisory_type}</span>
              {!a.is_read && (
                <button onClick={() => markRead(a.id)} className="text-sm font-semibold text-[#2D5A27]">Mark read</button>
              )}
            </div>
            <h3 className="font-bold text-lg">{a.title}</h3>
            <p className="page-body mt-2">{a.content}</p>
          </div>
        ))}
        {advisories.length === 0 && <p className="page-body">No advisories yet.</p>}
      </div>
    </DashboardLayout>
  );
}
