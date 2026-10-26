import { fetchAPI } from '@/lib/fetch';
import { DriverProfile } from '@/types/data';
import { driver_profiles as mockDrivers } from '@/constants/data';

export interface UpdateDriverLocationParams {
  driverId?: string;
  userId?: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  isAvailable?: boolean;
}

export interface UpdateDriverProfileParams {
  driverId?: string;
  userId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  licensePlate?: string;
  vehicleType?: 'standard' | 'luxury' | 'suv' | 'taxi' | 'auto';
  isOnline?: boolean;
  isAvailable?: boolean;
}

/**
 * Fetch online drivers for radar map clustering.
 */
export async function getOnlineDrivers(): Promise<DriverProfile[]> {
  try {
    const res = await fetchAPI('/(api)/driver?onlineOnly=true');
    return res.data || [];
  } catch (err) {
    console.warn('[driverService] API fallback for online drivers:', err);
    return mockDrivers.driver_profiles.filter((d) => d.is_online);
  }
}

/**
 * Fetch a specific driver's profile by driverId or userId.
 */
export async function getDriverProfile(identifier: { driverId?: string; userId?: string }): Promise<DriverProfile | null> {
  try {
    const qs = identifier.driverId
      ? `?driverId=${encodeURIComponent(identifier.driverId)}`
      : `?userId=${encodeURIComponent(identifier.userId!)}`;
    const res = await fetchAPI(`/(api)/driver${qs}`);
    return res.data;
  } catch (err) {
    console.warn('[driverService] API fallback for driver profile:', err);
    if (identifier.driverId) {
      return mockDrivers.driver_profiles.find((d) => d.id === identifier.driverId) || mockDrivers.driver_profiles[0];
    }
    return mockDrivers.driver_profiles.find((d) => d.user_id === identifier.userId) || mockDrivers.driver_profiles[0];
  }
}

/**
 * Update the driver's live GPS coordinates and availability.
 */
export async function updateDriverLocation(params: UpdateDriverLocationParams): Promise<DriverProfile> {
  try {
    const res = await fetchAPI('/(api)/driver', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[driverService] API fallback for update location:', err);
    return {
      ...mockDrivers.driver_profiles[0],
      current_latitude: params.latitude,
      current_longitude: params.longitude,
      is_online: params.isOnline ?? true,
      is_available: params.isAvailable ?? true,
    };
  }
}

/**
 * Update driver vehicle information, license plate, or operating status.
 */
export async function updateDriverProfile(params: UpdateDriverProfileParams): Promise<DriverProfile> {
  try {
    const res = await fetchAPI('/(api)/driver', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[driverService] API fallback for update driver profile:', err);
    return {
      ...mockDrivers.driver_profiles[0],
      vehicle_make: params.vehicleMake || mockDrivers.driver_profiles[0].vehicle_make,
      license_plate: params.licensePlate || mockDrivers.driver_profiles[0].license_plate,
    };
  }
}

/**
 * Soft delete or deactivate a driver partner profile.
 */
export async function deleteDriverProfile(driverId: string): Promise<boolean> {
  try {
    const res = await fetchAPI(`/(api)/driver?driverId=${encodeURIComponent(driverId)}`, {
      method: 'DELETE',
    });
    return !!res.data;
  } catch (err) {
    console.warn('[driverService] API fallback for delete driver profile:', err);
    return true;
  }
}
