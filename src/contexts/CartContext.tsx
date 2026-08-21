import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'customer') {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await api.getCart();
      setItems(cart);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId: number, quantity = 1) => {
    await api.addToCart(productId, quantity);
    await refresh();
  };

  const updateItem = async (productId: number, quantity: number) => {
    await api.updateCartItem(productId, quantity);
    await refresh();
  };

  const removeItem = async (productId: number) => {
    await api.removeCartItem(productId);
    await refresh();
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, loading, refresh, addItem, updateItem, removeItem }}
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
