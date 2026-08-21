import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CopyrightBar } from './CopyrightBar';
import { BottomNav } from './BottomNav';
import { WhatsAppWidget } from './WhatsAppWidget';

const DASHBOARD_PREFIXES = ['/farmer', '/dashboard', '/admin', '/hub'];

export function Layout() {
  const { pathname } = useLocation();
  const showBottomNav = !DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white relative selection:bg-[#051A24]/10 selection:text-[#051A24]">
          <Navbar />
          <main>
            <Outlet />
          </main>
          {!isDashboard && <Footer />}
          {!isDashboard && <CopyrightBar />}
          {showBottomNav && <BottomNav />}
          {!isDashboard && <WhatsAppWidget />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

