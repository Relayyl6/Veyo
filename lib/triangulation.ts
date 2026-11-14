/**
 * lib/triangulation.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Geospatial Mobility Architecture: Multi-Point Triangulation & Routing Engine
 * Built for high-concurrency ride-hailing & courier dispatch (Uber / Bolt baseline).
 *
 * Core Capabilities:
 *  1. Multi-Point Triangulation:
 *     - Point A: Pickup / Origin (L_pickup)
 *     - Point B: Live Courier / Driver Radar (L_driver)
 *     - Point C: Destination / Dropoff (L_dropoff)
 *     - Point D...: Checkpoints & Multi-Drop Waypoints (L_checkpoint)
 *  2. Geoapify Routing API Integration:
 *     - Dispatch Leg (Driver -> Pickup) with ETA, road polyline & bearing
 *     - Transit Leg (Pickup -> Dropoff) with turn-by-turn road geometry
 *     - Multi-Drop Delivery Sequence with per-leg milestones & cumulative ETAs
 *  3. Dynamic Fare Estimation Engine:
 *     - Base Fare + (Distance km * perKm) + (Duration mins * perMin) * Surge Multiplier
 *     - Tier configurations for Veyo Rides (Economy, Comfort, EV, Bike, Black)
 *     - Tier configurations for Package Delivery (Standard, Express, Heavy Cargo)
 *  4. Live Trip / Delivery Lifecycle State Machine:
 *     - Stages: idle -> dispatch_searching -> driver_assigned -> driver_arrived
 *              -> in_transit -> approaching_destination -> completed
 *  5. Street-level Bearing & Position Interpolation:
 *     - Real-time vehicle rotation along road segments
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export type WaypointType = 'pickup' | 'dropoff' | 'checkpoint' | 'driver';

export interface Waypoint {
  id: string;
  coordinate: GeoPoint;
  type: WaypointType;
  title: string;
  address?: string;
  completed?: boolean;
  eta?: string;
  sequence?: number;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

export interface RouteLeg {
  from: GeoPoint;
  to: GeoPoint;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMins: number;
  polyline: GeoPoint[];
  formattedDistance: string;
  formattedDuration: string;
}

export interface TriangulatedRoute {
  polyline: GeoPoint[];
  totalDistanceKm: number;
  totalDurationMins: number;
  formattedDistance: string;
  formattedDuration: string;
  legs: RouteLeg[];
}

export interface DispatchTriangulationResult {
  dispatchLeg: RouteLeg;
  transitLeg: RouteLeg;
  multiDropLegs: RouteLeg[];
  fullPolyline: GeoPoint[];
  totalDistanceKm: number;
  totalDurationMins: number;
  formattedDistance: string;
  formattedDuration: string;
  driverBearing: number;
  estimatedPickupEta: string;
  estimatedDropoffEta: string;
}

// ─────────────────────────────────────────────────────────────
// 1. FARE ENGINE DEFINITIONS & TIERS
// ─────────────────────────────────────────────────────────────

export type RideTierId = 'economy' | 'comfort' | 'ev' | 'bike' | 'black';
export type DeliveryTierId = 'standard_parcel' | 'express_courier' | 'cargo_heavy';

export interface PricingTierConfig {
  id: string;
  name: string;
  subtitle: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  speedKmh: number;
  icon: string;
}

export const RIDE_TIERS: Record<RideTierId, PricingTierConfig> = {
  economy: {
    id: 'economy',
    name: 'Economy',
    subtitle: 'Affordable daily urban trips',
    baseFare: 4.0,
    perKmRate: 1.2,
    perMinuteRate: 0.25,
    minimumFare: 5.5,
    speedKmh: 35,
    icon: 'car',
  },
  comfort: {
    id: 'comfort',
    name: 'Comfort',
    subtitle: 'Spacious sedans with premium climate',
    baseFare: 6.5,
    perKmRate: 1.75,
    perMinuteRate: 0.35,
    minimumFare: 8.5,
    speedKmh: 35,
    icon: 'car-sport',
  },
  ev: {
    id: 'ev',
    name: 'Veyo EV',
    subtitle: 'Zero emissions, clean electric drive',
    baseFare: 5.0,
    perKmRate: 1.4,
    perMinuteRate: 0.3,
    minimumFare: 7.0,
    speedKmh: 35,
    icon: 'leaf',
  },
  bike: {
    id: 'bike',
    name: 'Express Bike',
    subtitle: 'Fastest through dense city traffic',
    baseFare: 2.5,
    perKmRate: 0.75,
    perMinuteRate: 0.15,
    minimumFare: 3.5,
    speedKmh: 42,
    icon: 'bicycle',
  },
  black: {
    id: 'black',
    name: 'Veyo Black',
    subtitle: 'VIP chauffeured luxury sedans',
    baseFare: 10.0,
    perKmRate: 2.5,
    perMinuteRate: 0.5,
    minimumFare: 16.0,
    speedKmh: 35,
    icon: 'shield-checkmark',
  },
};

export const DELIVERY_TIERS: Record<DeliveryTierId, PricingTierConfig> = {
  standard_parcel: {
    id: 'standard_parcel',
    name: 'Standard Parcel',
    subtitle: 'Documents, envelopes, keys & small packages',
    baseFare: 3.5,
    perKmRate: 0.9,
    perMinuteRate: 0.2,
    minimumFare: 5.0,
    speedKmh: 38,
    icon: 'mail',
  },
  express_courier: {
    id: 'express_courier',
    name: 'Express Courier',
    subtitle: 'Priority dedicated direct dispatch',
    baseFare: 5.5,
    perKmRate: 1.35,
    perMinuteRate: 0.25,
    minimumFare: 7.5,
    speedKmh: 40,
    icon: 'flash',
  },
  cargo_heavy: {
    id: 'cargo_heavy',
    name: 'Cargo & Heavy Boxes',
    subtitle: 'Bulk goods, multiple parcels & freight',
    baseFare: 9.0,
    perKmRate: 2.0,
    perMinuteRate: 0.4,
    minimumFare: 15.0,
    speedKmh: 30,
    icon: 'cube',
  },
};

export interface FareBreakdown {
  tierId: string;
  tierName: string;
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  surgeMultiplier: number;
  surgeAmount: number;
  subtotal: number;
  totalFare: number;
  formattedTotal: string;
  currency: string;
}

// ─────────────────────────────────────────────────────────────
// 2. LIFECYCLE STATE MACHINE
// ─────────────────────────────────────────────────────────────

export type TripLifecycleStage =
  | 'idle'
  | 'dispatch_searching'
  | 'driver_assigned'
  | 'driver_arrived'
  | 'in_transit'
  | 'approaching_destination'
  | 'completed'
  | 'canceled';

export interface TripLifecycleState {
  stage: TripLifecycleStage;
  driverLocation: GeoPoint | null;
  driverBearing: number;
  progressPercent: number; // 0 - 100
  activeWaypointIndex: number;
  statusLabel: string;
  statusDescription: string;
  remainingDistanceKm: number;
  remainingMinutes: number;
  etaFormatted: string;
}

const STAGE_ORDER: TripLifecycleStage[] = [
  'idle',
  'dispatch_searching',
  'driver_assigned',
  'driver_arrived',
  'in_transit',
  'approaching_destination',
  'completed',
];

export function canTransitionStage(
  current: TripLifecycleStage,
  next: TripLifecycleStage
): boolean {
  if (next === 'canceled') return current !== 'completed';
  const currIdx = STAGE_ORDER.indexOf(current);
  const nextIdx = STAGE_ORDER.indexOf(next);
  return nextIdx === currIdx + 1;
}

export function getStageMetadata(stage: TripLifecycleStage): {
  label: string;
  description: string;
  color: string;
  icon: string;
} {
  switch (stage) {
    case 'idle':
      return {
        label: 'Ready to Book',
        description: 'Set your destination to view instant upfront route and pricing.',
        color: '#6B7280',
        icon: 'map-outline',
      };
    case 'dispatch_searching':
      return {
        label: 'Locating Nearest Driver',
        description: 'Matching with top-rated drivers and couriers nearby...',
        color: '#0286FF',
        icon: 'radar',
      };
    case 'driver_assigned':
      return {
        label: 'Driver En Route',
        description: 'Driver accepted your trip and is heading to the pickup point.',
        color: '#F59E0B',
        icon: 'navigate',
      };
    case 'driver_arrived':
      return {
        label: 'Driver Arrived',
        description: 'Your driver is waiting at the pickup location.',
        color: '#10B981',
        icon: 'location',
      };
    case 'in_transit':
      return {
        label: 'On the Way',
        description: 'Trip in progress. Following optimal real-time road path.',
        color: '#3B82F6',
        icon: 'speedometer',
      };
    case 'approaching_destination':
      return {
        label: 'Approaching Destination',
        description: 'Less than 2 minutes remaining. Prepare for drop-off.',
        color: '#8B5CF6',
        icon: 'flag',
      };
    case 'completed':
      return {
        label: 'Trip Completed',
        description: 'You have safely reached your destination.',
        color: '#059669',
        icon: 'checkmark-circle',
      };
    case 'canceled':
      return {
        label: 'Trip Canceled',
        description: 'The dispatch request was canceled.',
        color: '#EF4444',
        icon: 'close-circle',
      };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. MATHEMATICAL GEOSPATIAL PRIMITIVES
// ─────────────────────────────────────────────────────────────

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_KM = 6371;

/**
 * High-precision Haversine distance in kilometers.
 */
