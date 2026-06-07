// =============================================
// ENUM TYPES
// =============================================
declare type AppMarker = MapMarker & {
  id: number;
  profile_image_url?: string;
  car_image_url?: string;
  car_seats?: number;
  rating?: number;
  first_name?: string;
  last_name?: string;
  timeMinutes?: number | null; // ETA in minutes
  price?: number | null;       // numeric price
};

declare enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  VENDOR_ADMIN = 'vendor_admin',
  SUPER_ADMIN = 'super_admin',
}

declare enum RideStatus {
  SEARCHING = 'searching',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

declare enum OrderStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  PREPARING = 'preparing',
  READY = 'ready',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

declare enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

declare enum PaymentMethod {
  WALLET = 'wallet',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

declare enum ActivityType {
  RIDE = 'ride',
  ORDER = 'order',
  WALLET_TOPUP = 'wallet_topup',
  WALLET_WITHDRAWAL = 'wallet_withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
}

declare enum VendorCategory {
  ITALIAN = 'italian',
  JAPANESE = 'japanese',
  AMERICAN = 'american',
  CHINESE = 'chinese',
  MEXICAN = 'mexican',
  INDIAN = 'indian',
  THAI = 'thai',
  FAST_FOOD = 'fast_food',
  BAKERY = 'bakery',
  CAFE = 'cafe',
}

declare enum VehicleType {
  STANDARD = 'standard',
  LUXURY = 'luxury',
  SUV = 'suv',
  TAXI = 'taxi',
  AUTO = 'auto',
}

// =============================================
// USER TYPES
// =============================================

declare interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  push_token: string | null;
  wallet_balance: number;
  home_address: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  work_address: string | null;
  work_latitude: number | null;
  work_longitude: number | null;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;   // ISO timestamp
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// DRIVER TYPES
// =============================================

declare interface DriverProfile {
  id: string;
  user_id: string;
  user?: User;

  license_number: string;
  license_expiry: string;        // ISO date string (DATE in SQL)
  vehicle_type: VehicleType;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_color: string | null;
  license_plate: string;
  vehicle_image_url: string | null;

  is_verified: boolean;
  verified_at: string | null;

  current_latitude: number | null;
  current_longitude: number | null;
  last_location_update: string | null;

  is_online: boolean;
  is_available: boolean;

  rating: number;
  total_rides: number;
  total_orders: number;
  acceptance_rate: number;
  cancellation_rate: number;

  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;

  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// VENDOR TYPES
// =============================================

declare interface Vendor {
  id: string;
  owner_id: string;
  owner?: User;

  business_name: string;
  business_category: VendorCategory;
  description: string | null;

  address: string;
  latitude: number;
  longitude: number;

  phone: string;
  email: string | null;
  logo_url: string | null;
  cover_image_url: string | null;

  is_open: boolean;
  preparation_time_mins: number;
  delivery_fee: number;
  minimum_order: number;

  rating: number;
  total_orders: number;

  opening_time: string | null;   // HH:MM format (TIME in SQL)
  closing_time: string | null;
  days_open: string[];

  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

declare interface MenuItem {
  id: string;
  vendor_id: string;
  vendor?: Vendor;

  name: string;
  description: string | null;
  category: string | null;
  price: number;
  discounted_price: number | null;

  is_available: boolean;
  is_popular: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;

  image_url: string | null;
  preparation_time_mins: number;

  created_at: string;
  updated_at: string;
}

// =============================================
// RIDE TYPES
// =============================================

declare interface Ride {
  id: string;
  ride_number: string;

  user_id: string;
  user?: User;
  driver_id: string | null;
  driver?: DriverProfile;

  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;

  ride_status: RideStatus;

  distance_km: number | null;
  ride_time_mins: number | null;

  base_fare: number;
  distance_fare: number;
  time_fare: number;
  surge_multiplier: number;
  service_fee: number;
  tip_amount: number;
  total_fare: number;

  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_intent_id: string | null;

  requested_at: string;
  accepted_at: string | null;
  arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  canceled_by: string | null;   // UUID of cancelling user

  driver_rating: number | null;
  driver_review: string | null;
  customer_rating: number | null;
  customer_review: string | null;

  created_at: string;
  updated_at: string;
}

declare interface RideLocation {
  id: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

// =============================================
// ORDER TYPES
// =============================================

declare interface Order {
  id: string;
  order_number: string;

  user_id: string;
  user?: User;
  vendor_id: string;
  vendor?: Vendor;
  driver_id: string | null;
  driver?: DriverProfile;

  order_status: OrderStatus;

  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_instructions: string | null;

  subtotal: number;
  tax: number;
  delivery_fee: number;
  service_fee: number;
  tip_amount: number;
  discount_amount: number;
  total_amount: number;

  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_intent_id: string | null;

