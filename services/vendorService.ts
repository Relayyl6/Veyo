import { fetchAPI } from '@/lib/fetch';
import { Vendor, MenuItem } from '@/types/data';
import { vendors as mockVendors, menu_items as mockMenuItems } from '@/constants/data';

export interface VendorFilterOptions {
  category?: string;
  query?: string;
}

export interface CreateMenuItemParams {
  vendorId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  discountedPrice?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  imageUrl?: string;
  preparationTimeMins?: number;
}

export interface UpdateMenuItemParams extends Partial<Omit<CreateMenuItemParams, 'vendorId'>> {
  id?: string;
  itemId?: string;
}

export interface UpdateVendorParams {
  vendorId?: string;
  id?: string;
  businessName?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isOpen?: boolean;
  preparationTimeMins?: number;
  deliveryFee?: number;
  minimumOrder?: number;
  openingTime?: string;
  closingTime?: string;
  daysOpen?: string[];
}

/**
 * Fetch all active vendors with optional category and search filters.
 */
export async function getVendorsList(options?: VendorFilterOptions): Promise<Vendor[]> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.query) params.append('q', options.query);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchAPI(`/(api)/vendor${qs}`);
    return res.data || [];
  } catch (err) {
    console.warn('[vendorService] API fallback for vendors list:', err);
    let list = [...mockVendors.vendors];
    if (options?.category) {
      list = list.filter((v) => v.business_category.toLowerCase() === options.category?.toLowerCase());
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      list = list.filter((v) => v.business_name.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q));
    }
    return list;
  }
}

/**
 * Fetch a single vendor's full detail including its menu items.
 */
export async function getVendorWithMenu(vendorId: string): Promise<(Vendor & { menu_items: MenuItem[] }) | null> {
  try {
    const res = await fetchAPI(`/(api)/vendor?vendorId=${encodeURIComponent(vendorId)}`);
    return res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for vendor with menu:', err);
    const vendor = mockVendors.vendors.find((v) => v.id === vendorId) || mockVendors.vendors[0];
    const items = mockMenuItems.menu_items.filter((m) => m.vendor_id === vendor.id);
    return { ...vendor, menu_items: items };
  }
}

/**
 * Update a vendor's business profile, operating hours, delivery fees, or open status.
 */
export async function updateVendorProfile(vendorId: string, updates: UpdateVendorParams): Promise<Vendor> {
  try {
    const res = await fetchAPI('/(api)/vendor', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, ...updates }),
    });
    return res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for updateVendorProfile:', err);
    const existing = mockVendors.vendors.find((v) => v.id === vendorId) || mockVendors.vendors[0];
    return {
      ...existing,
      ...updates,
      business_name: updates.businessName || existing.business_name,
      delivery_fee: updates.deliveryFee ?? existing.delivery_fee,
      is_open: updates.isOpen ?? existing.is_open,
    } as Vendor;
  }
}

/**
 * Soft delete or archive a vendor entity.
 */
export async function deleteVendorProfile(vendorId: string): Promise<boolean> {
  try {
    const res = await fetchAPI(`/(api)/vendor?vendorId=${encodeURIComponent(vendorId)}`, {
      method: 'DELETE',
    });
    return !!res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for deleteVendorProfile:', err);
    return true;
  }
}

/**
 * Fetch food/menu items for a specific vendor.
 */
export async function getMenuItemsForVendor(vendorId: string, category?: string): Promise<MenuItem[]> {
  try {
    const qs = category
      ? `?vendorId=${encodeURIComponent(vendorId)}&category=${encodeURIComponent(category)}`
      : `?vendorId=${encodeURIComponent(vendorId)}`;
    const res = await fetchAPI(`/(api)/menu${qs}`);
    return res.data || [];
  } catch (err) {
    console.warn('[vendorService] API fallback for menu items:', err);
    let items = mockMenuItems.menu_items.filter((m) => m.vendor_id === vendorId);
    if (category) items = items.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    return items;
  }
}

/**
 * Create a new menu item for a vendor merchant.
 */
export async function createNewMenuItem(params: CreateMenuItemParams): Promise<MenuItem> {
  try {
    const res = await fetchAPI('/(api)/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for create menu item:', err);
    const mockItem: MenuItem = {
      id: `mi-${Date.now()}`,
      vendor_id: params.vendorId,
      name: params.name,
      description: params.description || null,
      category: params.category,
      price: params.price,
      discounted_price: params.discountedPrice || null,
      is_available: params.isAvailable !== false,
      is_popular: params.isPopular || false,
      is_vegetarian: params.isVegetarian || false,
      is_vegan: params.isVegan || false,
      is_gluten_free: params.isGlutenFree || false,
      image_url: params.imageUrl || null,
      preparation_time_mins: params.preparationTimeMins || 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockItem;
  }
}

/**
 * Update an existing food / menu item (price, availability, ingredients, description).
 */
export async function updateMenuItem(itemId: string, updates: UpdateMenuItemParams): Promise<MenuItem> {
  try {
    const res = await fetchAPI('/(api)/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, ...updates }),
    });
    return res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for update menu item:', err);
    const existing = mockMenuItems.menu_items.find((m) => m.id === itemId) || mockMenuItems.menu_items[0];
    return {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? updates.price : existing.price,
      is_available: updates.isAvailable !== undefined ? updates.isAvailable : existing.is_available,
    } as MenuItem;
  }
}

/**
 * Delete a menu item permanently from the vendor's catalog.
 */
export async function deleteMenuItem(itemId: string): Promise<boolean> {
  try {
    const res = await fetchAPI(`/(api)/menu?itemId=${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    return !!res.data;
  } catch (err) {
    console.warn('[vendorService] API fallback for delete menu item:', err);
    return true;
  }
}
