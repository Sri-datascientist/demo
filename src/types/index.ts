export type UserRole = 'customer' | 'farmer' | 'admin' | 'district_hub';
export type AccountType = 'customer' | 'farmer' | 'district_hub';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
  farmer_profile_id?: number | null;
  farmer_name: string;
  offer_percent: number;
  created_at: string;
  updated_at: string;
  average_rating?: number | null;
  review_count?: number | null;
}

export interface ProductReview {
  id: number;
  product_id: number;
  product_name?: string;
  user_id: number;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  product_image?: string;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  warehouse_id?: number;
  delivery_partner_id?: number;
  dispatch_otp?: string;
  delivery_otp?: string;
  dispatch_verified?: boolean;
  delivery_verified?: boolean;
  warehouse?: { id: number; name: string; location: string };
  delivery_partner?: { id: number; name: string; phone: string; vehicle_number: string };
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface AnalyticsSummary {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_farmers: number;
  total_products: number;
  low_stock_count: number;
  pending_crop_listings: number;
  pending_soil_reports: number;
  open_support_tickets: number;
  orders_by_status: Record<string, number>;
  revenue_by_month: Array<{ month: string; revenue: number }>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  otp_code?: string | null;
}

export interface FarmerProfile {
  id: number;
  user_id: number;
  farmer_code: string;
  address: string;
  documents_json: string;
  verification_status: string;
  aadhaar_masked?: string;
  kyc_status?: string;
  kyc_provider?: string;
  kyc_reference?: string;
  kyc_verified_at?: string | null;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface FarmerDashboardSummary {
  total_land_acres: number;
  active_crops: number;
  advisory_alerts: number;
  crop_selling_pending: number;
  payments_pending: number;
  verification_status: string;
  kyc_status: string;
}

export interface Land {
  id: number;
  farmer_id: number;
  name: string;
  area_acres: number;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  soil_type: string;
  soil_ph?: number | null;
  soil_moisture: string;
  notes: string;
  created_at: string;
  farmer_name?: string;
  farmer_code?: string;
}

export interface Crop {
  id: number;
  farmer_id: number;
  land_id?: number | null;
  name: string;
  variety: string;
  farming_stage: string;
  expected_yield_kg: number;
  planted_at?: string | null;
  harvest_expected_at?: string | null;
  notes: string;
  created_at: string;
  farmer_name?: string;
  farmer_code?: string;
  land_name?: string;
}

export interface CropListing {
  id: number;
  farmer_id: number;
  crop_id?: number | null;
  crop_name: string;
  quantity_kg: number;
  price_per_kg: number;
  msp_per_kg: number;
  quality_grade: string;
  status: string;
  notes: string;
  inspection_scheduled_at?: string | null;
  inspection_notes?: string;
  hub_graded_by_id?: number | null;
  farmer_name?: string;
  farmer_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Advisory {
  id: number;
  farmer_id?: number | null;
  advisory_type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id?: number | null;
  farmer_id?: number | null;
  order_id?: number | null;
  amount: number;
  status: string;
  payment_type: string;
  reference: string;
  notes: string;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  points: number;
  loyalty_tier: string;
  created_at: string;
}

export interface KycStatus {
  kyc_status: string;
  aadhaar_masked: string;
  kyc_provider: string;
  kyc_reference: string;
  kyc_verified_at?: string | null;
  verification_status: string;
}

export interface SoilHealthReport {
  id: number;
  farmer_id: number;
  land_id?: number | null;
  report_name: string;
  notes: string;
  file_url: string;
  status: string;
  created_at: string;
  farmer_name?: string;
  farmer_code?: string;
  land_name?: string;
}

export interface HubDashboardSummary {
  pending_inspections: number;
  scheduled_today: number;
  approved_this_week: number;
  rejected_this_week: number;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string;
  created_at: string;
  updated_at: string;
}
