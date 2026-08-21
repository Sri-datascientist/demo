import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardPanel } from '../../components/dashboard/DashboardPanel';
import { api } from '../../lib/api';
import { adminNav } from '../../lib/navItems';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadWarehouses = () => {
    api.adminWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;
    setLoading(true);
    setMessage('');
    try {
      await api.adminCreateWarehouse({ name, location });
      setName('');
      setLocation('');
      setMessage('Warehouse registered successfully!');
      loadWarehouses();
    } catch (err) {
      setMessage('Failed to register warehouse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Warehouse Network" subtitle="Register and manage hubs, storage facilities, and regional distribution points." navItems={adminNav}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Register Warehouse */}
        <div className="lg:col-span-4">
          <DashboardPanel title="Register Storage Hub">
            <form onSubmit={handleCreate} className="space-y-4 mt-3">
              {message && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  message.includes('success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1.5">Warehouse Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bangalore North Central"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1.5">Address / Location</label>
                <input
                  required
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Agara Sector 4, Outer Ring Road"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white py-3 font-semibold transition-colors disabled:opacity-60 text-sm mt-2"
              >
                {loading ? 'Registering...' : 'Register Warehouse'}
              </button>
            </form>
          </DashboardPanel>
        </div>

        {/* Right Side: Warehouses List */}
        <div className="lg:col-span-8">
          <DashboardPanel title="Active Storage Facilties">
            {warehouses.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4">No warehouses registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="p-4 rounded-2xl border border-neutral-200/80 bg-[#f8faf7] hover:shadow-sm transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-base text-neutral-800">{wh.name}</h4>
                        <span className="text-[10px] font-mono bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">ID: #{wh.id}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-4">{wh.location}</p>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono border-t pt-2">
                      Added: {new Date(wh.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>
    </DashboardLayout>
  );
}
