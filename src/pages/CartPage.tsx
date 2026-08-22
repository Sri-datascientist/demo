import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, total, loading, updateItem, removeItem } = useCart();
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdate = async (productId: number, newQty: number) => {
    setUpdatingId(productId);
    try {
      if (newQty <= 0) {
        await removeItem(productId);
        showToast({ type: 'info', title: 'Item Removed', message: 'Item was removed from cart' });
      } else {
        await updateItem(productId, newQty);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Cart update failed', message: 'Could not update quantity' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: number, productName: string) => {
    setUpdatingId(productId);
    try {
      await removeItem(productId);
      showToast({ type: 'info', title: 'Item Removed', message: `${productName} was removed from cart` });
    } catch (err) {
      showToast({ type: 'error', title: 'Could not remove item' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      showToast({
        type: 'info',
        title: 'Login Required',
        message: 'Please login or create an account to place your order.',
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-4xl mx-auto px-6 py-16 font-body text-neutral-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
        <span>Loading cart...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-body pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#2D5A27]/10 text-[#2D5A27] rounded-2xl">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="page-section-title">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl border-2 border-dashed border-neutral-200 bg-white shadow-sm">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#0D212C] mb-2">Your cart is empty</h3>
          <p className="page-body text-neutral-500 mb-6 max-w-md mx-auto">
            Looks like you haven't added any Satvik produce or organic inputs to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#2D5A27] text-white px-8 py-3.5 font-semibold hover:bg-[#23471f] active:scale-95 transition-all shadow-md"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {items.map((item) => {
              const isUpdating = updatingId === item.product_id;
              const subtotal = item.product.price * item.quantity;

              return (
                <div
                  key={item.product_id}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl border border-neutral-100 p-4 md:p-5 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-20 h-20 rounded-xl object-cover border border-neutral-100 bg-neutral-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <Link to={`/products/${item.product_id}`} className="hover:underline">
                        <h3 className="text-base md:text-lg font-bold text-[#0D212C] leading-snug">{item.product.name}</h3>
                      </Link>
                      <p className="text-[#2D5A27] font-semibold text-sm mt-0.5">₹{item.product.price} / item</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-neutral-100 rounded-full p-1 border border-neutral-200">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdate(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white text-[#2D5A27] font-bold flex items-center justify-center shadow-sm hover:bg-[#2D5A27] hover:text-white active:scale-90 transition-all disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="font-bold text-sm text-[#0D212C] px-2 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={isUpdating || item.quantity >= item.product.stock_quantity}
                        onClick={() => handleUpdate(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-[#2D5A27] text-white font-bold flex items-center justify-center shadow-sm hover:bg-[#23471f] active:scale-90 transition-all disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="font-bold text-lg text-[#0D212C]">₹{subtotal.toFixed(2)}</p>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleRemove(item.product_id, item.product.name)}
                        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-semibold mt-0.5 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-neutral-500">Order Subtotal</p>
              <p className="text-2xl font-extrabold text-[#2D5A27]">₹{total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2D5A27] text-white px-9 py-4 font-bold text-base hover:bg-[#23471f] active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
