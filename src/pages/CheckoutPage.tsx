import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';

export default function CheckoutPage() {
  const { items, total, refresh } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 font-body text-center">
        <p className="page-body mb-4">No items to checkout</p>
        <Link to="/products" className="text-[#2D5A27] font-semibold hover:underline">Go to products</Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      showToast({ type: 'error', title: 'Address required', message: 'Please provide a shipping address.' });
      return;
    }

    setLoading(true);
    try {
      const order = await api.checkout(address, payment);
      await refresh();
      showToast({
        type: 'success',
        title: 'Order Placed!',
        message: `Order #${order.id} placed successfully.`,
      });
      navigate(`/dashboard/track-order?tracking=${order.tracking_number}`);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Checkout Failed',
        message: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 font-body pb-24">
      <h1 className="page-section-title mb-8">Checkout</h1>

      <div className="rounded-3xl border border-[#2D5A27]/20 p-6 mb-6 bg-[#689F38]/5 flex items-center justify-between shadow-sm">
        <div>
          <p className="font-semibold text-[#2D5A27] mb-1">{items.length} item(s) in order</p>
          <p className="text-[#273C46]/80 text-sm">Satvik Agri Value Chain Order</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Total Payable</p>
          <p className="text-2xl font-extrabold text-[#2D5A27]">₹{total.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-neutral-100 p-6 md:p-8 shadow-sm bg-white">
        <div>
          <label className="page-label flex items-center gap-2 mb-2 text-[#0D212C]">
            <MapPin className="w-4 h-4 text-[#2D5A27]" />
            <span>Shipping Address</span>
          </label>
          <textarea
            required
            rows={4}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address with door no, street, city, state, pincode..."
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3.5 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 transition-all"
          />
        </div>

        <div>
          <label className="page-label flex items-center gap-2 mb-2 text-[#0D212C]">
            <CreditCard className="w-4 h-4 text-[#2D5A27]" />
            <span>Payment Method</span>
          </label>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 transition-all font-semibold text-[#0D212C]"
          >
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
            <option value="card">Credit / Debit Card</option>
          </select>
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2D5A27] text-white py-4 font-bold text-base hover:bg-[#23471f] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Confirm & Place Order (₹{total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
