import { fetchAPI } from '@/lib/fetch';
import { Ride } from '@/types/data';
import { rides as mockRides } from '@/constants/data';

export interface CreateRideParams {
  userId?: string;
  clerkId?: string;
  originAddress: string;
  destinationAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  distanceKm?: number;
  rideTimeMins?: number;
  baseFare?: number;
  distanceFare?: number;
  timeFare?: number;
  surgeMultiplier?: number;
  serviceFee?: number;
  tipAmount?: number;
  paymentMethod?: 'wallet' | 'credit_card' | 'debit_card' | 'cash';
}

/**
 * Create a new instant ride request.
 */
export async function requestRide(params: CreateRideParams): Promise<Ride> {
  try {
    const res = await fetchAPI('/(api)/ride', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[rideService] API fallback for ride request:', err);
    const mockRide = {
      id: `r-${Date.now()}`,
      ride_number: `RD-${Date.now().toString().slice(-6)}`,
      user_id: params.userId || 'current-user',
      driver_id: null,
      origin_address: params.originAddress,
      destination_address: params.destinationAddress,
      origin_latitude: params.originLatitude,
      origin_longitude: params.originLongitude,
      destination_latitude: params.destinationLatitude,
      destination_longitude: params.destinationLongitude,
      ride_status: 'searching' as any,
      distance_km: params.distanceKm || 4.5,
      ride_time_mins: params.rideTimeMins || 16,
      base_fare: params.baseFare || 3.0,
      distance_fare: params.distanceFare || 6.5,
      time_fare: params.timeFare || 2.0,
      surge_multiplier: params.surgeMultiplier || 1.0,
      service_fee: params.serviceFee || 1.2,
      tip_amount: params.tipAmount || 0,
      total_fare: 12.7,
      payment_status: 'pending' as any,
      payment_method: (params.paymentMethod || 'wallet') as any,
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockRide as Ride;
  }
}

/**
 * Fetch rides for a user (history and active).
 */
export async function fetchUserRides(identifier: { userId?: string; clerkId?: string }): Promise<Ride[]> {
  try {
    const qs = identifier.clerkId
      ? `?clerkId=${encodeURIComponent(identifier.clerkId)}`
      : `?userId=${encodeURIComponent(identifier.userId!)}`;
    const res = await fetchAPI(`/(api)/ride${qs}`);
    return res.data || [];
  } catch (err) {
    console.warn('[rideService] API fallback for user rides:', err);
    return mockRides.rides;
  }
}

/**
 * Update the status of a ride.
 */
export async function updateRideStatus(
  rideId: string,
  status: 'accepted' | 'arrived' | 'in_transit' | 'completed' | 'canceled',
  extra?: { driverId?: string; cancelReason?: string; rating?: number; review?: string }
): Promise<Ride> {
  try {
    const res = await fetchAPI('/(api)/ride', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, status, ...extra }),
    });
    return res.data;
  } catch (err) {
    console.warn('[rideService] API fallback for update ride status:', err);
    return {
      ...mockRides.rides[0],
      id: rideId,
      ride_status: status as any,
    };
  }
}

/**
 * Cancel a ride request with optional reason.
 */
export async function cancelRide(rideId: string, reason?: string): Promise<Ride> {
  try {
    const res = await fetchAPI('/(api)/ride', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, status: 'canceled', cancelReason: reason || 'Canceled by user' }),
    });
    return res.data;
  } catch (err) {
    console.warn('[rideService] API fallback for cancel ride:', err);
    return {
      ...mockRides.rides[0],
      id: rideId,
      ride_status: 'canceled' as any,
      cancel_reason: reason || 'Canceled by user',
    };
  }
}

/**
 * Delete or purge a ride record.
 */
export async function deleteRide(rideId: string): Promise<boolean> {
  try {
    const res = await fetchAPI(`/(api)/ride?rideId=${encodeURIComponent(rideId)}`, {
      method: 'DELETE',
    });
    return !!res.data;
  } catch (err) {
    console.warn('[rideService] API fallback for delete ride:', err);
    return true;
  }
}
