import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { User } from '../../types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const load = () => api.adminUsers().then(setUsers).catch(() => setUsers([]));
  useEffect(() => { load(); }, []);

  const startEdit = (u: User) => {
    setEditing(u);
    setFullName(u.full_name);
    setPhone(u.phone || '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    await api.adminUpdateUser(editing.id, { full_name: fullName, phone });
    setEditing(null);
    load();
  };

  const remove = async (u: User) => {
    if (!confirm(`Delete customer ${u.full_name}? Orders will be removed.`)) return;
    await api.adminDeleteUser(u.id);
    load();
  };

  return (
    <DashboardLayout
      title="Customer management"
      subtitle="Registered buyers, contact details, and account administration."
      navItems={adminNav}
    >
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#689F38]/10">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Joined</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{u.full_name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.phone || '—'}</td>
                <td className="p-4 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-4 space-x-3">
                  <button onClick={() => startEdit(u)} className="text-[#2D5A27] font-semibold hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(u)} className="text-red-600 font-semibold hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">Edit {editing.email}</h3>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Full name"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Phone"
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
