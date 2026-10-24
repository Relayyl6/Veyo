import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Circle,
  MapType,
  MarkerAnimated,
  Region,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useLocationStore } from '@/store/store';

// ─────────────────────────────────────────────────────────────
//  GEO HELPER
//  Haversine formula: calculates the straight-line ("as the crow
//  flies") distance between two lat/lng points on a sphere.
//  Returns kilometres.
// ─────────────────────────────────────────────────────────────
export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * geoUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Road-aware distance utilities.
 *
 * WHY NOT HAVERSINE?
 * ─────────────────
 * Haversine gives you the straight-line ("as the crow flies") distance between
 * two GPS coordinates on a sphere. It completely ignores roads, rivers, walls,
 * and one-way streets — so "200m away" might actually be a 2km detour.
 *
 * WHAT WE DO INSTEAD
 * ──────────────────
 * The Google Directions API already returns a polyline — a sequence of GPS
 * coordinates that trace the actual road path. We sum up the Haversine
 * distance between each consecutive pair of points on that polyline.
 * Because the points are extremely close together (every ~5-20m along a road),
 * the straight-line error between each pair is negligible (~0.01%). The sum
 * accurately reflects road distance.
 *
 * DIAGRAM
 * ──────────────────────────────────────────────────────────
 *   A ──── B ──── C ──── D ──── E   ← polyline points (road)
 *   |      |      |      |      |
 *   d(A,B)+d(B,C)+d(C,D)+d(D,E) = road distance  ✓
 *
 *   vs
 *
 *   A ─────────────────────────── E  ← Haversine (straight line)  ✗
 *
 * WALKING ETA vs DRIVING ETA
 * ──────────────────────────
 * We expose two helpers:
 *   - walkingEta(km)  → assumes 5 km/h average walking speed
 *   - drivingEta(km)  → uses the Directions API duration directly (preferred)
 *     or falls back to 30 km/h urban driving estimate if API data unavailable
 *
 * For driving ETA, always prefer `leg.duration.text` from the Directions API
 * response — it accounts for real traffic, speed limits, and turn penalties.
 * The formula fallback here is only for "offline" / non-driving contexts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Coords {
  latitude: number;
  longitude: number;
}

