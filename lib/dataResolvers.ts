import { Order, Ride } from '@/types/data';
import {
  users,
  driver_profiles,
  vendors,
  menu_items,
  rides,
  orders,
  order_items,
} from '../constants/data';

// =============================================
// BASE LOOKUP HELPERS
// =============================================

const getUserById = (id: string) => users.users.find((u) => u.id === id);
const getDriverProfileById = (id: string) => driver_profiles.driver_profiles.find((dp) => dp.id === id);
const getVendorById = (id: string) => vendors.vendors.find((v) => v.id === id);
const getOrderItemsByOrderId = (orderId: string) => order_items.order_items.filter((oi) => oi.order_id === orderId);

// =============================================
// ENRICHED RESOLVERS
// =============================================

/**
 * Pass in a Ride ID and get back the ride with full customer and driver details attached.
 */
export const getEnrichedRide = (rideId: string) => {
  const ride = rides.rides.find((r) => r.id === rideId);
  if (!ride) return null;

  // 1. Get Customer details
  const customer = getUserById(ride.user_id);

  // 2. Resolve Driver details (Ride -> DriverProfile -> User)
  let driverDetails = null;
  if (ride.driver_id) {
    const driverProfile = getDriverProfileById(ride.driver_id);
    if (driverProfile) {
      const driverUser = getUserById(driverProfile.user_id);
      
      if (driverUser) {
        driverDetails = {
          profile_id: driverProfile.id,
          user_id: driverUser.id,
          full_name: `${driverUser.first_name} ${driverUser.last_name}`,
          phone: driverUser.phone_number,
          avatar_url: driverUser.avatar_url,
          rating: driverProfile.rating,
          vehicle: `${driverProfile.vehicle_color} ${driverProfile.vehicle_make} ${driverProfile.vehicle_model}`,
          license_plate: driverProfile.license_plate,
        };
      }
    }
  }

  return {
    ...ride,
    customer: customer ? {
      full_name: `${customer.first_name} ${customer.last_name}`,
      phone: customer.phone_number,
      avatar_url: customer.avatar_url,
    } : null,
    driver: driverDetails,
  };
};

/**
 * Pass in an Order ID and get back the order with vendor, items, customer, and driver attached.
 */
export const getEnrichedOrder = (orderId: string) => {
  const order = orders.orders.find((o: Order) => o.id === orderId);
  if (!order) return null;

  // 1. Get Customer
  const customer = getUserById(order.user_id);

  // 2. Get Vendor
  const vendor = getVendorById(order.vendor_id);

  // 3. Get Items for this order
  const items = getOrderItemsByOrderId(order.id);

  // 4. Resolve Driver details
  let driverDetails = null;
  if (order.driver_id) {
    const driverProfile = getDriverProfileById(order.driver_id);
    if (driverProfile) {
      const driverUser = getUserById(driverProfile.user_id);
      
      if (driverUser) {
        driverDetails = {
          full_name: `${driverUser.first_name} ${driverUser.last_name}`,
          phone: driverUser.phone_number,
          vehicle: `${driverProfile.vehicle_color} ${driverProfile.vehicle_make} ${driverProfile.vehicle_model}`,
          license_plate: driverProfile.license_plate,
        };
      }
    }
  }

  return {
    ...order,
    customer: customer ? {
      full_name: `${customer.first_name} ${customer.last_name}`,
      phone: customer.phone_number,
    } : null,
    vendor: vendor ? {
      name: vendor.business_name,
      address: vendor.address,
      phone: vendor.phone,
      logo_url: vendor.logo_url,
    } : null,
    driver: driverDetails,
    items: items.map(item => ({
      name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total_price,
      instructions: item.special_instructions
    })),
  };
};

/**
 * Fetch all rides for a specific user, fully enriched
 */
export const getEnrichedRidesForUser = (userId: string) => {
  const userRides = rides.rides.filter((r: Ride) => r.user_id === userId);
  return userRides.map((ride: Ride) => getEnrichedRide(ride.id));
};

export const getDriverFullName = (driverProfile: { user_id: string }): string => {
  const user = getUserById(driverProfile.user_id);
  return user ? `${user.first_name} ${user.last_name}`.trim() : 'Driver';
};