export function haversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const dLat = (p2.latitude - p1.latitude) * DEG_TO_RAD;
  const dLon = (p2.longitude - p1.longitude) * DEG_TO_RAD;
  const lat1 = p1.latitude * DEG_TO_RAD;
  const lat2 = p2.latitude * DEG_TO_RAD;

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const a = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates initial forward compass bearing (0° - 360°) from point A to point B.
 */
export function calculateBearing(from: GeoPoint, to: GeoPoint): number {
  const lat1 = from.latitude * DEG_TO_RAD;
  const lat2 = to.latitude * DEG_TO_RAD;
  const dLon = (to.longitude - from.longitude) * DEG_TO_RAD;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = Math.atan2(y, x) * RAD_TO_DEG;
  return (brng + 360) % 360;
}

/**
 * Sums actual road distance along polyline coordinates.
 */
export function polylineDistanceKm(polyline: GeoPoint[]): number {
  if (polyline.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineDistanceKm(polyline[i], polyline[i + 1]);
  }
  return total;
}

/**
 * Interpolates a point and road heading at progress ratio (0 to 1) along a polyline.
 */
export function interpolatePointAlongPolyline(
  polyline: GeoPoint[],
  ratio: number
): { point: GeoPoint; bearing: number; segmentIndex: number } {
  if (!polyline || polyline.length === 0) {
    return { point: { latitude: 0, longitude: 0 }, bearing: 0, segmentIndex: 0 };
  }
  if (polyline.length === 1 || ratio <= 0) {
    const bearing = polyline.length > 1 ? calculateBearing(polyline[0], polyline[1]) : 0;
    return { point: polyline[0], bearing, segmentIndex: 0 };
  }
  if (ratio >= 1) {
    const last = polyline[polyline.length - 1];
    const prev = polyline[polyline.length - 2];
    return {
      point: last,
      bearing: calculateBearing(prev, last),
      segmentIndex: polyline.length - 2,
    };
  }

  // Pre-calculate cumulative lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const len = haversineDistanceKm(polyline[i], polyline[i + 1]);
    segmentLengths.push(len);
    totalLength += len;
  }

  const targetDist = totalLength * ratio;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const nextAccum = accumulated + segmentLengths[i];
    if (nextAccum >= targetDist || i === segmentLengths.length - 1) {
      const segLen = segmentLengths[i] || 0.0001;
      const segRatio = Math.max(0, Math.min(1, (targetDist - accumulated) / segLen));
      const p1 = polyline[i];
      const p2 = polyline[i + 1];

      const lat = p1.latitude + (p2.latitude - p1.latitude) * segRatio;
      const lng = p1.longitude + (p2.longitude - p1.longitude) * segRatio;
      const bearing = calculateBearing(p1, p2);

      return {
        point: { latitude: lat, longitude: lng },
        bearing,
        segmentIndex: i,
      };
    }
    accumulated = nextAccum;
  }

  return {
    point: polyline[polyline.length - 1],
    bearing: 0,
    segmentIndex: polyline.length - 1,
  };
}

