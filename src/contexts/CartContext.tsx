import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'oyedesi_guest_cart';

function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {}
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number, productObj?: Product) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(getGuestCart());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (user && user.role === 'customer') {
      setLoading(true);
      try {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            try {
              await api.addToCart(item.product_id, item.quantity);
            } catch {}
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }
        const cart = await api.getCart();
        setItems(cart);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(getGuestCart());
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId: number, quantity = 1, productObj?: Product) => {
    if (user && user.role === 'customer') {
      await api.addToCart(productId, quantity);
      await refresh();
    } else {
      const currentGuestCart = getGuestCart();
      const existingIdx = currentGuestCart.findIndex((i) => i.product_id === productId);
      if (existingIdx >= 0) {
        currentGuestCart[existingIdx].quantity += quantity;
      } else {
        let prod = productObj;
        if (!prod) {
          try {
            prod = await api.getProduct(productId);
          } catch {}
        }
        if (prod) {
          currentGuestCart.push({
            product_id: productId,
            quantity,
            product: prod,
          });
        }
      }
      saveGuestCart(currentGuestCart);
      setItems([...currentGuestCart]);
    }
  };

  const updateItem = async (productId: number, quantity: number) => {
    if (user && user.role === 'customer') {
      await api.updateCartItem(productId, quantity);
      await refresh();
    } else {
      let currentGuestCart = getGuestCart();
      if (quantity <= 0) {
        currentGuestCart = currentGuestCart.filter((i) => i.product_id !== productId);
      } else {
        const item = currentGuestCart.find((i) => i.product_id === productId);
        if (item) item.quantity = quantity;
      }
      saveGuestCart(currentGuestCart);
      setItems([...currentGuestCart]);
    }
  };

  const removeItem = async (productId: number) => {
    if (user && user.role === 'customer') {
      await api.removeCartItem(productId);
      await refresh();
    } else {
      const updated = getGuestCart().filter((i) => i.product_id !== productId);
      saveGuestCart(updated);
      setItems(updated);
    }
  };

  const clearCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setItems([]);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, loading, refresh, addItem, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
