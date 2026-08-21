import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ArrowRight, ShoppingBag, Plus, Minus, Loader2, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import type { Product } from '../types';

const FALLBACK_INHOUSE_PRODUCTS: Product[] = [
  {
    id: 9901,
    name: 'OyeDesi Bio-Manure Supreme',
    category: 'Organic Inputs',
    description: 'Premium organic bio-manure enriched with beneficial microbes for soil health and root development.',
    price: 150,
    stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 10,
    created_at: '',
    updated_at: '',
  },
  {
    id: 9902,
    name: 'OyeDesi Neem Bio-Pesticide',
    category: 'Organic Inputs',
    description: '100% natural, eco-friendly neem-based pesticide to protect crops from pests without harmful residues.',
    price: 280,
    stock_quantity: 75,
    image_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 5,
    created_at: '',
    updated_at: '',
  },
  {
    id: 9903,
    name: 'OyeDesi Satvik Bio-Fertilizer',
    category: 'Organic Inputs',
    description: 'Microbial inoculation to enhance nutrient uptake, nitrogen fixation, and crop yield.',
    price: 190,
    stock_quantity: 150,
    image_url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 9904,
    name: 'OyeDesi Organic Potting Soil',
    category: 'Organic Inputs',
    description: 'Soil conditioning mix with vermicompost and coco peat for optimal plant growth.',
    price: 120,
    stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    farmer_name: 'OyeDesi',
    offer_percent: 12,
    created_at: '',
    updated_at: '',
  }
];

const coreProducts = [
  {
    title: 'Organic Inputs',
    description:
      'Production and supply of bio-manures, bio-fertilizers, bio-pesticides, and soil conditioners to restore soil fertility.',
  },
  {
    title: 'Market Access',
    description:
      'Enabling seamless supply chain linkages that directly connect farmers with buyers across national and global markets.',
  },
  {
    title: 'Agri-value Creation',
    description:
      'Setting up Primary Processing Centers (PPCs) and Secondary Processing Centers (SPCs) for value-added product development.',
  },
];