// ─────────────────────────────────────────────────────────────
//  LOW-LEVEL: straight-line distance between two points
//  Still useful internally for measuring tiny polyline segments.
//  Do NOT use this for road distances or ETAs.
// ─────────────────────────────────────────────────────────────
function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = (b.latitude  - a.latitude)  * (Math.PI / 180);
  const dLon = (b.longitude - a.longitude) * (Math.PI / 180);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude  * (Math.PI / 180)) *
    Math.cos(b.latitude  * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

// ─────────────────────────────────────────────────────────────
//  ROAD DISTANCE  from a decoded polyline
//  Pass the `polyline` array returned by fetchRoadRoute().
//  Returns distance in kilometres along the actual road path.
// ─────────────────────────────────────────────────────────────
export function roadDistanceKm(polyline: Coords[]): number {
  if (polyline.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    // Each segment is tiny (5-20m), so Haversine error is < 0.01%
    total += haversineKm(polyline[i], polyline[i + 1]);
  }
  return total;
}

// ─────────────────────────────────────────────────────────────
//  FORMATTED ROAD DISTANCE  e.g. "2.4 km" or "850 m"
// ─────────────────────────────────────────────────────────────
export function formatRoadDistance(polyline: Coords[]): string {
  const km = roadDistanceKm(polyline);
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─────────────────────────────────────────────────────────────
//  WALKING ETA  from road distance
//  Uses 5 km/h (WHO standard comfortable walking pace).
//  Returns a human-readable string like "12 min".
// ─────────────────────────────────────────────────────────────
export function walkingEta(polyline: Coords[]): string {
  const km = roadDistanceKm(polyline);
  const minutes = Math.ceil((km / 5) * 60); // 5 km/h
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────────────────────
//  DRIVING ETA  fallback (prefer Directions API duration)
//  Use this ONLY when you have a polyline but no API duration text.
//  Assumes 30 km/h urban average (conservative, accounts for lights/turns).
// ─────────────────────────────────────────────────────────────
export function drivingEtaFallback(polyline: Coords[]): string {
  const km = roadDistanceKm(polyline);
  const minutes = Math.ceil((km / 30) * 60); // 30 km/h urban
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────────────────────
//  GOOGLE DIRECTIONS API  — full route fetch
//  Returns the decoded polyline + official duration/distance text
//  from Google (which uses real traffic data).
//
//  Teaching note: the `overview_polyline.points` field is a
//  compressed string encoding. We decode it into Coords[] so
//  react-native-maps can render it as a <Polyline>.
// ─────────────────────────────────────────────────────────────
function decodePolyline(encoded: string): Coords[] {
  const points: Coords[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export interface RouteResult {
  /** Decoded GPS points tracing the road — pass directly to <Polyline coordinates> */
  polyline: Coords[];
  /** Road distance in km (summed from polyline segments) */
  distanceKm: number;
  /** Human-readable distance e.g. "3.2 km" — from Google, includes unit localisation */
  distanceText: string;
  /** Human-readable duration e.g. "12 mins" — from Google, uses real traffic */
  durationText: string;
  /** Raw duration in seconds — useful for countdowns or progress bars */
  durationSeconds: number;
}

export async function fetchRoadRoute(
  origin: Coords,
  destination: Coords,
  mode: 'driving' | 'walking' | 'bicycling' = 'driving',
): Promise<RouteResult | null> {
  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=${mode}` +
    `&key=${GOOGLE_API_KEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK') {
      console.error('[fetchRoadRoute] Directions API error:', json.status, json.error_message);
      return null;
    }

    const leg = json.routes[0].legs[0];
    const polyline = decodePolyline(json.routes[0].overview_polyline.points);

    return {
      polyline,
      distanceKm:      roadDistanceKm(polyline),   // measured from actual polyline
      distanceText:    leg.distance.text,            // Google's formatted string
      durationText:    leg.duration.text,            // Google's formatted string (traffic-aware)
      durationSeconds: leg.duration.value,           // raw seconds
    };
  } catch (e) {
    console.error('[fetchRoadRoute] Network error:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  NEARBY PLACE ROAD DISTANCE  (batch helper)
//  For a list of places, fetches each road distance individually.
//  WARNING: this fires N Directions API calls — use sparingly
//  (e.g. max 5 places). For larger sets, use the Distance Matrix API.
//
//  Teaching note: Distance Matrix API is purpose-built for
//  "one origin → many destinations" queries. It's one request
//  instead of N, and is significantly cheaper at scale.
//  URL: https://maps.googleapis.com/maps/api/distancematrix/json
// ─────────────────────────────────────────────────────────────
export async function fetchRoadDistances(
  origin: Coords,
  destinations: Coords[],
  apiKey: string,
  mode: 'driving' | 'walking' = 'walking',
): Promise<Array<{ distanceText: string; durationText: string; durationSeconds: number } | null>> {
  if (destinations.length === 0) return [];

  // Build one Distance Matrix request instead of N Directions requests
  const destStr = destinations
    .map(d => `${d.latitude},${d.longitude}`)
    .join('|');

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${origin.latitude},${origin.longitude}` +
    `&destinations=${encodeURIComponent(destStr)}` +
    `&mode=${mode}` +
    `&key=${apiKey}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK') {
      console.error('[fetchRoadDistances] Distance Matrix error:', json.status);
      return destinations.map(() => null);
    }

    return json.rows[0].elements.map((el: any) => {
      if (el.status !== 'OK') return null;
      return {
        distanceText:    el.distance.text,
        durationText:    el.duration.text,
        durationSeconds: el.duration.value,
      };
    });
  } catch (e) {
    console.error('[fetchRoadDistances] Network error:', e);
    return destinations.map(() => null);
  }
}

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────
type MapTheme = 'dark' | 'light' | 'satellite';
type MapMode = 'ride' | 'food' | 'discover';
type DiscoverCategory = 'restaurant' | 'atm' | 'pos' | 'hotspot' | 'all';

interface Coords { latitude: number; longitude: number; }

interface NearbyPlace {
  id: string;
  name: string;
  category: DiscoverCategory;
  lat: number;
  lng: number;
  rating?: number;
  distance?: string;
  isOpen?: boolean;
  eta?: string;
}

interface RideState {
  pickup: Coords | null;
  dropoff: Coords | null;
  routePolyline: Coords[];   // decoded road route from Directions API
  driverLocation: Coords | null;
  driverEta: string;
  surgeMultiplier: number;
  routeDuration: string;
  routeDistance: string;
}

interface FoodState {
  restaurantLocation: Coords | null;
  restaurantName: string;
  riderLocation: Coords | null;
  deliveryEta: string;
  orderStatus: 'idle' | 'confirmed' | 'picked_up' | 'arriving';
}

// ─────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

const CATEGORY_META: Record<DiscoverCategory, { label: string; color: string; icon: string }> = {
  all:        { label: 'All',        color: '#1C75FF', icon: '🗺' },
  restaurant: { label: 'Eateries',   color: '#FF6B35', icon: '🍽' },
  atm:        { label: 'ATMs',       color: '#00C896', icon: '🏧' },
  pos:        { label: 'POS',        color: '#A259FF', icon: '💳' },
  hotspot:    { label: 'Hotspots',   color: '#FFD93D', icon: '🔥' },
};

const CATEGORY_TO_GOOGLE_TYPE: Record<DiscoverCategory, string> = {
  all:        'point_of_interest',
  restaurant: 'restaurant',
  atm:        'atm',
  pos:        'finance',
  hotspot:    'tourist_attraction',
};

// ─────────────────────────────────────────────────────────────
//  DARK MAP STYLE  (Google Maps JSON style — Android only)
//  On iOS, MapKit uses the system appearance automatically.
//  Teaching note: mapStyle is an array of "feature + element"
//  visibility/color rules applied server-side by Google.
// ─────────────────────────────────────────────────────────────
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b1528' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1528' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7a8baa' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#162040' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111e35' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a30' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111e35' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4a5a7a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111e35' }] },
];

// ─────────────────────────────────────────────────────────────
//  GOOGLE PLACES AUTOCOMPLETE  (REST, no extra native library)
//  Teaching note: We debounce the input so we don't call the
//  API on every single keystroke — we wait 350ms of silence.
// ─────────────────────────────────────────────────────────────
async function fetchSuggestions(
  input: string, origin: Coords,
): Promise<{ placeId: string; description: string }[]> {
  if (input.length < 2) return [];
  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&location=${origin.latitude},${origin.longitude}` +
    `&radius=50000&key=${GOOGLE_API_KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return [];
    return json.predictions.slice(0, 5).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
    }));
  } catch { return []; }
}