/**
 * Formats distance with unit localization.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Formats duration into minutes or hours.
 */
export function formatDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 1) return '< 1 min';
  if (rounded < 60) return `${rounded} min`;
  const hrs = Math.floor(rounded / 60);
  const remainingMins = rounded % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

// ─────────────────────────────────────────────────────────────
// 4. GEOAPIFY ROUTING SERVICE
// ─────────────────────────────────────────────────────────────

const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ?? '9c5d12edbcc14f59bbb02c74ee09859d';

/**
 * Safely extracts coordinate pairs from GeoJSON geometry.
 */
function extractCoordinates(geometry: any): GeoPoint[] {
  if (!geometry) return [];
  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.map(([lon, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lon,
    }));
  }
  if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
    const flattened = (geometry.coordinates as [number, number][][]).flat(1);
    return flattened.map(([lon, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lon,
    }));
  }
  return [];
}

/**
 * Generates synthetic urban road grid polyline between two points when offline or on network failure.
 */
function generateFallbackRoadPolyline(from: GeoPoint, to: GeoPoint): GeoPoint[] {
  const points: GeoPoint[] = [from];
  const midLat = (from.latitude + to.latitude) / 2;
  const midLon = (from.longitude + to.longitude) / 2;

  // Simulate dog-leg road turns
  points.push({ latitude: from.latitude, longitude: midLon });
  points.push({ latitude: midLat, longitude: midLon });
  points.push({ latitude: midLat, longitude: to.longitude });
  points.push(to);

  return points;
}

