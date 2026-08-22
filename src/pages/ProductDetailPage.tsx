import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Loader2, Plus, Minus, Check, ArrowLeft, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import type { Product, ProductReview } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const { items, addItem, updateItem, removeItem, refresh } = useCart();
  const { showCartToast, showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingBuyNow, setLoadingBuyNow] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const pid = parseInt(id, 10);
    api.getProduct(pid).then(setProduct).catch(() => setProduct(null));
    api.getProductReviews(pid).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  const cartItem = product ? items.find((i) => i.product_id === product.id) : null;

  const handleAddToCart = async () => {
    if (!product) return;
    setLoadingCart(true);
    try {
      await addItem(product.id, 1, product);
      const newQty = (cartItem?.quantity || 0) + 1;
      showCartToast(product.name, newQty);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Could not add to cart',
        message: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setLoadingCart(false);
    }
  };

  const handleUpdateQuantity = async (newQty: number) => {
    if (!product) return;
    setLoadingCart(true);
    try {
      if (newQty <= 0) {
        await removeItem(product.id);
        showToast({
          type: 'info',
          title: 'Item Removed',
          message: `${product.name} removed from cart.`,
        });
      } else {
        await updateItem(product.id, newQty);
        showCartToast(product.name, newQty);
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'Could not update quantity',
      });
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setLoadingBuyNow(true);
    try {
      if (!cartItem) {
        await addItem(product.id, 1, product);
      }
      if (!user) {
        showToast({
          type: 'info',
          title: 'Login Required',
          message: 'Please login to complete your order.',
        });
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      await refresh();
      navigate('/checkout');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Checkout error',
        message: 'Could not proceed to checkout',
      });
    } finally {
      setLoadingBuyNow(false);
    }
  };

  const handleReview = async () => {
    if (!product || !user) return;
    if (!comment.trim()) {
      showToast({ type: 'info', title: 'Review Required', message: 'Please write a brief comment.' });
      return;
    }
    setSubmittingReview(true);
    try {
      const r = await api.createReview(product.id, { rating, comment });
      setReviews([r, ...reviews]);
      setComment('');
      showToast({ type: 'success', title: 'Review Posted', message: 'Thank you for sharing your feedback!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error posting review', message: 'Please try again later' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-16 font-body text-neutral-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
        <span>Loading product details...</span>
      </div>
    );
  }

  const discounted = product.offer_percent > 0
    ? product.price * (1 - product.offer_percent / 100)
    : product.price;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-body">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-[#2D5A27] font-semibold mb-6 hover:underline active:scale-95 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to products</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-square">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover"
          />
          {cartItem && (
            <div className="absolute top-4 right-4 bg-[#2D5A27] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
              <Check className="w-4 h-4" />
              <span>{cartItem.quantity} in cart</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="page-label text-[#689F38]">{product.category}</span>
              {product.offer_percent > 0 && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                  {product.offer_percent}% OFF
                </span>
              )}
            </div>

            <h1 className="page-section-title mb-2 text-2xl md:text-3xl">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#2D5A27]">₹{discounted.toFixed(0)}</span>
              {product.offer_percent > 0 && (
                <span className="text-lg text-neutral-400 line-through">₹{product.price}</span>
              )}
            </div>

            <p className="page-body mb-4 font-semibold text-sm">
              Status:{' '}
              <span className={product.stock_quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
              </span>
            </p>

            {product.farmer_name && (
              <p className="mb-4 text-sm text-neutral-600">
                <span className="font-semibold text-[#0D212C]">Farmer / Source:</span> {product.farmer_name}
              </p>
            )}

            <p className="page-body mb-6 text-neutral-600 leading-relaxed">{product.description}</p>

            {product.average_rating && (
              <div className="flex items-center gap-1.5 mb-6 text-amber-500 font-semibold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{product.average_rating.toFixed(1)}</span>
                <span className="text-neutral-400 text-sm font-normal">({product.review_count} reviews)</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-100">
            {product.stock_quantity === 0 ? (
              <button disabled className="w-full rounded-full bg-neutral-200 text-neutral-500 py-3.5 font-semibold cursor-not-allowed">
                Out of Stock
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {cartItem ? (
                  <div className="flex items-center justify-between bg-[#2D5A27]/10 rounded-full p-2 border border-[#2D5A27]/20 flex-1">
                    <button
                      type="button"
                      disabled={loadingCart}
                      onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-white text-[#2D5A27] font-bold flex items-center justify-center shadow-sm hover:bg-[#2D5A27] hover:text-white active:scale-90 transition-all disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      {loadingCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="font-bold text-[#2D5A27] px-3">{cartItem.quantity} in cart</span>
                    <button
                      type="button"
                      disabled={loadingCart || cartItem.quantity >= product.stock_quantity}
                      onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-[#2D5A27] text-white font-bold flex items-center justify-center shadow-sm hover:bg-[#23471f] active:scale-90 transition-all disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      {loadingCart ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={loadingCart}
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full border-2 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white py-3.5 font-semibold active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loadingCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    <span>Add to Cart</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={loadingBuyNow}
                  onClick={handleBuyNow}
                  className="flex-1 rounded-full bg-[#2D5A27] hover:bg-[#23471f] text-white py-3.5 font-semibold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loadingBuyNow ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12 bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-[#0D212C]">Customer Reviews</h2>
        {user?.role === 'customer' && (
          <div className="mb-8 rounded-2xl border border-neutral-200 p-5 space-y-4 max-w-xl bg-neutral-50/50">
            <h3 className="font-semibold text-sm text-neutral-700">Leave your review</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-600 font-medium">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30"
              rows={3}
            />
            <button
              type="button"
              disabled={submittingReview}
              onClick={handleReview}
              className="rounded-full bg-[#2D5A27] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#23471f] active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Post Review</span>
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-neutral-500 text-sm">No reviews yet for this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-neutral-100 p-4 bg-neutral-50/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-[#0D212C]">{r.user_name}</p>
                  <span className="text-amber-500 font-bold text-sm">★ {r.rating}</span>
                </div>
                <p className="page-body text-neutral-700 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
