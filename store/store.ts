import { create } from 'zustand'

interface LocationStore {
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
                    }: {
                      latitude: number;
                      longitude: number;
                      address: string;
  }) => void;
  setDestinationLocation: ({
                      latitude,
                      longitude,
                      address,
                    }: {
                      latitude: number;
                      longitude: number;
                      address: string;
  }) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLatitude: null,
  userLongitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  destinationLatitude: null,
  setUserLocation: ({latitude, longitude, address
  }: {latitude: number, longitude: number, address: string}) => set(() => ({ userLatitude: latitude, userLongitude: longitude, userAddress: address })),
  setDestinationLocation: ({latitude, longitude, address
  }: {latitude: number, longitude: number, address: string}) => set(() => ({ destinationLatitude: latitude, destinationLongitude: longitude, destinationAddress: address }))
}))