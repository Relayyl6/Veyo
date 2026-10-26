import { fetchAPI } from '@/lib/fetch';
import { User, DriverProfile, Vendor } from '@/types/data';
import { users as mockUsers, driver_profiles as mockDrivers, vendors as mockVendors } from '@/constants/data';

export interface RegisterUserParams {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'driver' | 'vendor_admin';
}

export interface RegisterDriverParams {
  userId?: string;
  clerkId?: string;
  licenseNumber: string;
  licenseExpiry?: string;
  vehicleType: 'standard' | 'luxury' | 'suv' | 'taxi' | 'auto';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  vehicleColor?: string;
  licensePlate: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export interface RegisterVendorParams {
  ownerId?: string;
  clerkId?: string;
  businessName: string;
  businessCategory:
    | 'italian'
    | 'japanese'
    | 'american'
    | 'chinese'
    | 'mexican'
    | 'indian'
    | 'thai'
    | 'fast_food'
    | 'bakery'
    | 'cafe';
  description?: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  preparationTimeMins?: number;
}

export interface UserSessionData {
  user: User;
  driverProfile?: DriverProfile | null;
  vendorProfile?: Vendor | null;
}

/**
 * Register or update the base user account.
 */
export async function registerUserAccount(params: RegisterUserParams): Promise<User> {
  try {
    const res = await fetchAPI('/(api)/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data?.user || res.data;
  } catch (err) {
    console.warn('[authService] API fallback for user account:', err);
    // Offline / Mock fallback
    const mockUser = {
      id: `u-${Date.now()}`,
      clerk_id: params.clerkId,
      email: params.email,
      first_name: params.firstName || 'User',
      last_name: params.lastName || '',
      role: params.role as any,
      avatar_url: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      phone_number: params.phone || '+2348000000000',
      wallet_balance: 100.0,
      is_active: true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockUser as User;
  }
}

/**
 * Provision a driver profile for the newly registered driver.
 */
export async function registerDriverProfile(params: RegisterDriverParams): Promise<DriverProfile> {
  try {
    const res = await fetchAPI('/(api)/driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[authService] API fallback for driver profile:', err);
    const mockDriver = {
      id: `dp-${Date.now()}`,
      user_id: params.userId || 'current-user',
      license_number: params.licenseNumber,
      license_expiry: params.licenseExpiry || '2028-12-31',
      vehicle_type: params.vehicleType as any,
      vehicle_make: params.vehicleMake,
      vehicle_model: params.vehicleModel,
      vehicle_year: params.vehicleYear || 2023,
      vehicle_color: params.vehicleColor || 'Silver',
      license_plate: params.licensePlate,
      is_verified: true,
      is_online: true,
      is_available: true,
      rating: 5.0,
      total_rides: 0,
      total_orders: 0,
      acceptance_rate: 100,
      cancellation_rate: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockDriver as DriverProfile;
  }
}

/**
 * Provision a vendor merchant profile for the newly registered merchant.
 */
export async function registerVendorProfile(params: RegisterVendorParams): Promise<Vendor> {
  try {
    const res = await fetchAPI('/(api)/vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[authService] API fallback for vendor profile:', err);
    const mockVendor: Vendor = {
      id: `v-${Date.now()}`,
      owner_id: params.ownerId || 'current-user',
      business_name: params.businessName,
      business_category: params.businessCategory as any,
      description: params.description || `${params.businessName} on Veyo`,
      address: params.address,
      latitude: 6.5244,
      longitude: 3.3792,
      phone: params.phone,
      email: params.email || null,
      logo_url: params.logoUrl || null,
      cover_image_url: params.coverImageUrl || null,
      is_open: true,
      preparation_time_mins: params.preparationTimeMins || 20,
      delivery_fee: params.deliveryFee || 2.99,
      minimum_order: params.minimumOrder || 10.0,
      rating: 5.0,
      total_orders: 0,
      opening_time: '08:00',
      closing_time: '22:00',
      days_open: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockVendor;
  }
}

/**
 * Fetch complete user profile along with role-specific driver or vendor data.
 */
export async function fetchFullUserProfile(clerkId: string): Promise<UserSessionData | null> {
  try {
    const res = await fetchAPI(`/(api)/user?clerkId=${encodeURIComponent(clerkId)}`);
    return {
      user: res.data?.user,
      driverProfile: res.data?.profile?.license_number ? res.data.profile : null,
      vendorProfile: res.data?.profile?.business_name ? res.data.profile : null,
    };
  } catch (err) {
    console.warn('[authService] fetchFullUserProfile error:', err);
    const fallbackUser = mockUsers.users.find((u) => u.clerk_id === clerkId) || mockUsers.users[0];
    return {
      user: fallbackUser,
      driverProfile: mockDrivers.driver_profiles[0],
      vendorProfile: mockVendors.vendors[0],
    };
  }
}
