import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  ProductFormModal,
  emptyProductForm,
  productToForm,
  type ProductFormData,
} from '../../components/admin/ProductFormModal';
import { adminNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { Product } from '../../types';

export default function FarmerInventoryPage() {
  const [searchParams] = useSearchParams();
  const lowStockOnly = searchParams.get('lowStock') === '1';
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyProductForm());
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    api.adminInventory()
      .then((data) => {
        // Filter farmer products: has farmer_profile_id OR has farmer_name that is not empty/OyeDesi
        const filtered = data.filter(
          (p) =>
            p.farmer_profile_id ||
            (p.farmer_name &&
              p.farmer_name.toLowerCase() !== 'oyedesi' &&
              p.farmer_name.toLowerCase() !== 'oyedesi mill')
        );
        setProducts(filtered);
      })
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(productToForm(p));
    setShowCreate(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProductForm());
    setShowCreate(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setShowCreate(false);
  };

  const save = async () => {
    try {
      if (!form.farmer_name.trim()) {
        throw new Error('Farmer / source name is required for farmer products');
      }
      if (editingId) {
        await api.updateProduct(editingId, form);
        setMessage('Farmer product updated');
      } else {
        await api.createProduct(form);
        setMessage('Farmer product created');
      }
      closeModal();
      load();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api.deleteProduct(id);
    setMessage('Product deleted');
    load();
    setTimeout(() => setMessage(''), 3000);
  };

  const modalOpen = showCreate || editingId !== null;

  const visibleProducts = useMemo(
    () => (lowStockOnly ? products.filter((p) => p.stock_quantity <= 10) : products),
    [products, lowStockOnly],
  );

  return (
    <DashboardLayout
      title={lowStockOnly ? 'Farmer low stock review' : 'Farmer products management'}
      subtitle={
        lowStockOnly
          ? 'Farmer-sourced items with 10 or fewer units — restock or coordinate with farmers.'
          : 'Manage farmer-sourced produce, verification status, catalog pricing, and stock.'
      }
      navItems={adminNav}
    >
      {lowStockOnly && (
        <p className="mb-4 text-sm">
          <Link to="/admin/farmer-inventory" className="font-semibold text-[#2D5A27] hover:underline">
            ← View full farmer catalog
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <button
          onClick={openCreate}
          className="rounded-full bg-[#2D5A27] text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Farmer Product
        </button>
        {message && <span className="text-green-700 font-medium ml-2">{message}</span>}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-base">
          <thead className="bg-[#689F38]/10">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold">Offer</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Sourced From (Farmer)</th>
              <th className="p-4 font-semibold">Active</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#5a6b63]">
                  {lowStockOnly ? 'No low-stock farmer products.' : 'No farmer products in catalog.'}
                </td>
              </tr>
            ) : (
              visibleProducts.map((p) => (
                <tr key={p.id} className="border-t hover:bg-neutral-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">₹{p.price}</td>
                  <td className="p-4">{p.offer_percent > 0 ? `${p.offer_percent}%` : '—'}</td>
                  <td className={`p-4 font-semibold ${p.stock_quantity <= 10 ? 'text-red-600' : ''}`}>
                    {p.stock_quantity}
                  </td>
                  <td className="p-4 text-sm text-[#051A24] font-medium">{p.farmer_name || '—'}</td>
                  <td className="p-4">{p.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-4 space-x-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-[#2D5A27] font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id, p.name)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductFormModal
          title={editingId ? 'Edit farmer product' : 'Add new farmer product'}
          form={form}
          onChange={setForm}
          onSave={save}
          onCancel={closeModal}
          saveLabel={editingId ? 'Update' : 'Create'}
          productType="farmer"
        />
      )}
    </DashboardLayout>
  );
}
