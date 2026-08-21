import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Logo } from './Logo';

const navLinks = [
  { label: 'Products', path: '/products' },
  { label: 'About us', path: '/about' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact us', path: '/contact' },
];

export function Navbar() {
  const location = useLocation();
  const { user, logout, isAdmin, isFarmer, isDistrictHub } = useAuth();
  const { count } = useCart();
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const linkClass = (path: string) =>
    `text-base font-semibold transition-all duration-200 active:scale-95 ${
      location.pathname === path ? 'text-[#2D5A27] font-bold' : 'text-[#4a5568] hover:text-[#2D5A27]'
    }`;

  return (
    <header className="relative z-50 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-100 sticky top-0 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-8 py-3.5 max-w-7xl mx-auto font-body gap-4">
        <Logo size="md" linkToHome className="md:h-11 hover:opacity-90 transition-opacity" />

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(({ label, path }) => (
            <Link key={path} to={path} className={linkClass(path)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-full hover:bg-[#689F38]/15 text-[#2D5A27] active:scale-90 transition-transform"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {count > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 bg-[#2D5A27] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${
                        isBouncing ? 'scale-125 bg-[#689F38]' : 'scale-100'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to={isAdmin ? '/admin' : isDistrictHub ? '/hub' : isFarmer ? '/farmer' : '/dashboard'}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#2D5A27]/30 text-[#2D5A27] font-semibold text-sm hover:bg-[#689F38]/10 active:scale-95 transition-all"
              >
                <User className="w-4 h-4" />
                {isAdmin ? 'Admin' : isDistrictHub ? 'District Hub' : isFarmer ? 'Farmer' : 'Dashboard'}
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#4a5568] hover:text-[#2D5A27] active:scale-95 transition-all px-2 py-1"
              >
                <LogOut className="w-4 h-4 sm:hidden" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm md:text-base font-semibold text-[#4a5568] hover:text-[#2D5A27] px-3 py-1.5 rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full px-4 md:px-5 py-2 text-sm md:text-base font-semibold bg-[#2D5A27] text-white hover:bg-[#23471f] active:scale-95 transition-all shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="lg:hidden flex justify-center gap-4 px-4 pb-3 overflow-x-auto">
        {navLinks.map(({ label, path }) => (
          <Link key={path} to={path} className={`text-sm whitespace-nowrap ${linkClass(path)}`}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
