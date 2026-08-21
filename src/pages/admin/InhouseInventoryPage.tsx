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

const DEFAULT_INHOUSE_PRODUCTS: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'OyeDesi Bio-Manure Supreme',
    category: 'Organic Inputs',
    description: 'Premium organic bio-manure enriched with beneficial microbes for soil health and root development.',
    price: 150,
    stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 10,
  },
  {
    name: 'OyeDesi Neem Bio-Pesticide',
    category: 'Organic Inputs',
    description: '100% natural, eco-friendly neem-based pesticide to protect crops from pests without harmful residues.',
    price: 280,
    stock_quantity: 75,
    image_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 5,
  },
  {
    name: 'OyeDesi Satvik Bio-Fertilizer',
    category: 'Organic Inputs',
    description: 'Microbial inoculation to enhance nutrient uptake, nitrogen fixation, and crop yield.',
    price: 190,
    stock_quantity: 150,
    image_url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 0,
  },
  {
    name: 'OyeDesi Organic Potting Soil',
    category: 'Organic Inputs',
    description: 'Soil conditioning mix with vermicompost and coco peat for optimal plant growth.',
    price: 120,
    stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 12,
  }
];

export default function InhouseInventoryPage() {
  const [searchParams] = useSearchParams();
  const lowStockOnly = searchParams.get('lowStock') === '1';
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyProductForm());
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const load = () => {
    api.adminInventory()
      .then((data) => {
        // Filter inhouse products: farmer_profile_id is null/undefined AND farmer_name is empty, OyeDesi, or Oyedesi Mill
        const filtered = data.filter(
          (p) =>
            !p.farmer_profile_id &&
            (!p.farmer_name ||
              p.farmer_name.toLowerCase() === 'oyedesi' ||
              p.farmer_name.toLowerCase() === 'oyedesi mill')
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
    const emptyForm = emptyProductForm();
    emptyForm.farmer_name = 'OyeDesi'; // Ensure set as OyeDesi
    setForm(emptyForm);
    setShowCreate(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setShowCreate(false);
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        farmer_name: 'OyeDesi', // Force in-house designation
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setMessage('In-house product updated');
      } else {
        await api.createProduct(payload);
        setMessage('In-house product created');
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

  const seedDefaultProducts = async () => {
    setIsSeeding(true);
    setMessage('Seeding default products...');
    try {
      for (const p of DEFAULT_INHOUSE_PRODUCTS) {
        await api.createProduct(p);
      }
      setMessage('Successfully seeded default in-house products!');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? `Seeding failed: ${err.message}` : 'Seeding failed');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const modalOpen = showCreate || editingId !== null;

  const visibleProducts = useMemo(
    () => (lowStockOnly ? products.filter((p) => p.stock_quantity <= 10) : products),
    [products, lowStockOnly],
  );

  return (
    <DashboardLayout
      title={lowStockOnly ? 'In-house low stock review' : 'In-house products management'}
      subtitle={
        lowStockOnly
          ? 'OyeDesi in-house items with 10 or fewer units — restock before they run out.'
          : 'Manage OyeDesi organic inputs, packaging material, and value chain inventory.'
      }
      navItems={adminNav}
    >
      {lowStockOnly && (
        <p className="mb-4 text-sm">
          <Link to="/admin/inhouse-inventory" className="font-semibold text-[#2D5A27] hover:underline">
            ← View full in-house catalog
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <button
          onClick={openCreate}
          className="rounded-full bg-[#2D5A27] text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
        >
          + Add In-House Product
        </button>

        {products.length === 0 && (
          <button
            onClick={seedDefaultProducts}
            disabled={isSeeding}
            className="rounded-full border border-[#2D5A27] text-[#2D5A27] px-6 py-3 font-semibold hover:bg-[#2D5A27]/5 disabled:opacity-50 transition-all"
          >
            {isSeeding ? 'Seeding...' : 'Seed Default In-House Products'}
          </button>
        )}

        {message && <span className="text-green-700 font-medium ml-2">{message}</span>}
      </div>

      {products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800">
          <h4 className="font-semibold text-lg mb-2">No In-House Products Found</h4>
          <p className="text-sm leading-relaxed mb-4">
            It looks like there are currently no OyeDesi in-house products (like bio-manure or organic inputs) registered in the system. You can add them one-by-one or click the button below to seed the database with standard default OyeDesi products.
          </p>
          <button
            onClick={seedDefaultProducts}
            disabled={isSeeding}
            className="bg-amber-800 text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-amber-900 transition-colors"
          >
            Seed default OyeDesi organic inputs
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-base">
          <thead className="bg-[#689F38]/10">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold">Offer</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Source</th>
              <th className="p-4 font-semibold">Active</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#5a6b63]">
                  {lowStockOnly ? 'No low-stock in-house products.' : 'No in-house products in catalog.'}
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
                  <td className="p-4 text-sm text-[#2D5A27] font-semibold">{p.farmer_name || 'OyeDesi'}</td>
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
          title={editingId ? 'Edit in-house product' : 'Add new in-house product'}
          form={form}
          onChange={setForm}
          onSave={save}
          onCancel={closeModal}
          saveLabel={editingId ? 'Update' : 'Create'}
          productType="inhouse"
        />
      )}
    </DashboardLayout>
  );
}
