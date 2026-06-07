import {MarkerData} from "@/types/type";
import { getDriverFullName, getEnrichedRide } from "./dataResolvers";

// Use ambient types from data.d.ts: DriverProfile, NearbyDriver, Location, etc.
// Relaxed marker type used inside these helpers to avoid forcing all MarkerData
// required fields when generating markers from driver objects.
export type MapMarker = Partial<MarkerData> & {
    distance_km?: number;
    eta_minutes?: number;
    timeMinutes?: number | null;
    price?: number | null;
};
const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const MIN_LAT_DELTA = 0.005;
const MIN_LNG_DELTA = 0.005;
export const DEFAULT_REGION = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

/** Haversine formula to compute distance in kilometers between two coordinates. */
export const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/** Estimate ETA in minutes given distance (km) and average speed km/h. */
export const estimateEtaMinutes = (distanceKm: number, avgSpeedKmh = 30) => {
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
    const hours = distanceKm / avgSpeedKmh;
    return hours * 60;
};

/** Build a Google Directions URL for debugging or quick-open (not for API). */
export const buildGoogleDirectionsUrl = (origin: Location, destination: Location) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;
};

/**
 * Generate markers from driver profiles.
 * - Accepts `DriverProfile[]` (ambient type) or any object with latitude/longitude fields.
 * - Returns `MarkerData[]` augmented with `distance_km` and `eta_minutes`.
 */
export const generateMarkersFromData = ({
    data,
    userLatitude,
    userLongitude,
    options,
}: {
    // Accept DriverProfile, a relaxed MapMarker (from store/UI), or partial DriverProfile
    data: DriverProfile | MapMarker | AppMarker[] | Partial<DriverProfile>[];
    userLatitude?: number | null;
    userLongitude?: number | null;
    options?: { maxOffsetMeters?: number; avgSpeedKmh?: number };
}): MapMarker[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const { maxOffsetMeters = 200, avgSpeedKmh = 30 } = options || {};

    const userHasCoords = typeof userLatitude === 'number' && typeof userLongitude === 'number';

    // convert meters to degrees approx (very rough, ok for small offsets)
    const metersToDegrees = (meters: number) => meters / 111320;
    const maxOffsetDegrees = metersToDegrees(maxOffsetMeters);

    return data.map((driver) => {
        const baseLat = (driver.current_latitude as number) || (userLatitude as number) || DEFAULT_REGION.latitude;
        const baseLng = (driver.current_longitude as number) || (userLongitude as number) || DEFAULT_REGION.longitude;

        // small jitter if driver coords are identical to user or missing
        const lat = baseLat + (Math.random() - 0.5) * maxOffsetDegrees;
        const lng = baseLng + (Math.random() - 0.5) * maxOffsetDegrees;

        const distance_km = userHasCoords ? haversineDistanceKm(userLatitude as number, userLongitude as number, lat, lng) : undefined;
        const eta_minutes = typeof distance_km === 'number' ? estimateEtaMinutes(distance_km, avgSpeedKmh) : undefined;

        const title = driver.user_id
            ? getDriverFullName(driver as { user_id: string })
            : 'Driver';

        return {
            latitude: lat,
            longitude: lng,
            title,
            distance_km,
            eta_minutes,
            ...driver,
        } as MapMarker;
    });
};

/**
 * Calculate a region that encompasses user and destination. Returns an object compatible with MapView `region`.
 */
export const calculateRegion = ({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
}: {
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude?: number | null;
    destinationLongitude?: number | null;
}) => {
    if (typeof userLatitude !== 'number' || typeof userLongitude !== 'number') return DEFAULT_REGION;

    if (typeof destinationLatitude !== 'number' || typeof destinationLongitude !== 'number') {
        return {
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: Math.max(MIN_LAT_DELTA, 0.01),
            longitudeDelta: Math.max(MIN_LNG_DELTA, 0.01),
        };
    }

    const minLat = Math.min(userLatitude, destinationLatitude as number);
    const maxLat = Math.max(userLatitude, destinationLatitude as number);
    const minLng = Math.min(userLongitude, destinationLongitude as number);
    const maxLng = Math.max(userLongitude, destinationLongitude as number);

    let latitudeDelta = (maxLat - minLat) * 1.3;
    let longitudeDelta = (maxLng - minLng) * 1.3;

    if (!Number.isFinite(latitudeDelta) || latitudeDelta < MIN_LAT_DELTA) latitudeDelta = MIN_LAT_DELTA;
    if (!Number.isFinite(longitudeDelta) || longitudeDelta < MIN_LNG_DELTA) longitudeDelta = MIN_LNG_DELTA;

    const latitude = (userLatitude + (destinationLatitude as number)) / 2;
    const longitude = (userLongitude + (destinationLongitude as number)) / 2;

    return { latitude, longitude, latitudeDelta, longitudeDelta };
};

