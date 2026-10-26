import { DEFAULT_REGION, MapMarker } from '@/lib/map';
import { create } from 'zustand';
import { User, DriverProfile, Vendor, MenuItem, Ride, Order, AppMarker } from '@/types/data';

type Location = {
  latitude: number;
  longitude: number;
  address: string;
};

// =============================================
// 1. LOCATION STORE
// =============================================
interface LocationStore {
  isLoading: boolean;
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({ latitude, longitude, address }: Location) => void;
  setDestinationLocation: ({ latitude, longitude, address }: Location) => void;
  setIsLoading: (value: boolean) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  isLoading: false,
  userAddress: null,
  userLatitude: null,
  userLongitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  destinationLatitude: null,
  setUserLocation: ({ latitude, longitude, address }: Location) =>
    set(() => ({ userLatitude: latitude, userLongitude: longitude, userAddress: address })),
  setDestinationLocation: ({ latitude, longitude, address }: Location) =>
    set(() => ({ destinationLatitude: latitude, destinationLongitude: longitude, destinationAddress: address })),
  setIsLoading: (value: boolean) => set({ isLoading: value }),
}));

// =============================================
// 2. DRIVER RADAR STORE (Markers & Nearby)
// =============================================
interface DriverStore {
  drivers: AppMarker[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number | null) => void;
  setDrivers: (drivers: AppMarker[]) => void;
  clearSelectedDriver: () => void;
  setDriversFromProfiles?: (profiles: DriverProfile[]) => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as AppMarker[],
  selectedDriver: null,
  setSelectedDriver: (driver_id) => set(() => ({ selectedDriver: driver_id })),
  setDrivers: (drivers: AppMarker[]) => set(() => ({ drivers: drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
  setDriversFromProfiles: (profiles) => {
    const converted: AppMarker[] = profiles.map((p, i) => ({
      id: Number(p.id ?? i),
      latitude: p.current_latitude ?? DEFAULT_REGION.latitude,
      longitude: p.current_longitude ?? DEFAULT_REGION.longitude,
      first_name: p.user?.first_name ?? undefined,
      last_name: p.user?.last_name ?? undefined,
      profile_image_url: p.user?.avatar_url ?? undefined,
      car_image_url: p.vehicle_image_url ?? undefined,
      car_seats: p.vehicle_year ?? undefined,
      rating: p.rating ?? undefined,
      title: `${p.user?.first_name ?? ''} ${p.user?.last_name ?? ''}`.trim() || 'Driver',
    }));
    set({ drivers: converted });
  },
}));

// =============================================
// 3. USER & ROLE SESSION STORE
// Supports switching/persisting user roles: Customer, Driver, Vendor Admin
// =============================================
export type AppUserRole = 'customer' | 'driver' | 'vendor_admin' | 'super_admin';

interface UserStore {
  user: User | null;
  role: AppUserRole;
  driverProfile: DriverProfile | null;
  vendorProfile: Vendor | null;
  setUser: (user: User | null) => void;
  setRole: (role: AppUserRole) => void;
  setDriverProfile: (profile: DriverProfile | null) => void;
  setVendorProfile: (profile: Vendor | null) => void;
  setUserSession: (user: User, driver?: DriverProfile | null, vendor?: Vendor | null) => void;
  clearUserSession: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  role: 'customer',
  driverProfile: null,
  vendorProfile: null,
  setUser: (user) => set({ user, role: (user?.role as AppUserRole) || 'customer' }),
  setRole: (role) => set({ role }),
  setDriverProfile: (driverProfile) => set({ driverProfile }),
  setVendorProfile: (vendorProfile) => set({ vendorProfile }),
  setUserSession: (user, driverProfile = null, vendorProfile = null) =>
    set({
      user,
      role: (user?.role as AppUserRole) || 'customer',
      driverProfile,
      vendorProfile,
    }),
  clearUserSession: () =>
    set({
      user: null,
      role: 'customer',
      driverProfile: null,
      vendorProfile: null,
    }),
}));

