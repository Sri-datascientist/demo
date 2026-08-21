import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { FarmerProfile } from '../../types';

export default function FarmerManagementPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [editing, setEditing] = useState<FarmerProfile | null>(null);
  const [address, setAddress] = useState('');
  const [documents, setDocuments] = useState('');

  const load = () => api.adminFarmers().then(setFarmers).catch(() => setFarmers([]));
  useEffect(() => { load(); }, []);

  const verify = async (id: number, status: string) => {
    await api.adminVerifyFarmer(id, status);
    load();
  };

  const startEdit = (f: FarmerProfile) => {
    setEditing(f);
    setAddress(f.address);
    setDocuments(f.documents_json);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await api.adminUpdateFarmer(editing.id, { address, documents_json: documents });
    setEditing(null);
    load();
  };

  return (
    <DashboardLayout
      title="Farmer management"
      subtitle="Registered farmers, KYC status, verification, and profile records."
      navItems={adminNav}
    >
      <div className="space-y-4">
        {farmers.map((f) => (
          <div key={f.id} className="rounded-xl border p-5 bg-white flex flex-wrap justify-between gap-4">
            <div>
              <p className="font-bold">{f.full_name} — {f.farmer_code}</p>
              <p className="page-body text-sm">{f.email} | {f.phone}</p>
              <p className="text-sm capitalize">
                Status: <span className="font-semibold">{f.verification_status}</span>
                {f.kyc_status && (
                  <> · KYC: <span className="font-semibold">{f.kyc_status}</span></>
                )}
                {f.aadhaar_masked && (
                  <> · {f.aadhaar_masked}</>
                )}
              </p>
              {f.address && <p className="text-sm text-neutral-600 mt-1">{f.address}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => startEdit(f)} className="rounded-full border border-[#2D5A27] text-[#2D5A27] px-4 py-2 text-sm font-semibold">
                Edit
              </button>
              <button onClick={() => verify(f.id, 'verified')} className="rounded-full bg-[#2D5A27] text-white px-4 py-2 text-sm font-semibold">
                Approve
              </button>
              <button onClick={() => verify(f.id, 'rejected')} className="rounded-full border border-red-500 text-red-600 px-4 py-2 text-sm font-semibold">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="font-bold text-lg">Edit {editing.farmer_code}</h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Address"
            />
            <textarea
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-4 py-3 font-mono text-sm"
              placeholder="Documents JSON"
            />
            <div className="flex gap-3">
              <button onClick={saveEdit} className="flex-1 bg-[#2D5A27] text-white py-3 rounded-full font-semibold">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border py-3 rounded-full font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
