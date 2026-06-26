import { DEFAULT_REGION, MapMarker } from '@/lib/map';
import { create } from 'zustand';

type Location = {
  latitude: number;
  longitude: number;
  address: string;
};

declare interface MarkerData {
    latitude: number;
    longitude: number;
    id: number;
    title: string;
    profile_image_url: string;
    car_image_url: string;
    car_seats: number;
    rating: number;
    first_name: string;
    last_name: string;
    time?: number;
    price?: string;
}

interface LocationStore {
  isLoading: boolean;
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: Location) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: Location) => void;
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
  setUserLocation: ({latitude, longitude, address
  }: Location) => set(() => ({ userLatitude: latitude, userLongitude: longitude, userAddress: address })),
  setDestinationLocation: ({latitude, longitude, address
  }: Location) => set(() => ({ destinationLatitude: latitude, destinationLongitude: longitude, destinationAddress: address })),
  setIsLoading: (value: boolean) => set({ isLoading: value })
}))

declare interface DriverStore {
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
  setSelectedDriver: (driver_id) => set(() => ({selectedDriver: driver_id})),
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
  }
}))