// =============================================
// 4. VENDOR & MENU STORE
// Manages vendor catalogue, category filters, and active vendor
// =============================================
interface VendorStore {
  vendors: Vendor[];
  activeVendor: (Vendor & { menu_items?: MenuItem[] }) | null;
  selectedCategory: string | null;
  searchQuery: string;
  setVendors: (vendors: Vendor[]) => void;
  setActiveVendor: (vendor: (Vendor & { menu_items?: MenuItem[] }) | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  addMenuItemToActiveVendor: (item: MenuItem) => void;
  updateMenuItemInActiveVendor: (item: MenuItem) => void;
  deleteMenuItemFromActiveVendor: (itemId: string) => void;
}

export const useVendorStore = create<VendorStore>((set, get) => ({
  vendors: [],
  activeVendor: null,
  selectedCategory: null,
  searchQuery: '',
  setVendors: (vendors) => set({ vendors }),
  setActiveVendor: (activeVendor) => set({ activeVendor }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addMenuItemToActiveVendor: (item) => {
    const active = get().activeVendor;
    if (!active) return;
    const items = active.menu_items || [];
    set({ activeVendor: { ...active, menu_items: [item, ...items] } });
  },
  updateMenuItemInActiveVendor: (item) => {
    const active = get().activeVendor;
    if (!active || !active.menu_items) return;
    const updated = active.menu_items.map((i: MenuItem) => (i.id === item.id ? item : i));
    set({ activeVendor: { ...active, menu_items: updated } });
  },
  deleteMenuItemFromActiveVendor: (itemId) => {
    const active = get().activeVendor;
    if (!active || !active.menu_items) return;
    const updated = active.menu_items.filter((i: MenuItem) => i.id !== itemId);
    set({ activeVendor: { ...active, menu_items: updated } });
  },
}));

// =============================================
// 5. FOOD CART STORE
// Manages line items, multi-item ordering, subtotal, and vendor association
// =============================================
export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartStore {
  vendorId: string | null;
  vendorName: string | null;
  items: CartItem[];
  addItem: (item: MenuItem, vendor: { id: string; name: string }, instructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  vendorId: null,
  vendorName: null,
  items: [],
  addItem: (item, vendor, instructions) => {
    const { vendorId, items } = get();

    // If adding an item from a different vendor, reset cart for new vendor
    if (vendorId && vendorId !== vendor.id) {
      set({
        vendorId: vendor.id,
        vendorName: vendor.name,
        items: [{ item, quantity: 1, specialInstructions: instructions }],
      });
      return;
    }

    const existingIdx = items.findIndex((i) => i.item.id === item.id);
    if (existingIdx > -1) {
      const updated = [...items];
      updated[existingIdx].quantity += 1;
      if (instructions) updated[existingIdx].specialInstructions = instructions;
      set({ items: updated });
    } else {
      set({
        vendorId: vendor.id,
        vendorName: vendor.name,
        items: [...items, { item, quantity: 1, specialInstructions: instructions }],
      });
    }
  },
  removeItem: (itemId) => {
    const updated = get().items.filter((i) => i.item.id !== itemId);
    set({
      items: updated,
      vendorId: updated.length === 0 ? null : get().vendorId,
      vendorName: updated.length === 0 ? null : get().vendorName,
    });
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    const updated = get().items.map((i) =>
      i.item.id === itemId ? { ...i, quantity } : i
    );
    set({ items: updated });
  },
  clearCart: () => set({ items: [], vendorId: null, vendorName: null }),
  getSubtotal: () => {
    return Number(
      get().items.reduce((sum, i) => sum + (i.item.discounted_price || i.item.price) * i.quantity, 0).toFixed(2)
    );
  },
  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

// =============================================
// 6. RIDE LIFECYCLE STORE
// Manages ongoing active ride, dispatch state, and history cache
// =============================================
interface RideStore {
  activeRide: Ride | null;
  recentRides: Ride[];
  setActiveRide: (ride: Ride | null) => void;
  setRecentRides: (rides: Ride[]) => void;
  updateRideStatus: (status: Ride['ride_status']) => void;
  clearActiveRide: () => void;
}

export const useRideStore = create<RideStore>((set, get) => ({
  activeRide: null,
  recentRides: [],
  setActiveRide: (activeRide) => set({ activeRide }),
  setRecentRides: (recentRides) => set({ recentRides }),
  updateRideStatus: (status) => {
    const current = get().activeRide;
    if (current) {
      set({ activeRide: { ...current, ride_status: status } });
    }
  },
  clearActiveRide: () => set({ activeRide: null }),
}));