/** Simple exponential backoff retry helper for fetch. */
const fetchWithRetry = async (url: string, opts: any = {}, retries = 2, backoff = 300): Promise<any> => {
    try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    } catch (err) {
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, backoff));
            return fetchWithRetry(url, opts, retries - 1, backoff * 2);
        }
        throw err;
    }
};

/**
 * Calculate driver times and prices.
 * - If `useGoogle` is true and API key present, will call Directions API (costly) with concurrency control.
 * - Otherwise falls back to distance-based ETA estimation.
 */
export const calculateDriverTimes = async ({
    markers,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    options,
}: {
    markers: MapMarker[] | MarkerData[];
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
    options?: { useGoogle?: boolean; concurrency?: number; avgSpeedKmh?: number; ratePerMinute?: number };
}): Promise<MapMarker[]> => {
    const { useGoogle = false, concurrency = 5, avgSpeedKmh = 30, ratePerMinute = 0.5 } = options || {};

    if (!markers || markers.length === 0) return [];

    const hasUserCoords = typeof userLatitude === 'number' && typeof userLongitude === 'number';
    const hasDestCoords = typeof destinationLatitude === 'number' && typeof destinationLongitude === 'number';

    // Fallback simple estimation if required inputs missing
    if (!hasUserCoords || !hasDestCoords) {
        return markers.map((m) => {
            if (typeof m.latitude === 'number' && typeof m.longitude === 'number' && hasUserCoords) {
                const d1 = haversineDistanceKm(userLatitude as number, userLongitude as number, m.latitude as number, m.longitude as number);
                const d2 = hasDestCoords ? haversineDistanceKm(userLatitude as number, userLongitude as number, destinationLatitude as number, destinationLongitude as number) : 0;
                const timeMinutes = estimateEtaMinutes(d1 + d2, avgSpeedKmh);
                return { ...(m as MapMarker), timeMinutes, price: Number((timeMinutes * ratePerMinute).toFixed(2)) } as MapMarker;
            }
            return { ...(m as MapMarker), timeMinutes: null, price: null } as MapMarker;
        });
    }

    // If Google usage requested but no API key, fallback to estimation
    const shouldUseGoogle = useGoogle && !!directionsAPI;

    const tasks = markers.map((marker) => async (): Promise<MapMarker> => {
        try {
            if (!shouldUseGoogle) {
                const d1 = haversineDistanceKm(marker.latitude as number, marker.longitude as number, userLatitude as number, userLongitude as number);
                const d2 = haversineDistanceKm(userLatitude as number, userLongitude as number, destinationLatitude as number, destinationLongitude as number);
                const timeMinutes = estimateEtaMinutes(d1 + d2, avgSpeedKmh);
                return { ...(marker as MapMarker), timeMinutes, price: Number((timeMinutes * ratePerMinute).toFixed(2)) } as MapMarker;
            }

            // Use Google Directions: origin marker -> user, then user -> destination
            const url1 = `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`;
            const url2 = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`;

            const [dataToUser, dataToDestination] = await Promise.all([fetchWithRetry(url1), fetchWithRetry(url2)]);

            const secs1 = dataToUser?.routes?.[0]?.legs?.[0]?.duration?.value ?? null;
            const secs2 = dataToDestination?.routes?.[0]?.legs?.[0]?.duration?.value ?? null;

            if (typeof secs1 !== 'number' || typeof secs2 !== 'number') {
                // fallback to estimation
                const d1 = haversineDistanceKm(marker.latitude as number, marker.longitude as number, userLatitude as number, userLongitude as number);
                const d2 = haversineDistanceKm(userLatitude as number, userLongitude as number, destinationLatitude as number, destinationLongitude as number);
                const timeMinutes = estimateEtaMinutes(d1 + d2, avgSpeedKmh);
                return { ...(marker as MapMarker), timeMinutes, price: Number((timeMinutes * ratePerMinute).toFixed(2)) } as MapMarker;
            }

            const totalMinutes = (secs1 + secs2) / 60;
            const price = Number((totalMinutes * ratePerMinute).toFixed(2));
            return { ...(marker as MapMarker), timeMinutes: totalMinutes, price } as MapMarker;
        } catch (err) {
            console.error('calculateDriverTimes task error', err);
            return { ...(marker as MapMarker), timeMinutes: null, price: null } as MapMarker;
        }
    });

    // Simple concurrency runner
    const results: MapMarker[] = [];
    for (let i = 0; i < tasks.length; i += concurrency) {
        const batch = tasks.slice(i, i + concurrency).map((t) => t());
        // eslint-disable-next-line no-await-in-loop
        const settled = await Promise.all(batch);
        results.push(...(settled as MapMarker[]));
    }

    return results;
};

/*
Exports overview (quick reference)

- `MapMarker` (type):
    - A relaxed marker shape used in mapping helpers. Contains optional map fields
        plus helper fields: `distance_km`, `eta_minutes`, `timeMinutes`, `price`.

- `haversineDistanceKm(lat1, lon1, lat2, lon2)`:
    - Returns distance in kilometers between two coordinates using the Haversine formula.
    - Use for proximity calculations, clustering or ETA fallbacks.
    - Example: `const km = haversineDistanceKm(6.5, 3.3, 6.52, 3.38)`

- `estimateEtaMinutes(distanceKm, avgSpeedKmh = 30)`:
    - Simple ETA estimator (minutes) using average speed in km/h.
    - Useful when you don't want to call an external directions API.
    - Example: `const eta = estimateEtaMinutes(2.4, 25)`

- `buildGoogleDirectionsUrl(origin, destination)`:
    - Builds a Google Maps directions URL for quick debugging or UI deep-linking.
    - Not an API call; opens Google Maps in browser.
    - Example: `buildGoogleDirectionsUrl({latitude:6.5,longitude:3.3},{latitude:6.6,longitude:3.4})`

- `generateMarkersFromData({ data, userLatitude, userLongitude, options })`:
    - Generates an array of `MapMarker` from driver profiles. Adds small jitter to
        coordinates when needed, and computes `distance_km` and `eta_minutes` when
        user coordinates are provided.
    - Options: `maxOffsetMeters` (default 200), `avgSpeedKmh` (default 30).
    - Returns `MapMarker[]` — a safe partial marker type you can map into full
        app `MarkerData` when rendering markers.

- `calculateRegion({ userLatitude, userLongitude, destinationLatitude, destinationLongitude })`:
    - Returns a region object compatible with MapView `initialRegion`/`region`.
    - Handles missing values and ensures minimum latitude/longitude deltas.
    - Useful to set camera bounds that include both user and destination.

- `calculateDriverTimes({ markers, userLatitude, userLongitude, destinationLatitude, destinationLongitude, options })`:
    - Computes per-marker ETA (`timeMinutes`) and `price`.
    - Two modes: distance-based estimation (fast, free) or Google Directions
        (more accurate but requires an API key and costs requests).
    - Options: `useGoogle` (boolean), `concurrency` (parallel requests),
        `avgSpeedKmh`, `ratePerMinute`.
    - Returns `MapMarker[]` with `timeMinutes` and `price` populated where possible.

Notes:
- The helpers are designed to be resilient: they validate inputs, fall back to
    estimations when the Directions API is unavailable or returns unexpected data,
    and avoid unsafe type casts by using `MapMarker`.
- To integrate with your UI, map `MapMarker` elements into the full `MarkerData`
    shape your components expect (copy/derive missing fields such as images or
    vehicle metadata from your driver objects).
*/