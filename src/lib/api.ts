import type {
  Address,
  Advisory,
  AnalyticsSummary,
  AuthResponse,
  CartItem,
  Crop,
  CropListing,
  FarmerDashboardSummary,
  FarmerProfile,
  HubDashboardSummary,
  KycStatus,
  Land,
  Order,
  Payment,
  Product,
  ProductReview,
  SoilHealthReport,
  SupportTicket,
  User,
  Wallet,
  AccountType,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('oyedesi_token');
}

function formatError(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(', ');
  return 'Request failed';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('oyedesi_token');
    window.dispatchEvent(new CustomEvent('oyedesi:auth-expired'));
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(formatError(err.detail));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),

  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
  }) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string; account_type?: AccountType }) =>
    request<AuthResponse>('/api/auth/login/json', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<User>('/api/auth/me'),

  updateMe: (data: { full_name?: string; phone?: string }) =>
    request<User>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  sendOtp: (email: string, purpose = 'verify') =>
    request<{ message: string; otp_code?: string }>('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  verifyOtp: (email: string, code: string, purpose = 'verify') =>
    request<{ message: string; is_verified: boolean }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    }),

  getCategories: () => request<string[]>('/api/products/categories'),

  getProducts: (params?: { category?: string; search?: string; offers_only?: boolean; product_type?: 'inhouse' | 'farmer' }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    if (params?.offers_only) q.set('offers_only', 'true');
    if (params?.product_type) q.set('product_type', params.product_type);
    const qs = q.toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (id: number) => request<Product>(`/api/products/${id}`),

  getProductReviews: (id: number) => request<ProductReview[]>(`/api/products/${id}/reviews`),

  createProduct: (data: Partial<Product>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: number, data: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id: number) =>
    request<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),

  getCart: () => request<CartItem[]>('/api/cart'),

  addToCart: (product_id: number, quantity = 1) =>
    request<CartItem>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
    }),

  updateCartItem: (product_id: number, quantity: number) =>
    request<CartItem>(`/api/cart/items/${product_id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (product_id: number) =>
    request<{ ok: boolean }>(`/api/cart/items/${product_id}`, { method: 'DELETE' }),

  checkout: (shipping_address: string, payment_method = 'cod') =>
    request<Order>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ shipping_address, payment_method }),
    }),

  myOrders: () => request<Order[]>('/api/orders/my'),

  trackOrder: (tracking_number: string) =>
    request<Order>(`/api/orders/track/${encodeURIComponent(tracking_number)}`),

  getOrder: (id: number) => request<Order>(`/api/orders/${id}`),

  customerProfile: () => request<User>('/api/customer/profile'),

  updateCustomerProfile: (data: { full_name?: string; phone?: string }) =>
    request<User>('/api/customer/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getAddresses: () => request<Address[]>('/api/customer/addresses'),

  createAddress: (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) =>
    request<Address>('/api/customer/addresses', { method: 'POST', body: JSON.stringify(data) }),

  deleteAddress: (id: number) =>
    request<{ ok: boolean }>(`/api/customer/addresses/${id}`, { method: 'DELETE' }),

  getWallet: () => request<Wallet>('/api/customer/wallet'),

  createReview: (productId: number, data: { rating: number; comment: string }) =>
    request<ProductReview>(`/api/customer/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  customerSupportTickets: () => request<SupportTicket[]>('/api/customer/support'),

  createCustomerSupportTicket: (data: { category: string; subject: string; description: string }) =>
    request<SupportTicket>('/api/customer/support', { method: 'POST', body: JSON.stringify(data) }),

  farmerDashboard: () => request<FarmerDashboardSummary>('/api/farmer/dashboard'),

  farmerProfile: () => request<FarmerProfile>('/api/farmer/profile'),

  updateFarmerProfile: (data: { address?: string; documents_json?: string }) =>
    request<FarmerProfile>('/api/farmer/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getLands: () => request<Land[]>('/api/farmer/lands'),

  createLand: (data: Partial<Land>) =>
    request<Land>('/api/farmer/lands', { method: 'POST', body: JSON.stringify(data) }),

  deleteLand: (id: number) => request<{ ok: boolean }>(`/api/farmer/lands/${id}`, { method: 'DELETE' }),

  getCrops: () => request<Crop[]>('/api/farmer/crops'),

  createCrop: (data: Partial<Crop>) =>
    request<Crop>('/api/farmer/crops', { method: 'POST', body: JSON.stringify(data) }),

  deleteCrop: (id: number) => request<{ ok: boolean }>(`/api/farmer/crops/${id}`, { method: 'DELETE' }),

  getListings: () => request<CropListing[]>('/api/farmer/listings'),

  createListing: (data: Partial<CropListing>) =>
    request<CropListing>('/api/farmer/listings', { method: 'POST', body: JSON.stringify(data) }),

  submitListing: (id: number) =>
    request<CropListing>(`/api/farmer/listings/${id}/submit`, { method: 'POST' }),

  getFarmerAdvisories: () => request<Advisory[]>('/api/farmer/advisories'),

  markAdvisoryRead: (id: number) =>
    request<{ ok: boolean }>(`/api/farmer/advisories/${id}/read`, { method: 'POST' }),

  getFarmerPayments: () => request<Payment[]>('/api/farmer/payments'),

  getKycStatus: () => request<KycStatus>('/api/farmer/kyc'),

  initiateKyc: (aadhaar_number: string) =>
    request<{
      session_id: string;
      provider: string;
      redirect_url: string;
      auto_verify: boolean;
      aadhaar_masked: string;
    }>('/api/farmer/kyc/initiate', { method: 'POST', body: JSON.stringify({ aadhaar_number }) }),

  completeKyc: (aadhaar_number: string, session_id: string) =>
    request<KycStatus>('/api/farmer/kyc/complete', {
      method: 'POST',
      body: JSON.stringify({ aadhaar_number, session_id }),
    }),

  getSoilReports: () => request<SoilHealthReport[]>('/api/farmer/soil-reports'),

  createSoilReport: (data: { report_name: string; land_id?: number; notes?: string }) =>
    request<SoilHealthReport>('/api/farmer/soil-reports', { method: 'POST', body: JSON.stringify(data) }),

  farmerSupportTickets: () => request<SupportTicket[]>('/api/farmer/support'),

  createFarmerSupportTicket: (data: { category: string; subject: string; description: string }) =>
    request<SupportTicket>('/api/farmer/support', { method: 'POST', body: JSON.stringify(data) }),

  adminOrders: () => request<Order[]>('/api/admin/orders'),

  adminUpdateOrder: (id: number, status: string, tracking_number?: string) =>
    request<Order>(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tracking_number }),
    }),

  adminInventory: (product_type?: 'inhouse' | 'farmer') => {
    const q = product_type ? `?product_type=${product_type}` : '';
    return request<Product[]>(`/api/admin/inventory${q}`);
  },

  adminAnalytics: () => request<AnalyticsSummary>('/api/admin/analytics'),

  adminFarmers: () => request<FarmerProfile[]>('/api/admin/farmers'),

  adminVerifyFarmer: (id: number, status: string) =>
    request<FarmerProfile>(`/api/admin/farmers/${id}/verify?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),

  adminUsers: () => request<User[]>('/api/admin/users'),

  adminUpdateUser: (id: number, data: { full_name?: string; phone?: string }) =>
    request<User>(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  adminDeleteUser: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),

  adminUpdateFarmer: (id: number, data: { address?: string; documents_json?: string }) =>
    request<FarmerProfile>(`/api/admin/farmers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  adminCropListings: () => request<CropListing[]>('/api/admin/crop-listings'),

  adminUpdateCropListing: (id: number, status: string, quality_grade?: string) => {
    const q = new URLSearchParams({ status });
    if (quality_grade) q.set('quality_grade', quality_grade);
    return request<CropListing>(`/api/admin/crop-listings/${id}?${q}`, { method: 'PATCH' });
  },

  hubDashboard: () => request<HubDashboardSummary>('/api/hub/dashboard'),

  hubInspections: (status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<CropListing[]>(`/api/hub/inspections${q}`);
  },

  hubScheduleInspection: (id: number, scheduled_at: string, inspection_notes = '') =>
    request<CropListing>(`/api/hub/inspections/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at, inspection_notes }),
    }),

  hubGradeListing: (id: number, quality_grade: string, status: string, inspection_notes = '') =>
    request<CropListing>(`/api/hub/inspections/${id}/grade`, {
      method: 'PATCH',
      body: JSON.stringify({ quality_grade, status, inspection_notes }),
    }),

  adminPayments: () => request<Payment[]>('/api/admin/payments'),

  adminAdvisories: () => request<Advisory[]>('/api/admin/advisories'),

  adminCreateAdvisory: (data: {
    advisory_type: string;
    title: string;
    content: string;
    farmer_id?: number;
  }) => request<Advisory>('/api/admin/advisories', { method: 'POST', body: JSON.stringify(data) }),

  adminDeleteAdvisory: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/advisories/${id}`, { method: 'DELETE' }),

  adminDeleteCropListing: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/crop-listings/${id}`, { method: 'DELETE' }),

  adminSupportTickets: () => request<SupportTicket[]>('/api/admin/support-tickets'),

  adminUpdateSupportTicket: (id: number, status: string, admin_response?: string) => {
    const q = new URLSearchParams({ status });
    if (admin_response) q.set('admin_response', admin_response);
    return request<{ ok: boolean }>(`/api/admin/support-tickets/${id}?${q}`, { method: 'PATCH' });
  },

  adminSoilReports: () => request<SoilHealthReport[]>('/api/admin/soil-reports'),

  adminUpdateSoilReport: (id: number, status: string) =>
    request<SoilHealthReport>(`/api/admin/soil-reports/${id}?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),

  adminLands: () => request<Land[]>('/api/admin/lands'),
  adminCrops: () => request<Crop[]>('/api/admin/crops'),
  adminReviews: () => request<ProductReview[]>('/api/admin/reviews'),

  adminWarehouses: () => request<any[]>('/api/admin/fulfillment/warehouses'),
  adminCreateWarehouse: (data: { name: string; location: string }) =>
    request<any>('/api/admin/fulfillment/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  adminDeliveryPartners: () => request<any[]>('/api/admin/fulfillment/delivery-partners'),
  adminCreateDeliveryPartner: (data: { name: string; phone: string; vehicle_number: string }) =>
    request<any>('/api/admin/fulfillment/delivery-partners', { method: 'POST', body: JSON.stringify(data) }),
  adminAssignFulfillment: (orderId: number, data: { warehouse_id?: number; delivery_partner_id?: number }) =>
    request<Order>(`/api/admin/fulfillment/orders/${orderId}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  adminVerifyDispatch: (orderId: number, otp: string) =>
    request<Order>(`/api/admin/fulfillment/orders/${orderId}/verify-dispatch`, { method: 'POST', body: JSON.stringify({ otp }) }),
  adminVerifyDelivery: (orderId: number, otp: string) =>
    request<Order>(`/api/admin/fulfillment/orders/${orderId}/verify-delivery`, { method: 'POST', body: JSON.stringify({ otp }) }),
};
