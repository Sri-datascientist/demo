import type { Product } from '../../types';

export type ProductFormData = {
  name: string;
  category: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
  farmer_name: string;
  offer_percent: number;
};

export const emptyProductForm = (): ProductFormData => ({
  name: '',
  category: 'Grains',
  description: '',
  price: 0,
  stock_quantity: 0,
  image_url: '',
  is_active: true,
  farmer_name: '',
  offer_percent: 0,
});

export function productToForm(p: Product): ProductFormData {
  return {
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    stock_quantity: p.stock_quantity,
    image_url: p.image_url,
    is_active: p.is_active,
    farmer_name: p.farmer_name || '',
    offer_percent: p.offer_percent || 0,
  };
}

export function ProductFormModal({
  title,
  form,
  onChange,
  onSave,
  onCancel,
  saveLabel = 'Save',
  productType = 'inhouse',
}: {
  title: string;
  form: ProductFormData;
  onChange: (f: ProductFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  productType?: 'inhouse' | 'farmer';
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-[#2D5A27]">{title}</h3>
        <input
          placeholder="Product name"
          required
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className="w-full border rounded-xl px-4 py-3"
        />
        <input
          placeholder="Category"
          required
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value })}
          className="w-full border rounded-xl px-4 py-3"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={3}
          className="w-full border rounded-xl px-4 py-3"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Price (₹)"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => onChange({ ...form, price: Number(e.target.value) })}
            className="border rounded-xl px-4 py-3"
          />
          <input
            type="number"
            placeholder="Stock"
            min={0}
            value={form.stock_quantity}
            onChange={(e) => onChange({ ...form, stock_quantity: Number(e.target.value) })}
            className="border rounded-xl px-4 py-3"
          />
        </div>
        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => onChange({ ...form, image_url: e.target.value })}
          className="w-full border rounded-xl px-4 py-3"
        />
        {productType === 'farmer' && (
          <input
            placeholder="Farmer / source name"
            required
            value={form.farmer_name}
            onChange={(e) => onChange({ ...form, farmer_name: e.target.value })}
            className="w-full border rounded-xl px-4 py-3"
          />
        )}
        <input
          type="number"
          placeholder="Offer %"
          min={0}
          max={100}
          value={form.offer_percent}
          onChange={(e) => onChange({ ...form, offer_percent: Number(e.target.value) })}
          className="w-full border rounded-xl px-4 py-3"
        />
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
          />
          Active (visible on storefront)
        </label>
        <div className="flex gap-3 pt-2">
          <button onClick={onSave} className="flex-1 bg-[#2D5A27] text-white py-3 rounded-full font-semibold">
            {saveLabel}
          </button>
          <button onClick={onCancel} className="flex-1 border py-3 rounded-full font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