const valueChain = [
  {
    title: 'Input and Output',
    description:
      'Helping farmers and FPOs receive quality agricultural inputs, and market connect to their output.',
    imageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Post Harvest',
    description:
      'Providing certifications and testing facilities to farmers as well as getting post harvest facility loans through electronic receipts.',
    imageUrl:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Processing & Aggregation',
    description:
      'Extending institutional and private financing to processors, exporters, and traders against stored grains or cotton bales.',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Storage & Distribution',
    description:
      'Creating world-class storage and warehousing solutions for our partners to manage distribution systems across India.',
    imageUrl:
      'https://images.unsplash.com/photo-1566576721346-d4a3b4b93488?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Marketing & Consumption',
    description:
      'Loading, unloading, cleaning, packing, barcoding, transportation and private labeling support till first mile & last mile customers.',
    imageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const { items, addItem, updateItem, removeItem } = useCart();
  const { showCartToast, showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [offersOnly, setOffersOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productTypeTab, setProductTypeTab] = useState<'inhouse' | 'farmer'>('inhouse');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getProducts({
      category: category || undefined,
      search: search || undefined,
      offers_only: offersOnly,
    })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, offersOnly]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const isInHouse =
        !product.farmer_profile_id &&
        (!product.farmer_name ||
          product.farmer_name.toLowerCase() === 'oyedesi' ||
          product.farmer_name.toLowerCase() === 'oyedesi mill');

      if (productTypeTab === 'inhouse') {
        return isInHouse;
      } else {
        return !isInHouse;
      }
    });

    if (productTypeTab === 'inhouse' && filtered.length === 0) {
      return FALLBACK_INHOUSE_PRODUCTS;
    }
    return filtered;
  }, [products, productTypeTab]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      showToast({
        type: 'info',
        title: 'Login Required',
        message: 'Please login to add items to your cart.',
        action: { label: 'Go to Login', to: '/login' },
      });
      return;
    }

    setActionLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      await addItem(product.id, 1);
      const currentCartItem = items.find((i) => i.product_id === product.id);
      const newQty = (currentCartItem?.quantity || 0) + 1;
      showCartToast(product.name, newQty);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Could not add to cart',
        message: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleUpdateQuantity = async (product: Product, newQty: number) => {
    setActionLoading((prev) => ({ ...prev, [product.id]: true }));
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
      setActionLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="pb-20 font-body">
      <PageHeader
        title="Our"
        titleAccent="Products"
        subtitle="A one-stop solution for the Agri Value Chain—from farm inputs to market-ready Satvik produce."
      />

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-label mb-8">Core Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreProducts.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#689F38]/20 bg-[#689F38]/5 p-6 md:p-8 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-4 h-4 text-[#689F38]" />
                <h3 className="text-xl font-semibold text-[#2D5A27]">{item.title}</h3>
              </div>
              <p className="page-body text-[#273C46]/90">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-label mb-4">Satvik Produce</h2>
        
        <div className="flex border-b border-neutral-200 mb-8 gap-6">
          <button
            type="button"
            onClick={() => setProductTypeTab('inhouse')}
            className={`pb-4 text-lg font-semibold border-b-2 transition-all cursor-pointer ${
              productTypeTab === 'inhouse'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            In-House Inputs & Products
          </button>
          <button
            type="button"
            onClick={() => setProductTypeTab('farmer')}
            className={`pb-4 text-lg font-semibold border-b-2 transition-all cursor-pointer ${
              productTypeTab === 'farmer'
                ? 'border-[#2D5A27] text-[#2D5A27]'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Farmer Sourced Produce
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-neutral-200 px-5 py-3 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 transition-all"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-neutral-200 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 transition-all"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOffersOnly(!offersOnly)}
            className={`rounded-full px-5 py-3 font-semibold active:scale-95 transition-all cursor-pointer ${
              offersOnly ? 'bg-[#2D5A27] text-white shadow-md' : 'border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5'
            }`}
          >
            Offers only
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-neutral-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2D5A27]" />
            <span>Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="page-body py-8 text-center text-neutral-500">No products available in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const cartItem = items.find((i) => i.product_id === product.id);
              const isLoading = actionLoading[product.id];

              return (
                <article
                  key={product.id}
                  className="group rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] overflow-hidden relative bg-neutral-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {cartItem && (
                        <div className="absolute top-3 right-3 bg-[#2D5A27] text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5" />
                          <span>{cartItem.quantity} in cart</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex items-center justify-between">
                        <span className="page-label text-[#689F38]">{product.category}</span>
                        {product.offer_percent > 0 && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            {product.offer_percent}% OFF
                          </span>
                        )}
                      </div>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="mt-2 text-xl font-semibold text-[#2D5A27] hover:underline leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      {product.farmer_name && <p className="text-sm text-neutral-500 mt-1">By {product.farmer_name}</p>}
                      <p className="mt-3 page-body text-[#273C46]/90 line-clamp-2 text-sm">{product.description}</p>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 pt-0 border-t border-neutral-50 mt-auto">
                    <div className="flex items-baseline justify-between mb-3 mt-4">
                      <p className="text-xl font-bold text-[#0D212C]">
                        ₹{product.offer_percent > 0 ? (product.price * (1 - product.offer_percent / 100)).toFixed(0) : product.price}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Out of Stock'}
                      </p>
                    </div>

                    {!user ? (
                      <Link
                        to="/login"
                        className="w-full block text-center rounded-full border-2 border-[#2D5A27] text-[#2D5A27] py-2.5 font-semibold hover:bg-[#2D5A27] hover:text-white transition-all active:scale-95"
                      >
                        Login to Buy
                      </Link>
                    ) : product.stock_quantity === 0 ? (
                      <button
                        disabled
                        className="w-full rounded-full bg-neutral-200 text-neutral-500 py-3 font-semibold cursor-not-allowed text-center"
                      >
                        Out of Stock
                      </button>
                    ) : cartItem ? (
                      <div className="flex items-center justify-between bg-[#2D5A27]/10 rounded-full p-1.5 border border-[#2D5A27]/20 shadow-inner">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleUpdateQuantity(product, cartItem.quantity - 1)}
                          className="w-9 h-9 rounded-full bg-white text-[#2D5A27] font-bold flex items-center justify-center shadow-sm hover:bg-[#2D5A27] hover:text-white active:scale-90 transition-all disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                        </button>
                        <span className="font-bold text-[#2D5A27] text-sm px-2 flex items-center gap-1.5">
                          <span>{cartItem.quantity} in cart</span>
                        </span>
                        <button
                          type="button"
                          disabled={isLoading || cartItem.quantity >= product.stock_quantity}
                          onClick={() => handleUpdateQuantity(product, cartItem.quantity + 1)}
                          className="w-9 h-9 rounded-full bg-[#2D5A27] text-white font-bold flex items-center justify-center shadow-sm hover:bg-[#23471f] active:scale-90 transition-all disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAddToCart(product)}
                        className="w-full rounded-full bg-[#2D5A27] text-white py-3 px-4 font-semibold hover:bg-[#23471f] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <h2 className="page-label mb-8">Agri Value Chain</h2>
        <div className="flex flex-col gap-8">
          {valueChain.map((step, idx) => (
            <div
              key={step.title}
              className={`flex flex-col md:flex-row gap-6 md:gap-10 items-center ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md aspect-[16/10]">
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2D5A27] bg-white px-4 py-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#689F38]" />
                  <span className="text-base font-semibold text-[#2D5A27]">{step.title}</span>
                </div>
                <p className="page-body">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
