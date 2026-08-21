import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutUsPage from './pages/AboutUsPage';
import GalleryPage from './pages/GalleryPage';
import ContactUsPage from './pages/ContactUsPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OtpVerificationPage from './pages/auth/OtpVerificationPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import TrackOrderRedirect from './pages/TrackOrderRedirect';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerAddressesPage from './pages/CustomerAddressesPage';
import WalletPage from './pages/WalletPage';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';
import LandManagementPage from './pages/farmer/LandManagementPage';
import CropManagementPage from './pages/farmer/CropManagementPage';
import FarmerAdvisoryPage from './pages/farmer/FarmerAdvisoryPage';
import CropSellingPage from './pages/farmer/CropSellingPage';
import FarmerPaymentsPage from './pages/farmer/FarmerPaymentsPage';
import FarmerSupportPage from './pages/farmer/FarmerSupportPage';
import FarmerKycPage from './pages/farmer/FarmerKycPage';
import SoilHealthPage from './pages/farmer/SoilHealthPage';
import HubDashboardPage from './pages/hub/HubDashboardPage';
import HubCollectorPage from './pages/hub/HubCollectorPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import WarehouseManagementPage from './pages/admin/WarehouseManagementPage';
import DeliveryPartnersPage from './pages/admin/DeliveryPartnersPage';
import InhouseInventoryPage from './pages/admin/InhouseInventoryPage';
import FarmerInventoryPage from './pages/admin/FarmerInventoryPage';
import RevenueDetailPage from './pages/admin/RevenueDetailPage';
import FarmerManagementPage from './pages/admin/FarmerManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import CropApprovalPage from './pages/admin/CropApprovalPage';
import PaymentManagementPage from './pages/admin/PaymentManagementPage';
import AdvisoryManagementPage from './pages/admin/AdvisoryManagementPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />

            <Route path="/cart" element={<ProtectedRoute customerOnly><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute customerOnly><CheckoutPage /></ProtectedRoute>} />
            <Route path="/track-order" element={<ProtectedRoute customerOnly><TrackOrderRedirect /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute customerOnly><CustomerDashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute customerOnly><CustomerOrdersPage /></ProtectedRoute>} />
            <Route path="/dashboard/track-order" element={<ProtectedRoute customerOnly><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute customerOnly><CustomerProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/addresses" element={<ProtectedRoute customerOnly><CustomerAddressesPage /></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute customerOnly><WalletPage /></ProtectedRoute>} />

            <Route path="/farmer" element={<ProtectedRoute farmerOnly><FarmerDashboardPage /></ProtectedRoute>} />
            <Route path="/farmer/kyc" element={<ProtectedRoute farmerOnly><FarmerKycPage /></ProtectedRoute>} />
            <Route path="/farmer/profile" element={<ProtectedRoute farmerOnly><FarmerProfilePage /></ProtectedRoute>} />
            <Route path="/farmer/land" element={<ProtectedRoute farmerOnly><LandManagementPage /></ProtectedRoute>} />
            <Route path="/farmer/soil-health" element={<ProtectedRoute farmerOnly><SoilHealthPage /></ProtectedRoute>} />
            <Route path="/farmer/crops" element={<ProtectedRoute farmerOnly><CropManagementPage /></ProtectedRoute>} />
            <Route path="/farmer/advisory" element={<ProtectedRoute farmerOnly><FarmerAdvisoryPage /></ProtectedRoute>} />
            <Route path="/farmer/selling" element={<ProtectedRoute farmerOnly><CropSellingPage /></ProtectedRoute>} />
            <Route path="/farmer/payments" element={<ProtectedRoute farmerOnly><FarmerPaymentsPage /></ProtectedRoute>} />
            <Route path="/farmer/support" element={<ProtectedRoute farmerOnly><FarmerSupportPage /></ProtectedRoute>} />

            <Route path="/hub" element={<ProtectedRoute hubOnly><HubDashboardPage /></ProtectedRoute>} />
            <Route path="/hub/collector" element={<ProtectedRoute hubOnly><HubCollectorPage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/warehouses" element={<ProtectedRoute adminOnly><WarehouseManagementPage /></ProtectedRoute>} />
            <Route path="/admin/delivery-partners" element={<ProtectedRoute adminOnly><DeliveryPartnersPage /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute adminOnly><FarmerManagementPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/crop-listings" element={<ProtectedRoute adminOnly><CropApprovalPage /></ProtectedRoute>} />
            <Route path="/admin/inhouse-inventory" element={<ProtectedRoute adminOnly><InhouseInventoryPage /></ProtectedRoute>} />
            <Route path="/admin/farmer-inventory" element={<ProtectedRoute adminOnly><FarmerInventoryPage /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><InhouseInventoryPage /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute adminOnly><PaymentManagementPage /></ProtectedRoute>} />
            <Route path="/admin/advisory" element={<ProtectedRoute adminOnly><AdvisoryManagementPage /></ProtectedRoute>} />
            <Route path="/admin/submissions" element={<ProtectedRoute adminOnly><AdminSubmissionsPage /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute adminOnly><RevenueDetailPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><RevenueDetailPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