/**
 * Calls Geoapify Routing API to calculate true road polyline, distance, and duration.
 */
export async function fetchGeoapifyRoute(
  waypoints: GeoPoint[],
  mode: 'drive' | 'bicycle' | 'walk' = 'drive'
): Promise<TriangulatedRoute> {
  if (waypoints.length < 2) {
    throw new Error('Routing requires at least 2 waypoints (origin and destination)');
  }

  const waypointsParam = waypoints
    .map((wp) => `${wp.latitude.toFixed(6)},${wp.longitude.toFixed(6)}`)
    .join('|');

  const url =
    `https://api.geoapify.com/v1/routing` +
    `?waypoints=${encodeURIComponent(waypointsParam)}` +
    `&mode=${mode}` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geoapify Routing failed with status ${res.status}`);
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      throw new Error('No route returned by Geoapify');
    }

    const coordinates = extractCoordinates(feature.geometry);
    const properties = feature.properties ?? {};
    const totalDistanceMeters = properties.distance ?? 0;
    const totalDurationSeconds = properties.time ?? 0;

    const totalDistanceKm = totalDistanceMeters / 1000;
    const totalDurationMins = totalDurationSeconds / 60;

    // Parse legs if available
    const legs: RouteLeg[] = [];
    const rawLegs = properties.legs || [];

    if (rawLegs.length > 0 && waypoints.length - 1 === rawLegs.length) {
      let currentCoordIdx = 0;
      for (let i = 0; i < rawLegs.length; i++) {
        const legData = rawLegs[i];
        const legDistMeters = legData.distance || 0;
        const legSecs = legData.time || 0;
        const fromPt = waypoints[i];
        const toPt = waypoints[i + 1];

        // Slice subset or fallback
        const sliceCount = Math.max(
          2,
          Math.floor((coordinates.length / rawLegs.length) * (i + 1))
        );
        const legPolyline = coordinates.slice(currentCoordIdx, sliceCount);
        currentCoordIdx = Math.max(0, sliceCount - 1);

        legs.push({
          from: fromPt,
          to: toPt,
          distanceMeters: legDistMeters,
          distanceKm: legDistMeters / 1000,
          durationSeconds: legSecs,
          durationMins: legSecs / 60,
          polyline: legPolyline.length >= 2 ? legPolyline : [fromPt, toPt],
          formattedDistance: formatDistance(legDistMeters / 1000),
          formattedDuration: formatDuration(legSecs / 60),
        });
      }
    } else {
      // Single composite leg
      legs.push({
        from: waypoints[0],
        to: waypoints[waypoints.length - 1],
        distanceMeters: totalDistanceMeters,
        distanceKm: totalDistanceKm,
        durationSeconds: totalDurationSeconds,
        durationMins: totalDurationMins,
        polyline: coordinates,
        formattedDistance: formatDistance(totalDistanceKm),
        formattedDuration: formatDuration(totalDurationMins),
      });
    }

    return {
      polyline: coordinates,
      totalDistanceKm,
      totalDurationMins,
      formattedDistance: formatDistance(totalDistanceKm),
      formattedDuration: formatDuration(totalDurationMins),
      legs,
    };
  } catch (err) {
    console.warn('[triangulation] Geoapify Routing fallback triggered:', err);
    // Offline / Network fallback
    let combinedPolyline: GeoPoint[] = [];
    const legs: RouteLeg[] = [];
    let accumKm = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const legPoly = generateFallbackRoadPolyline(from, to);
      const legDist = polylineDistanceKm(legPoly);
      const legMins = (legDist / 30) * 60; // 30 km/h average urban speed

      accumKm += legDist;
      legs.push({
        from,
        to,
        distanceMeters: Math.round(legDist * 1000),
        distanceKm: legDist,
        durationSeconds: Math.round(legMins * 60),
        durationMins: legMins,
        polyline: legPoly,
        formattedDistance: formatDistance(legDist),
        formattedDuration: formatDuration(legMins),
      });

      if (i === 0) {
        combinedPolyline = legPoly;
      } else {
        combinedPolyline.push(...legPoly.slice(1));
      }
    }

    const totalMins = (accumKm / 30) * 60;

    return {
      polyline: combinedPolyline,
      totalDistanceKm: accumKm,
      totalDurationMins: totalMins,
      formattedDistance: formatDistance(accumKm),
      formattedDuration: formatDuration(totalMins),
      legs,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// 5. ARCHITECTURAL TRIANGULATION DISPATCH ENGINE (UBER / BOLT)
// ─────────────────────────────────────────────────────────────

/**
 * Triangulates:
 *   Leg 1: Driver -> Pickup (Dispatch Leg)
 *   Leg 2: Pickup -> Destination (Transit Leg)
 *   Optional Leg 3+: Delivery Checkpoints / Stops
 */
export async function calculateDispatchTriangulation({
  driverPosition,
  pickup,
  dropoff,
  checkpoints = [],
  mode = 'drive',
}: {
  driverPosition: GeoPoint;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  checkpoints?: Waypoint[];
  mode?: 'drive' | 'bicycle' | 'walk';
}): Promise<DispatchTriangulationResult> {
  // 1. Calculate Driver -> Pickup Leg
  const dispatchRoute = await fetchGeoapifyRoute([driverPosition, pickup], mode);
  const dispatchLeg = dispatchRoute.legs[0] || {
    from: driverPosition,
    to: pickup,
    distanceMeters: Math.round(dispatchRoute.totalDistanceKm * 1000),
    distanceKm: dispatchRoute.totalDistanceKm,
    durationSeconds: Math.round(dispatchRoute.totalDurationMins * 60),
    durationMins: dispatchRoute.totalDurationMins,
    polyline: dispatchRoute.polyline,
    formattedDistance: dispatchRoute.formattedDistance,
    formattedDuration: dispatchRoute.formattedDuration,
  };

  // Compute initial bearing for the driver marker rotation
  const driverBearing =
    dispatchRoute.polyline.length >= 2
      ? calculateBearing(dispatchRoute.polyline[0], dispatchRoute.polyline[1])
      : calculateBearing(driverPosition, pickup);

  // 2. Calculate Transit Sequence: Pickup -> [Checkpoints...] -> Dropoff
  const transitWaypoints: GeoPoint[] = [pickup];
  for (const cp of checkpoints) {
    transitWaypoints.push(cp.coordinate);
  }
  transitWaypoints.push(dropoff);

  const transitRoute = await fetchGeoapifyRoute(transitWaypoints, mode);
  const transitLeg = transitRoute.legs[0] || {
    from: pickup,
    to: dropoff,
    distanceMeters: Math.round(transitRoute.totalDistanceKm * 1000),
    distanceKm: transitRoute.totalDistanceKm,
    durationSeconds: Math.round(transitRoute.totalDurationMins * 60),
    durationMins: transitRoute.totalDurationMins,
    polyline: transitRoute.polyline,
    formattedDistance: transitRoute.formattedDistance,
    formattedDuration: transitRoute.formattedDuration,
  };

  const multiDropLegs = transitRoute.legs;

  // Composite full polyline (dispatch + transit)
  const fullPolyline = [...dispatchRoute.polyline, ...transitRoute.polyline];

  const totalDistanceKm = dispatchRoute.totalDistanceKm + transitRoute.totalDistanceKm;
  const totalDurationMins = dispatchRoute.totalDurationMins + transitRoute.totalDurationMins;

  return {
    dispatchLeg,
    transitLeg,
    multiDropLegs,
    fullPolyline,
    totalDistanceKm,
    totalDurationMins,
    formattedDistance: formatDistance(totalDistanceKm),
    formattedDuration: formatDuration(totalDurationMins),
    driverBearing,
    estimatedPickupEta: dispatchRoute.formattedDuration,
    estimatedDropoffEta: transitRoute.formattedDuration,
  };
}

// ─────────────────────────────────────────────────────────────
// 6. DYNAMIC FARE ESTIMATION ENGINE
// ─────────────────────────────────────────────────────────────

export function calculateDynamicFare({
  distanceKm,
  durationMins,
  tierConfig,
  surgeMultiplier = 1.0,
  currency = '$',
}: {
  distanceKm: number;
  durationMins: number;
  tierConfig: PricingTierConfig;
  surgeMultiplier?: number;
  currency?: string;
}): FareBreakdown {
  const safeDist = Math.max(0, distanceKm);
  const safeDuration = Math.max(0, durationMins);
  const safeSurge = Math.max(1.0, surgeMultiplier);

  const baseFare = tierConfig.baseFare;
  const distanceCost = safeDist * tierConfig.perKmRate;
  const timeCost = safeDuration * tierConfig.perMinuteRate;

  const rawSubtotal = baseFare + distanceCost + timeCost;
  const surgeAmount = rawSubtotal * (safeSurge - 1);
  const totalBeforeMin = rawSubtotal * safeSurge;
  const totalFare = Math.max(tierConfig.minimumFare, Math.round(totalBeforeMin * 100) / 100);

  return {
    tierId: tierConfig.id,
    tierName: tierConfig.name,
    baseFare,
    distanceCost: Math.round(distanceCost * 100) / 100,
    timeCost: Math.round(timeCost * 100) / 100,
    surgeMultiplier: safeSurge,
    surgeAmount: Math.round(surgeAmount * 100) / 100,
    subtotal: Math.round(rawSubtotal * 100) / 100,
    totalFare,
    formattedTotal: `${currency}${totalFare.toFixed(2)}`,
    currency,
  };
}

export function estimateAllRideTiers({
  distanceKm,
  durationMins,
  surgeMultiplier = 1.0,
}: {
  distanceKm: number;
  durationMins: number;
  surgeMultiplier?: number;
}): Record<RideTierId, FareBreakdown> {
  const result: Partial<Record<RideTierId, FareBreakdown>> = {};
  for (const key of Object.keys(RIDE_TIERS) as RideTierId[]) {
    result[key] = calculateDynamicFare({
      distanceKm,
      durationMins,
      tierConfig: RIDE_TIERS[key],
      surgeMultiplier,
    });
  }
  return result as Record<RideTierId, FareBreakdown>;
}

export function estimateAllDeliveryTiers({
  distanceKm,
  durationMins,
  surgeMultiplier = 1.0,
}: {
  distanceKm: number;
  durationMins: number;
  surgeMultiplier?: number;
}): Record<DeliveryTierId, FareBreakdown> {
  const result: Partial<Record<DeliveryTierId, FareBreakdown>> = {};
  for (const key of Object.keys(DELIVERY_TIERS) as DeliveryTierId[]) {
    result[key] = calculateDynamicFare({
      distanceKm,
      durationMins,
      tierConfig: DELIVERY_TIERS[key],
      surgeMultiplier,
    });
  }
  return result as Record<DeliveryTierId, FareBreakdown>;
}

// ─────────────────────────────────────────────────────────────
// 7. DRIVER DISPATCH TRIANGULATION SELECTION
// ─────────────────────────────────────────────────────────────

export interface CandidateDriver {
  id: string | number;
  name: string;
  coordinate: GeoPoint;
  rating?: number;
  vehicleType?: 'car' | 'bike' | 'van';
}

/**
 * Evaluates a candidate pool of active drivers and picks the optimal unit
 * by triangulating dispatch distance and bearing.
 */
export function selectOptimalDriver(
  pickup: GeoPoint,
  drivers: CandidateDriver[]
): {
  driver: CandidateDriver;
  distanceKm: number;
  etaMins: number;
  bearing: number;
} | null {
  if (!drivers || drivers.length === 0) return null;

  let bestDriver = drivers[0];
  let minDistance = haversineDistanceKm(drivers[0].coordinate, pickup);

  for (let i = 1; i < drivers.length; i++) {
    const dist = haversineDistanceKm(drivers[i].coordinate, pickup);
    if (dist < minDistance) {
      minDistance = dist;
      bestDriver = drivers[i];
    }
  }

  const speedKmh = bestDriver.vehicleType === 'bike' ? 40 : 32;
  const etaMins = Math.max(1, Math.round((minDistance / speedKmh) * 60));
  const bearing = calculateBearing(bestDriver.coordinate, pickup);

  return {
    driver: bestDriver,
    distanceKm: minDistance,
    etaMins,
    bearing,
  };
}

// ─────────────────────────────────────────────────────────────
// 8. GEOAPIFY AUTOCOMPLETE & REVERSE GEOCODING
// ─────────────────────────────────────────────────────────────

export interface GeocodedPlace {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinate: GeoPoint;
  category?: string;
}

export async function searchPlacesGeoapify(
  query: string,
  proximity?: GeoPoint
): Promise<GeocodedPlace[]> {
  if (!query || query.trim().length < 2) return [];

  let url =
    `https://api.geoapify.com/v1/geocode/autocomplete` +
    `?text=${encodeURIComponent(query)}` +
    `&apiKey=${GEOAPIFY_API_KEY}` +
    `&limit=5`;

  if (proximity) {
    url += `&bias=proximity:${proximity.longitude.toFixed(6)},${proximity.latitude.toFixed(6)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const features: any[] = data.features || [];

    return features.map((feat) => {
      const props = feat.properties || {};
      const [lon, lat] = feat.geometry?.coordinates || [0, 0];
      return {
        placeId: props.place_id || `${lat},${lon}`,
        name: props.name || props.street || props.formatted || 'Address',
        formattedAddress: props.formatted || props.address_line2 || '',
        coordinate: { latitude: lat, longitude: lon },
        category: props.category || props.result_type,
      };
    });
  } catch (err) {
    console.warn('[triangulation] Geocoding search error:', err);
    return [];
  }
}

export async function reverseGeocodeGeoapify(point: GeoPoint): Promise<string> {
  const url =
    `https://api.geoapify.com/v1/geocode/reverse` +
    `?lat=${point.latitude.toFixed(6)}&lon=${point.longitude.toFixed(6)}` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
    const data = await res.json();
    const address = data.features?.[0]?.properties?.formatted;
    return address || `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
  } catch {
    return `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
  }
}