async function fetchPlaceCoords(placeId: string): Promise<Coords | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return null;
    const loc = json.result.geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
//  GOOGLE NEARBY PLACES
// ─────────────────────────────────────────────────────────────
function detectCategory(types: string[]): DiscoverCategory {
  if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
  if (types.includes('atm')) return 'atm';
  if (types.includes('finance')) return 'pos';
  return 'hotspot';
}

async function fetchNearbyPlaces(origin: Coords, category: DiscoverCategory): Promise<NearbyPlace[]> {
  // FIXED: If category is 'all', remove type restriction to prevent API failures
  const typeParam = category !== 'all' ? `&type=${CATEGORY_TO_GOOGLE_TYPE[category]}` : '';
  
  const placesUrl =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${origin.latitude},${origin.longitude}` +
    `&radius=1500${typeParam}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(placesUrl);
    const json = await res.json();
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') return [];

    const rawPlaces = (json.results as any[]).slice(0, 12);
    if (rawPlaces.length === 0) return [];

    const destinationsParam = rawPlaces
      .map((p) => `${p.geometry.location.lat},${p.geometry.location.lng}`)
      .join('|');

    const matrixUrl =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${origin.latitude},${origin.longitude}` +
      `&destinations=${destinationsParam}` +
      `&mode=driving&key=${GOOGLE_API_KEY}`;

    const matrixRes = await fetch(matrixUrl);
    const matrixJson = await matrixRes.json();
    const distanceRows = matrixJson.rows?.[0]?.elements || [];

    return rawPlaces.map((p, idx) => {
      const matrixElement = distanceRows[idx];
      let displayDistance = '0.00 km';
      let displayEta = '0 min';

      if (matrixElement && matrixElement.status === 'OK') {
        displayDistance = matrixElement.distance.text;
        displayEta = matrixElement.duration.text;
      } else {
        const straightLineDist = calculateHaversineDistance(
          origin.latitude, origin.longitude,
          p.geometry.location.lat, p.geometry.location.lng
        );
        displayDistance = straightLineDist.toFixed(2) + ' km';
        displayEta = `${Math.floor(straightLineDist / 0.08)} min`;
      }

      return {
        id: p.place_id,
        name: p.name,
        category: detectCategory(p.types), // Safe localized classification parser
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        rating: p.rating || 0,
        isOpen: p.opening_hours?.open_now ?? true,
        distance: displayDistance,
        eta: displayEta,
      };
    });
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────
//  AI INSIGHT (mock — swap for real Gemini/Claude call)
// ─────────────────────────────────────────────────────────────
function getAIInsight(mode: MapMode, surge: number): string {
  if (mode === 'ride') {
    return surge > 1.5
      ? `⚡ High demand. Prices +${Math.round((surge - 1) * 100)}%. Try in 12 min.`
      : '🧠 Light traffic on your usual route. Best time to book.';
  }
  if (mode === 'food') return '🍽 3 nearby spots have < 20 min delivery right now.';
  return '📍 Popular area — 5 eateries within 400m.';
}

// ─────────────────────────────────────────────────────────────
//  THEME PALETTE
// ─────────────────────────────────────────────────────────────
function getThemeColors(theme: MapTheme) {
  return theme === 'dark'
    ? { bg: '#0B1528', surface: '#111E35', card: '#162040', text: '#F0F4FF', sub: '#7A8BAA', border: '#1E2D4A', pill: '#1C2E4A', active: '#1C75FF' }
    : { bg: '#F5F7FA', surface: '#FFFFFF', card: '#FFFFFF', text: '#0D1B35', sub: '#6B7A99', border: '#DDE3F0', pill: '#E8EDF5', active: '#1C75FF' };
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function VeyoMapScreen() {
  // ── Core
  const [theme, setTheme] = useState<MapTheme>('dark');
  const [mode, setMode] = useState<MapMode>('ride');
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  // ── Map ref — used to animate the camera (flyTo equivalent)
  const mapRef = useRef<MapView>(null);

  // ── Search / Autocomplete
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<{ placeId: string; description: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Ride state
  const [pickupStage, setPickupStage] = useState<'pickup' | 'dropoff'>('pickup');
  const [rideState, setRideState] = useState<RideState>({
    pickup: null,
    dropoff: null,
    routePolyline: [],
    driverLocation: null,
    driverEta: '4 min',
    surgeMultiplier: 1.2,
    routeDuration: '',
    routeDistance: '',
  });

  // Teaching note: MarkerAnimated lets us smoothly animate a marker
  // between coordinates without removing/re-adding it.
  const driverCoordAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // ── Food state
  const [foodState, setFoodState] = useState<FoodState>({
    restaurantLocation: null,
    restaurantName: '',
    riderLocation: null,
    deliveryEta: '22 min',
    orderStatus: 'idle',
  });

  // ── Discover state
  const [discoverCategory, setDiscoverCategory] = useState<DiscoverCategory>('all');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // ── Animations
  const insightAnim = useRef(new Animated.Value(0)).current;

  const TC = getThemeColors(theme);

  const { userLatitude, userLongitude, isLoading, destinationLatitude, destinationLongitude } = useLocationStore()

  // ─────────────────────────
  //  Boot: request GPS
  // ─────────────────────────
  useEffect(() => {
    (async () => {  
      setOrigin({ latitude: userLatitude as number, longitude: userLongitude as number });
      setIsLoadingGPS(isLoading);
    })();
  }, []);

  // When origin loads, show AI insight and load default discover layer
  useEffect(() => {
    if (!origin) return;
    setAiInsight(getAIInsight(mode, rideState.surgeMultiplier));
    Animated.timing(insightAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadDiscoverPlaces('all');
  }, [origin]);

  // When mode changes, reset and reload
  useEffect(() => {
    setAiInsight(getAIInsight(mode, rideState.surgeMultiplier));
    setSelectedPlace(null);
    if (origin && mode === 'discover') loadDiscoverPlaces(discoverCategory);
  }, [mode]);

  useEffect(() => {
    if (mode === 'discover') loadDiscoverPlaces(discoverCategory);
  }, [discoverCategory]);

  // ─────────────────────────
  //  Fetch nearby places
  // ─────────────────────────
  const loadDiscoverPlaces = useCallback(async (cat: DiscoverCategory) => {
    if (!origin) return;
    const places = await fetchNearbyPlaces(origin, cat);
    setNearbyPlaces(places);
  }, [origin]);

  // ─────────────────────────
  //  Camera helper
  //  Teaching note: animateToRegion is react-native-maps' equivalent
  //  of Leaflet's flyTo(). We call it on the mapRef imperatively.
  // ─────────────────────────
  const flyTo = useCallback((lat: number, lng: number, delta = 0.01) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: delta, longitudeDelta: delta },
      800,
    );
  }, []);

  const fitToCoords = useCallback((coords: Coords[]) => {
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, right: 60, bottom: 280, left: 60 },
      animated: true,
    });
  }, []);

  // ─────────────────────────
  //  Ride: map press handler
  //  Teaching note: <MapView onPress> gives us the tapped coordinate
  //  directly — no postMessage bridge needed like in the WebView version.
  // ─────────────────────────
  const handleMapPress = useCallback(async (e: { nativeEvent: { coordinate: Coords } }) => {
    if (mode !== 'ride') return;
    const coord = e.nativeEvent.coordinate;

    if (pickupStage === 'pickup') {
      setRideState(prev => ({ ...prev, pickup: coord }));
      setPickupStage('dropoff');
    } else {
      setRideState(prev => ({ ...prev, dropoff: coord }));
      if (rideState.pickup) {
        await drawRoute(rideState.pickup, coord);
      }
      setPickupStage('pickup');
    }
  }, [mode, pickupStage, rideState.pickup]);

  // ─────────────────────────
  //  Draw route + simulate driver
  // ─────────────────────────
  const drawRoute = useCallback(async (from: Coords, to: Coords) => {
    const route = await fetchRoadRoute(from, to);
    if (!route) return;
    setRideState(prev => ({
      ...prev,
      routePolyline: route.polyline,
      routeDuration: route.durationText,
      routeDistance: route.distanceText,
    }));
    fitToCoords([from, to]);
    simulateDriver(from);
  }, [fitToCoords]);

  // Animate driver marker approaching pickup
  const simulateDriver = (pickup: Coords) => {
    const startLat = pickup.latitude + 0.008;
    const startLng = pickup.longitude + 0.006;
    let step = 0;
    const steps = 20;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const lat = startLat + (pickup.latitude - startLat) * t;
      const lng = startLng + (pickup.longitude - startLng) * t;
      setRideState(prev => ({
        ...prev,
        driverLocation: { latitude: lat, longitude: lng },
        driverEta: `${Math.max(1, Math.round((1 - t) * 5))} min`,
      }));
      if (step >= steps) clearInterval(iv);
    }, 800);
  };

  // ─────────────────────────
  //  Simulate food delivery
  // ─────────────────────────
  const simulateFoodDelivery = useCallback(() => {
    if (!origin) return;
    const restaurant = {
      latitude: origin.latitude + 0.006,
      longitude: origin.longitude + 0.004,
    };
    setFoodState(prev => ({
      ...prev,
      restaurantLocation: restaurant,
      restaurantName: 'Amala Joint',
      orderStatus: 'confirmed',
      riderLocation: restaurant,
    }));
    fitToCoords([restaurant, origin]);

    setTimeout(() => {
      setFoodState(prev => ({ ...prev, orderStatus: 'picked_up' }));
      let step = 0;
      const steps = 25;
      const iv = setInterval(() => {
        step++;
        const t = step / steps;
        const lat = restaurant.latitude + (origin.latitude - restaurant.latitude) * t;
        const lng = restaurant.longitude + (origin.longitude - restaurant.longitude) * t;
        setFoodState(prev => ({
          ...prev,
          riderLocation: { latitude: lat, longitude: lng },
          deliveryEta: `${Math.max(1, Math.round((1 - t) * 18))} min`,
        }));
        if (step >= steps) {
          clearInterval(iv);
          setFoodState(prev => ({ ...prev, orderStatus: 'arriving' }));
        }
      }, 700);
    }, 2000);
  }, [origin, fitToCoords]);

  // ─────────────────────────
  //  Autocomplete handler
  //  Teaching note: clearTimeout + setTimeout = debounce pattern.
  //  We cancel the previous timer on each keystroke, so the API
  //  call only fires 350ms after the user stops typing.
  // ─────────────────────────
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!origin || text.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(text, origin);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 350);
  }, [origin]);

  const handleSuggestionPick = useCallback(async (placeId: string, description: string) => {
    setShowSuggestions(false);
    setSearchText(description);
    const coords = await fetchPlaceCoords(placeId);
    if (!coords) return;

    if (mode === 'ride') {
      if (!rideState.pickup) {
        setRideState(prev => ({ ...prev, pickup: coords }));
        setPickupStage('dropoff');
        flyTo(coords.latitude, coords.longitude);
      } else {
        setRideState(prev => ({ ...prev, dropoff: coords }));
        await drawRoute(rideState.pickup, coords);
        setPickupStage('pickup');
      }
    } else {
      flyTo(coords.latitude, coords.longitude, 0.008);
    }
  }, [mode, rideState.pickup, flyTo, drawRoute]);

  // ─────────────────────────
  //  Clear ride
  // ─────────────────────────
  const clearRide = useCallback(() => {
    setRideState({
      pickup: null, dropoff: null, routePolyline: [],
      driverLocation: null, driverEta: '4 min',
      surgeMultiplier: 1.2, routeDuration: '', routeDistance: '',
    });
    setPickupStage('pickup');
    if (origin) flyTo(origin.latitude, origin.longitude, 0.02);
  }, [origin, flyTo]);

  // ─────────────────────────
  //  Map provider / type
  //  Teaching note: PROVIDER_DEFAULT = Apple Maps on iOS, Google on Android.
  //  mapType controls satellite vs standard rendering.
  //  customMapStyle only applies on Android with Google Maps.
  // ─────────────────────────
  const mapType: MapType = theme === 'satellite' ? 'hybrid' : 'standard';
  const mapStyle = theme === 'dark' && Platform.OS === 'android' ? DARK_MAP_STYLE : undefined;

  const centerLat = origin?.latitude ?? 6.5244;
  const centerLng = origin?.longitude ?? 3.3792;

  return (
    <View style={[s.root, { backgroundColor: TC.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── MAP ────────────────────────────────────────────── */}
      {/*
        Teaching note: react-native-maps renders as a NATIVE view —
        it sits in the same layer as your RN UI but is GPU-accelerated.
        Children (Marker, Polyline etc.) are declarative — you just
        describe what should be on the map and React handles updates.
      */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType={mapType}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}          // native blue dot — no custom marker needed
        showsMyLocationButton={false}     // we have our own recenter button
        showsCompass={false}
        toolbarEnabled={false}
        onPress={handleMapPress}
        provider={PROVIDER_DEFAULT}
      >
        {/* Pickup pin */}
        {rideState.pickup && (
          <Marker coordinate={rideState.pickup} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.pickupPin} />
          </Marker>
        )}

        {/* Dropoff pin */}
        {rideState.dropoff && (
          <Marker coordinate={rideState.dropoff} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.dropoffPin} />
          </Marker>
        )}

        {/* Road route polyline */}
        {rideState.routePolyline.length > 0 && (
          <Polyline
            coordinates={rideState.routePolyline}
            strokeColor="#1C75FF"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Driver marker */}
        {rideState.driverLocation && (
          <Marker coordinate={rideState.driverLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={s.driverMarker}><Text style={{ fontSize: 16 }}>🚗</Text></View>
          </Marker>
        )}

        {/* Food: restaurant pin */}
        {foodState.restaurantLocation && (
          <Marker coordinate={foodState.restaurantLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={[s.driverMarker, { backgroundColor: '#FF6B35' }]}>
              <Text style={{ fontSize: 16 }}>🍽</Text>
            </View>
          </Marker>
        )}

        {/* Food: delivery route */}
        {foodState.restaurantLocation && origin && (
          <Polyline
            coordinates={[foodState.restaurantLocation, origin]}
            strokeColor="#FF6B35"
            strokeWidth={4}
            lineDashPattern={[10, 6]}
          />
        )}

        {/* Food: rider marker */}
        {foodState.riderLocation && (
          <Marker coordinate={foodState.riderLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={[s.driverMarker, { backgroundColor: '#FF6B35' }]}>
              <Text style={{ fontSize: 16 }}>🛵</Text>
            </View>
          </Marker>
        )}

        {/* Discover: place markers */}
        {mode === 'discover' && nearbyPlaces.map(place => {
          const meta = CATEGORY_META[place.category];
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              tracksViewChanges={false}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={[s.placeChip, { backgroundColor: meta.color }]}>
                <Text style={s.placeChipText}>{meta.icon} {place.name}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── TOP UI ─────────────────────────────────────────── */}
      <SafeAreaView style={s.safeTop} pointerEvents="box-none">

        {/* Search bar + theme toggle */}
        <View style={[s.topBar, { backgroundColor: TC.surface + 'F2' }]}>
          <View style={[s.searchBox, { backgroundColor: TC.card, borderColor: TC.border }]}>
            <Text style={{ fontSize: 15, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={[s.searchInput, { color: TC.text }]}
              placeholder={
                mode === 'ride' ? 'Where to?' :
                mode === 'food' ? 'Search restaurants...' :
                'Find places near you...'
              }
              placeholderTextColor={TC.sub}
              value={searchText}
              onChangeText={handleSearchChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchText(''); setSuggestions([]); setShowSuggestions(false); }}>
                <Text style={{ color: TC.sub, fontSize: 16, paddingLeft: 6 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Theme picker */}
          <View style={[s.themeRow, { backgroundColor: TC.pill }]}>
            {(['dark', 'light', 'satellite'] as MapTheme[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.themeBtn, theme === t && { backgroundColor: TC.active }]}
                onPress={() => setTheme(t)}
              >
                <Text style={{ fontSize: 13 }}>
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🛰'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Autocomplete dropdown */}
        {showSuggestions && (
          <View style={[s.dropdown, { backgroundColor: TC.surface, borderColor: TC.border }]}>
            {suggestions.map((sug, i) => (
              <TouchableOpacity
                key={sug.placeId}
                style={[
                  s.dropdownRow,
                  i < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: TC.border },
                ]}
                onPress={() => handleSuggestionPick(sug.placeId, sug.description)}
              >
                <Text style={{ fontSize: 13, marginRight: 8 }}>📍</Text>
                <Text style={[s.dropdownText, { color: TC.text }]} numberOfLines={1}>
                  {sug.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mode tabs */}
        <View style={[s.modeTabs, { backgroundColor: TC.surface + 'EE' }]}>
          {([
            { id: 'ride', label: 'Ride', icon: '🚗' },
            { id: 'food', label: 'Delivery', icon: '🛵' },
            { id: 'discover', label: 'Discover', icon: '🔍' },
          ] as { id: MapMode; label: string; icon: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[s.modeTab, mode === tab.id && { backgroundColor: TC.active }]}
              onPress={() => setMode(tab.id)}
            >
              <Text style={{ fontSize: 14 }}>{tab.icon}</Text>
              <Text style={[s.modeTabText, { color: mode === tab.id ? '#FFF' : TC.sub }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Insight bar */}
        {!!aiInsight && (
          <Animated.View
            style={[
              s.insightBar,
              { backgroundColor: TC.surface + 'EE' },
              {
                opacity: insightAnim,
                transform: [{ translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
              },
            ]}
          >
            <Text style={[s.insightText, { color: TC.text }]}>{aiInsight}</Text>
          </Animated.View>
        )}

        {/* Discover category pills */}
        {mode === 'discover' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.pillScroll}
            contentContainerStyle={s.pillScrollContent}
          >
            {(Object.keys(CATEGORY_META) as DiscoverCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              const active = discoverCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.pill, {
                    backgroundColor: active ? meta.color : TC.pill,
                    borderColor: active ? meta.color : TC.border,
                  }]}
                  onPress={() => setDiscoverCategory(cat)}
                >
                  <Text style={{ fontSize: 12 }}>{meta.icon}</Text>
                  <Text style={[s.pillText, { color: active ? '#FFF' : TC.sub }]}>{meta.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── RECENTER BUTTON ────────────────────────────────── */}
      {!isLoadingGPS && origin && (
        <TouchableOpacity
          style={[s.recenterBtn, { backgroundColor: TC.surface, borderColor: TC.border }]}
          onPress={() => flyTo(origin.latitude, origin.longitude, 0.02)}
        >
          <Text style={{ fontSize: 18 }}>◎</Text>
        </TouchableOpacity>
      )}

      {/* ── RIDE BOTTOM CARD ───────────────────────────────── */}
      {mode === 'ride' && (
        <View style={[s.bottomCard, { backgroundColor: TC.surface }]}>
          <View style={s.rideHintRow}>
            <View style={s.routeDots}>
              <View style={[s.dot, { backgroundColor: '#00C896' }]} />
              <View style={[s.dotLine, { backgroundColor: TC.border }]} />
              <View style={[s.dot, { backgroundColor: '#FF3B30' }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.hintLabel, { color: TC.sub }]}>
                {pickupStage === 'pickup' ? 'TAP MAP FOR PICKUP' : 'TAP MAP FOR DROP-OFF'}
              </Text>
              <Text style={[s.hintValue, { color: TC.text }]}>
                {pickupStage === 'pickup'
                  ? rideState.pickup
                    ? `${rideState.pickup.latitude.toFixed(4)}, ${rideState.pickup.longitude.toFixed(4)}`
                    : 'Set your pickup point'
                  : 'Where are you going?'}
              </Text>
            </View>
          </View>

          {rideState.routePolyline.length > 0 && (
            <>
              <View style={[s.metaRow, { borderColor: TC.border }]}>
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: TC.text }]}>{rideState.driverEta}</Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>Driver ETA</Text>
                </View>
                <View style={[s.metaDivider, { backgroundColor: TC.border }]} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: TC.text }]}>{rideState.routeDuration}</Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>Trip Time</Text>
                </View>
                <View style={[s.metaDivider, { backgroundColor: TC.border }]} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: TC.text }]}>{rideState.routeDistance}</Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>Distance</Text>
                </View>
                <View style={[s.metaDivider, { backgroundColor: TC.border }]} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: rideState.surgeMultiplier > 1.3 ? '#FF6B35' : TC.text }]}>
                    {rideState.surgeMultiplier}×
                  </Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>Surge</Text>
                </View>
              </View>
              <TouchableOpacity style={s.cta}>
                <Text style={s.ctaText}>Book Ride</Text>
              </TouchableOpacity>
            </>
          )}

          {(rideState.pickup || rideState.dropoff) && (
            <TouchableOpacity onPress={clearRide}>
              <Text style={[s.clearText, { color: TC.sub }]}>Clear route</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── FOOD BOTTOM CARD ───────────────────────────────── */}
      {mode === 'food' && (
        <View style={[s.bottomCard, { backgroundColor: TC.surface }]}>
          {foodState.orderStatus === 'idle' ? (
            <>
              <Text style={[s.foodTitle, { color: TC.text }]}>Track a delivery</Text>
              <Text style={[s.foodSub, { color: TC.sub }]}>
                Start an order to see live rider tracking on the map
              </Text>
              <TouchableOpacity style={[s.cta, { backgroundColor: '#FF6B35' }]} onPress={simulateFoodDelivery}>
                <Text style={s.ctaText}>🛵  Simulate Live Order</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={s.foodStatusRow}>
                <View style={[s.foodDot, {
                  backgroundColor:
                    foodState.orderStatus === 'arriving' ? '#00C896' :
                    foodState.orderStatus === 'picked_up' ? '#FF6B35' : '#1C75FF',
                }]} />
                <View>
                  <Text style={[s.foodName, { color: TC.text }]}>{foodState.restaurantName}</Text>
                  <Text style={[s.foodStatus, { color: TC.sub }]}>
                    {foodState.orderStatus === 'confirmed' ? 'Order confirmed — preparing...' :
                     foodState.orderStatus === 'picked_up' ? 'Rider picked up your order' :
                     '🎉 Your order is arriving!'}
                  </Text>
                </View>
              </View>
              <View style={[s.metaRow, { borderColor: TC.border, marginTop: 12 }]}>
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: TC.text }]}>{foodState.deliveryEta}</Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>ETA</Text>
                </View>
                <View style={[s.metaDivider, { backgroundColor: TC.border }]} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: '#FF6B35' }]}>🛵 Live</Text>
                  <Text style={[s.metaLbl, { color: TC.sub }]}>Rider</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── DISCOVER: Place list ────────────────────────────── */}
      {mode === 'discover' && !selectedPlace && (
        <View style={[s.discoverSheet, { backgroundColor: TC.surface }]}>
          <View style={[s.sheetHandle, { backgroundColor: TC.border }]} />
          <Text style={[s.discoverTitle, { color: TC.text }]}>
            {CATEGORY_META[discoverCategory].icon} {CATEGORY_META[discoverCategory].label} Near You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyPlaces
              .filter(p => discoverCategory === 'all' || p.category === discoverCategory)
              .map(place => (
                <TouchableOpacity
                  key={place.id}
                  style={[s.discoverCard, { backgroundColor: TC.card, borderColor: TC.border }]}
                  onPress={() => {
                    setSelectedPlace(place);
                    flyTo(place.lat, place.lng, 0.01);
                  }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 6 }}>
                    {CATEGORY_META[place.category]?.icon ?? '📍'}
                  </Text>
                  <Text style={[s.discoverName, { color: TC.text }]} numberOfLines={1}>{place.name}</Text>
                  {place.rating && <Text style={s.discoverRating}>⭐ {place.rating}</Text>}
                  <Text style={[s.discoverDist, { color: TC.sub }]}>{place.distance}</Text>
                  <View style={[s.openBadge, { backgroundColor: place.isOpen ? '#00C896' : '#FF3B30' }]}>
                    <Text style={s.openBadgeText}>{place.isOpen ? 'Open' : 'Closed'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {/* ── DISCOVER: Selected place detail ─────────────────── */}
      {mode === 'discover' && selectedPlace && (
        <View style={[s.placeDetail, { backgroundColor: TC.surface }]}>
          <View style={s.placeDetailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[s.placeDetailName, { color: TC.text }]}>{selectedPlace.name}</Text>
              <Text style={[s.placeDetailCat, { color: CATEGORY_META[selectedPlace.category].color }]}>
                {CATEGORY_META[selectedPlace.category].icon} {CATEGORY_META[selectedPlace.category].label}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.closeBtn, { backgroundColor: TC.pill }]}
              onPress={() => setSelectedPlace(null)}
            >
              <Text style={{ color: TC.sub, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.metaRow, { borderColor: TC.border }]}>
            {selectedPlace.rating && (
              <View style={s.metaItem}>
                <Text style={[s.metaVal, { color: TC.text }]}>⭐ {selectedPlace.rating}</Text>
                <Text style={[s.metaLbl, { color: TC.sub }]}>Rating</Text>
              </View>
            )}
            <View style={s.metaItem}>
              <Text style={[s.metaVal, { color: TC.text }]}>{selectedPlace.distance}</Text>
              <Text style={[s.metaLbl, { color: TC.sub }]}>Distance</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={[s.metaVal, { color: TC.text }]}>{selectedPlace.eta}</Text>
              <Text style={[s.metaLbl, { color: TC.sub }]}>Walk ETA</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={[s.metaVal, { color: selectedPlace.isOpen ? '#00C896' : '#FF3B30' }]}>
                {selectedPlace.isOpen ? 'Open' : 'Closed'}
              </Text>
              <Text style={[s.metaLbl, { color: TC.sub }]}>Status</Text>
            </View>
          </View>
          {selectedPlace.category === 'restaurant' && (
            <TouchableOpacity style={[s.cta, { backgroundColor: '#FF6B35' }]}>
              <Text style={s.ctaText}>🛵  Order from here</Text>
            </TouchableOpacity>
          )}
          {(selectedPlace.category === 'atm' || selectedPlace.category === 'pos') && (
            <TouchableOpacity style={[s.cta, { backgroundColor: '#00C896' }]}>
              <Text style={s.ctaText}>🚗  Ride here</Text>
            </TouchableOpacity>
          )}
          {selectedPlace.category === 'hotspot' && (
            <TouchableOpacity style={[s.cta, { backgroundColor: '#FFD93D' }]}>
              <Text style={[s.ctaText, { color: '#111' }]}>🔍  Explore</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── GPS LOADING OVERLAY ─────────────────────────────── */}
      {isLoadingGPS && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#1C75FF" />
          <Text style={s.loadingText}>Getting your location...</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },

  // Top bar
  topBar: {
    marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  themeRow: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', padding: 2 },
  themeBtn: { padding: 7, borderRadius: 8 },

  // Autocomplete
  dropdown: {
    marginHorizontal: 16, marginTop: 4, borderRadius: 12, borderWidth: 1,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 10,
  },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  dropdownText: { flex: 1, fontSize: 13, fontWeight: '500' },

  // Mode tabs
  modeTabs: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 8, borderRadius: 14, padding: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5 },
  modeTabText: { fontSize: 13, fontWeight: '700' },

  // AI insight
  insightBar: {
    marginHorizontal: 16, marginTop: 8, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  insightText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  // Category pills
  pillScroll: { marginTop: 8 },
  pillScrollContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, gap: 5 },
  pillText: { fontSize: 12, fontWeight: '700' },

  // Map markers
  pickupPin: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#00C896', borderWidth: 3, borderColor: '#fff' },
  dropoffPin: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FF3B30', borderWidth: 3, borderColor: '#fff' },
  driverMarker: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#00E5FF',
    borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  placeChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  placeChipText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Recenter
  recenterBtn: {
    position: 'absolute', right: 16, bottom: 220,
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },

  // Bottom card (shared by ride + food)
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20,
  },

  // Ride card internals
  rideHintRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  routeDots: { alignItems: 'center', gap: 3 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotLine: { width: 2, height: 20, borderRadius: 1 },
  hintLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  hintValue: { fontSize: 14, fontWeight: '600' },

  // Shared meta row
  metaRow: { flexDirection: 'row', borderTopWidth: 1, marginTop: 16, paddingTop: 14, marginBottom: 4 },
  metaItem: { flex: 1, alignItems: 'center' },
  metaDivider: { width: 1 },
  metaVal: { fontSize: 17, fontWeight: '800' },
  metaLbl: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  // CTA button
  cta: { backgroundColor: '#1C75FF', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  ctaText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  clearText: { textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: '500' },

  // Food
  foodTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  foodSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  foodStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  foodDot: { width: 12, height: 12, borderRadius: 6 },
  foodName: { fontSize: 15, fontWeight: '700' },
  foodStatus: { fontSize: 12, marginTop: 2 },

  // Discover sheet
  discoverSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 16, paddingBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  discoverTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  discoverCard: { width: 140, borderRadius: 14, padding: 12, marginRight: 10, borderWidth: 1 },
  discoverName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  discoverRating: { fontSize: 12, color: '#FFD93D', marginBottom: 2 },
  discoverDist: { fontSize: 11, marginBottom: 6 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  openBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // Place detail
  placeDetail: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  placeDetailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  placeDetailName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  placeDetailCat: { fontSize: 13, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,21,40,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '600' },
});