  special_requests: string | null;

  created_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  canceled_by: string | null;   // UUID of cancelling user

  vendor_rating: number | null;
  vendor_review: string | null;
  driver_rating: number | null;
  driver_review: string | null;

  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;

  updated_at: string;
}

declare interface OrderItem {
  id: string;
  order_id: string;
  order?: Order;
  menu_item_id: string;
  menu_item?: MenuItem;

  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;

  special_instructions: string | null;

  created_at: string;
}

// =============================================
// TRANSACTION TYPES
// =============================================

declare interface WalletTransaction {
  id: string;
  user_id: string;
  user?: User;

  transaction_type: 'credit' | 'debit';
  amount: number;
  balance_after: number;

  reference_id: string;
  description: string | null;

  metadata: Record<string, any> | null;

  created_at: string;
}

declare interface Payment {
  id: string;
  user_id: string;
  user?: User;

  entity_type: 'ride' | 'order';
  entity_id: string;

  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;

  stripe_payment_intent_id: string | null;
  stripe_payment_method_id: string | null;

  metadata: Record<string, any> | null;

  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

declare interface DriverEarning {
  id: string;
  driver_id: string;
  driver?: DriverProfile;

  entity_type: 'ride' | 'order';
  entity_id: string;

  base_earnings: number;
  tip_amount: number;
  bonus_amount: number;
  total_earnings: number;

  is_paid: boolean;
  paid_at: string | null;

  created_at: string;
}

// =============================================
// ACTIVITY TYPES
// =============================================

declare interface UserActivity {
  id: string;
  user_id: string;
  user?: User;

  activity_type: ActivityType;
  reference_id: string;    // UUID — references rides.id or orders.id

  title: string;
  description: string | null;

  amount: number | null;
  status: string | null;

  metadata: Record<string, any> | null;

  is_read: boolean;
  created_at: string;
}

// =============================================
// REVIEW TYPES
// =============================================

declare interface Review {
  id: string;
  reviewer_id: string;
  reviewer?: User;
  reviewee_id: string;
  reviewee?: User;

  entity_type: 'ride' | 'order' | 'vendor';
  entity_id: string;

  rating: number;
  review: string | null;
  tags: string[] | null;

  is_flagged: boolean;
  flag_reason: string | null;

  created_at: string;
  updated_at: string;
}

// =============================================
// API REQUEST / RESPONSE TYPES
// =============================================

declare interface CreateRideRequest {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  payment_method: PaymentMethod;
}

declare interface CreateOrderRequest {
  vendor_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }>;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_instructions?: string;
  payment_method: PaymentMethod;
  tip_amount?: number;
}

declare interface AcceptRideRequest {
  ride_id: string;
  driver_id: string;
}

declare interface UpdateRideStatusRequest {
  ride_id: string;
  status: RideStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
}

declare interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
  driver_id?: string;
}

declare interface VendorDashboardStats {
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  completion_rate: number;
  recent_orders: Order[];
  popular_items: Array<{
    menu_item: MenuItem;
    total_quantity: number;
  }>;
}

declare interface DriverDashboardStats {
  total_rides: number;
  total_orders: number;
  total_earnings: number;
  average_rating: number;
  acceptance_rate: number;
  cancellation_rate: number;
  recent_activities: (Ride | Order)[];
  online_hours_today: number;
}

declare interface CustomerDashboardData {
  recent_rides: Ride[];
  recent_orders: Order[];
  wallet_balance: number;
  saved_addresses: Array<{
    type: 'home' | 'work' | 'other';
    address: string;
    latitude: number;
    longitude: number;
  }>;
  notifications: UserActivity[];
}

// =============================================
// UTILITY TYPES
// =============================================

declare type Location = {
  latitude: number;
  longitude: number;
  address?: string;
};

declare type PriceBreakdown = {
  subtotal: number;
  tax: number;
  fee: number;
  tip: number;
  discount: number;
  total: number;
};

declare type TimeEstimate = {
  minutes: number;
  formatted: string;
  timestamp: string;
};

declare type NearbyDriver = DriverProfile & {
  distance_km: number;
  eta_minutes: number;
};

declare type NearbyVendor = Vendor & {
  distance_km: number;
  eta_minutes: number;
};

declare type OrderTracking = {
  order: Order;
  current_status: OrderStatus;
  estimated_delivery_time: string | null;
  driver_location: Location | null;
  vendor_location: Location;
  status_history: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
};

declare type RideTracking = {
  ride: Ride;
  current_status: RideStatus;
  estimated_arrival: string | null;
  driver_location: Location | null;
  route_points: Location[];
  status_history: Array<{
    status: RideStatus;
    timestamp: string;
    note?: string;
  }>;
};