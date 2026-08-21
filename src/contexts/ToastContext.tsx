import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ToastType = 'success' | 'error' | 'info' | 'cart';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    to: string;
  };
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  showCartToast: (productName: string, count?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev.slice(-2), newToast]); // max 3 visible

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showCartToast = useCallback((productName: string, count = 1) => {
    showToast({
      type: 'cart',
      title: 'Added to Cart!',
      message: `${productName} (${count} in cart)`,
      action: {
        label: 'View Cart',
        to: '/cart',
      },
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showCartToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700/50'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700/50'
                : toast.type === 'cart'
                ? 'bg-[#0D212C]/95 text-white border-[#689F38]/40 shadow-[#689F38]/10'
                : 'bg-slate-900/90 text-white border-slate-700/50'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'cart' ? (
                <div className="w-8 h-8 rounded-full bg-[#689F38] flex items-center justify-center text-white">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-neutral-300 mt-0.5 truncate">{toast.message}</p>
              )}
              {toast.action && (
                <Link
                  to={toast.action.to}
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex items-center text-xs font-semibold text-[#8BC34A] hover:underline mt-2"
                >
                  {toast.action.label} &rarr;
                </Link>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
