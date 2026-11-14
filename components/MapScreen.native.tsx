import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Dimensions,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { useLocationStore, useDriverStore } from '@/store/store';
import {
  GeoPoint,
  Waypoint,
  RouteLeg,
  TriangulatedRoute,
  DispatchTriangulationResult,
  RideTierId,
  DeliveryTierId,
  RIDE_TIERS,
  DELIVERY_TIERS,
  FareBreakdown,
  TripLifecycleStage,
  getStageMetadata,
  haversineDistanceKm,
  calculateBearing,
  interpolatePointAlongPolyline,
  formatDistance,
  formatDuration,
  fetchGeoapifyRoute,
  calculateDispatchTriangulation,
  calculateDynamicFare,
  estimateAllRideTiers,
  estimateAllDeliveryTiers,
  selectOptimalDriver,
  CandidateDriver,
  searchPlacesGeoapify,
  reverseGeocodeGeoapify,
  GeocodedPlace,
} from '@/lib/triangulation';
import { COLORS, RADIUS, SPACING } from '@/constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ?? '9c5d12edbcc14f59bbb02c74ee09859d';

// ─────────────────────────────────────────────────────────────
// BACKWARDS COMPATIBILITY EXPORTS
// ─────────────────────────────────────────────────────────────
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return haversineDistanceKm({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
}

export function roadDistanceKm(polyline: GeoPoint[]): number {
  if (polyline.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineDistanceKm(polyline[i], polyline[i + 1]);
  }
  return total;
}

export function formatRoadDistance(polyline: GeoPoint[]): string {
  const km = roadDistanceKm(polyline);
  return formatDistance(km);
}

export function walkingEta(polyline: GeoPoint[]): string {
  const km = roadDistanceKm(polyline);
  const minutes = Math.ceil((km / 5) * 60);
  return formatDuration(minutes);
}

export function drivingEtaFallback(polyline: GeoPoint[]): string {
  const km = roadDistanceKm(polyline);
  const minutes = Math.ceil((km / 30) * 60);
  return formatDuration(minutes);
}

export async function fetchRoadRoute(
  origin: GeoPoint,
  destination: GeoPoint
): Promise<{
  polyline: GeoPoint[];
  distanceKm: number;
  distanceText: string;
  durationText: string;
  durationSeconds: number;
} | null> {
  try {
    const route = await fetchGeoapifyRoute([origin, destination], 'drive');
    return {
      polyline: route.polyline,
      distanceKm: route.totalDistanceKm,
      distanceText: route.formattedDistance,
      durationText: route.formattedDuration,
      durationSeconds: Math.round(route.totalDurationMins * 60),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// MAP STYLES (Clean OSM-Bright-Smooth baseline aesthetic)
// ─────────────────────────────────────────────────────────────
const OSM_BRIGHT_SMOOTH_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f8f9fa' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#fef08a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#fde047' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c7d2fe' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4338ca' }] },
];

const DARK_MATTER_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b1528' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1528' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7a8baa' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#162040' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111e35' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a30' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

type MapTheme = 'osm-bright' | 'dark' | 'satellite';
type MapMode = 'ride' | 'delivery' | 'discover';

interface NearbySpot {
  id: string;
  name: string;
  category: string;
  rating: number;
  lat: number;
  lng: number;
  distance: string;
  eta: string;
  icon: string;
}

const DEFAULT_COORDS = {
  pickup: { latitude: 6.5244, longitude: 3.3792 }, // Victoria Island / Lagos
  dropoff: { latitude: 6.4474, longitude: 3.4723 }, // Lekki Phase 1
};

export default function VeyoMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ mode?: string }>();

  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Stores
  const {
    userLatitude,
    userLongitude,
    userAddress,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
    setDestinationLocation,
  } = useLocationStore();
  const { drivers } = useDriverStore();

  // Mode and Theme
  const [mode, setMode] = useState<MapMode>(
    searchParams.mode === 'delivery' ? 'delivery' : 'ride'
  );
  const [theme, setTheme] = useState<MapTheme>('osm-bright');

  // Multi-point coordinates
  const [pickup, setPickup] = useState<GeoPoint>(() => {
    if (typeof userLatitude === 'number' && typeof userLongitude === 'number') {
      return { latitude: userLatitude, longitude: userLongitude };
    }
    return DEFAULT_COORDS.pickup;
  });

  const [dropoff, setDropoff] = useState<GeoPoint>(() => {
    if (typeof destinationLatitude === 'number' && typeof destinationLongitude === 'number') {
      return { latitude: destinationLatitude, longitude: destinationLongitude };
    }
    return DEFAULT_COORDS.dropoff;
  });

  const [pickupTitle, setPickupTitle] = useState(userAddress || 'Current Location (VI, Lagos)');
  const [dropoffTitle, setDropoffTitle] = useState(destinationAddress || 'Lekki Phase 1, Admiralty Way');

  // Delivery intermediate stops / checkpoints
  const [checkpoints, setCheckpoints] = useState<Waypoint[]>([]);

  // Nearby Driver Pool
  const [driverPool, setDriverPool] = useState<CandidateDriver[]>([
    {
      id: 101,
      name: 'Babatunde A.',
      coordinate: { latitude: pickup.latitude + 0.0042, longitude: pickup.longitude - 0.0035 },
      rating: 4.92,
      vehicleType: 'car',
    },
    {
      id: 102,
      name: 'Chinedu O.',
      coordinate: { latitude: pickup.latitude - 0.0038, longitude: pickup.longitude + 0.0045 },
      rating: 4.88,
      vehicleType: 'car',
    },
    {
      id: 103,
      name: 'Musa D. (Bike)',
      coordinate: { latitude: pickup.latitude + 0.0025, longitude: pickup.longitude + 0.002 },
      rating: 4.95,
      vehicleType: 'bike',
    },
    {
      id: 104,
      name: 'Folake K.',
      coordinate: { latitude: pickup.latitude - 0.0055, longitude: pickup.longitude - 0.004 },
      rating: 4.85,
      vehicleType: 'van',
    },
  ]);

  // Active Assigned Driver & Live Location
  const [activeDriver, setActiveDriver] = useState<CandidateDriver | null>(null);
  const [liveDriverPos, setLiveDriverPos] = useState<GeoPoint | null>(null);
  const [liveDriverBearing, setLiveDriverBearing] = useState<number>(0);

  // Triangulation Routing Data
  const [triangulation, setTriangulation] = useState<DispatchTriangulationResult | null>(null);
  const [isRouting, setIsRouting] = useState<boolean>(false);

  // Tier Selections & Dynamic Fares
  const [selectedRideTier, setSelectedRideTier] = useState<RideTierId>('economy');
  const [selectedDeliveryTier, setSelectedDeliveryTier] = useState<DeliveryTierId>('standard_parcel');
  const [rideFares, setRideFares] = useState<Record<RideTierId, FareBreakdown> | null>(null);
  const [deliveryFares, setDeliveryFares] = useState<Record<DeliveryTierId, FareBreakdown> | null>(null);

  // State Machine Lifecycle
  const [lifecycleStage, setLifecycleStage] = useState<TripLifecycleStage>('idle');
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search & Autocomplete
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Discover mode spots
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([
    {
      id: 'spot-1',
      name: 'Ocean Basket Seafood',
      category: 'restaurant',
      rating: 4.8,
      lat: pickup.latitude + 0.003,
      lng: pickup.longitude + 0.002,
      distance: '420 m',
      eta: '5 min walk',
      icon: 'restaurant',
    },
    {
      id: 'spot-2',
      name: 'GTBank E-Branch & ATM',
      category: 'atm',
      rating: 4.6,
      lat: pickup.latitude - 0.0025,
      lng: pickup.longitude + 0.0035,
      distance: '310 m',
      eta: '4 min walk',
      icon: 'cash-outline',
    },
    {
      id: 'spot-3',
      name: 'Terra Kulture Arts Center',
      category: 'hotspot',
      rating: 4.9,
      lat: pickup.latitude + 0.005,
      lng: pickup.longitude - 0.004,
      distance: '680 m',
      eta: '8 min walk',
      icon: 'sparkles',
    },
  ]);
  const [selectedSpot, setSelectedSpot] = useState<NearbySpot | null>(null);

  // Concentric Pulse Animation for Pickup Pin
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // ─────────────────────────────────────────────────────────────
  // TRIANGULATION COMPUTATION
  // ─────────────────────────────────────────────────────────────
  const computeTriangulation = useCallback(
    async (pOrigin: GeoPoint, pDest: GeoPoint, pCheckpoints: Waypoint[] = []) => {
      setIsRouting(true);
      try {
        // 1. Select optimal candidate driver
        const optimal = selectOptimalDriver(pOrigin, driverPool);
        const assigned = optimal ? optimal.driver : driverPool[0];
        setActiveDriver(assigned);
        setLiveDriverPos(assigned.coordinate);

        // 2. Compute full multi-point triangulation via Geoapify Routing
        const result = await calculateDispatchTriangulation({
          driverPosition: assigned.coordinate,
          pickup: pOrigin,
          dropoff: pDest,
          checkpoints: pCheckpoints,
          mode: 'drive',
        });

        setTriangulation(result);
        setLiveDriverBearing(result.driverBearing);

        // 3. Compute dynamic fares across all tiers
        const surge = 1.15; // 15% dynamic demand surge index
        const rFares = estimateAllRideTiers({
          distanceKm: result.transitLeg.distanceKm,
          durationMins: result.transitLeg.durationMins,
          surgeMultiplier: surge,
        });
        const dFares = estimateAllDeliveryTiers({
          distanceKm: result.transitLeg.distanceKm,
          durationMins: result.transitLeg.durationMins,
          surgeMultiplier: surge,
        });

        setRideFares(rFares);
        setDeliveryFares(dFares);

        // 4. Fit camera bounds cleanly
        if (mapRef.current) {
          const fitPoints = [
            assigned.coordinate,
            pOrigin,
            ...pCheckpoints.map((c) => c.coordinate),
            pDest,
          ];
          mapRef.current.fitToCoordinates(fitPoints, {
            edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
            animated: true,
          });
        }
      } catch (err) {
        console.warn('[MapScreen] Triangulation computation error:', err);
      } finally {
        setIsRouting(false);
      }
    },
    [driverPool]
  );

  // Recalculate whenever pickup or dropoff or checkpoints change
  useEffect(() => {
    computeTriangulation(pickup, dropoff, checkpoints);
  }, [pickup, dropoff, checkpoints, computeTriangulation]);

  // Recenter Camera
  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        600
      );
    }
  }, [pickup]);

  // Fit Route
  const handleFitRoute = useCallback(() => {
    if (mapRef.current && triangulation) {
      mapRef.current.fitToCoordinates(triangulation.fullPolyline, {
        edgePadding: { top: 110, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, [triangulation]);

  // ─────────────────────────────────────────────────────────────
  // MAP TAP HANDLER (Change Dropoff or Add Checkpoint)
  // ─────────────────────────────────────────────────────────────
  const handleMapPress = useCallback(
    async (e: { nativeEvent: { coordinate: GeoPoint } }) => {
      if (lifecycleStage !== 'idle') return;
      const tapped = e.nativeEvent.coordinate;

      if (mode === 'delivery') {
        Alert.alert('Delivery Map Action', 'Choose how to use this tapped location:', [
          {
            text: 'Set as Final Destination',
            onPress: async () => {
              setDropoff(tapped);
              const addr = await reverseGeocodeGeoapify(tapped);
              setDropoffTitle(addr);
              setDestinationLocation({
                latitude: tapped.latitude,
                longitude: tapped.longitude,
                address: addr,
              });
            },
          },
          {
            text: 'Add Delivery Stop',
            onPress: async () => {
              const stopNumber = checkpoints.length + 1;
              const addr = await reverseGeocodeGeoapify(tapped);
              const newWp: Waypoint = {
                id: `cp-${Date.now()}`,
                coordinate: tapped,
                type: 'checkpoint',
                title: `Stop ${stopNumber}`,
                address: addr,
                sequence: stopNumber,
              };
              setCheckpoints((prev) => [...prev, newWp]);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        // Ride mode: update dropoff
        setDropoff(tapped);
        const addr = await reverseGeocodeGeoapify(tapped);
        setDropoffTitle(addr);
        setDestinationLocation({
          latitude: tapped.latitude,
          longitude: tapped.longitude,
          address: addr,
        });
      }
    },
    [lifecycleStage, mode, checkpoints, setDestinationLocation]
  );

  // ─────────────────────────────────────────────────────────────
  // AUTOCOMPLETE SEARCH HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

      if (!text || text.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      searchDebounceRef.current = setTimeout(async () => {
        const places = await searchPlacesGeoapify(text, pickup);
        setSuggestions(places);
        setShowSuggestions(places.length > 0);
      }, 300);
    },
    [pickup]
  );

  const handleSelectSuggestion = useCallback(
    (place: GeocodedPlace) => {
      setSearchText(place.name);
      setShowSuggestions(false);
      setDropoff(place.coordinate);
      setDropoffTitle(place.formattedAddress || place.name);
      setDestinationLocation({
        latitude: place.coordinate.latitude,
        longitude: place.coordinate.longitude,
        address: place.formattedAddress || place.name,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: place.coordinate.latitude,
            longitude: place.coordinate.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
      }
    },
    [setDestinationLocation]
  );

  // ─────────────────────────────────────────────────────────────
  // LIVE TRIP / DISPATCH SIMULATION STATE MACHINE
  // ─────────────────────────────────────────────────────────────
  const startDispatchSimulation = useCallback(() => {
    if (!triangulation) return;

    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }

    setLifecycleStage('dispatch_searching');

    // Stage 1: Searching for Driver (1.8s)
    setTimeout(() => {
      setLifecycleStage('driver_assigned');

      // Stage 2: Driver En Route to Pickup (Traverses dispatchLeg)
      const dispatchPolyline = triangulation.dispatchLeg.polyline;
      let step = 0;
      const totalSteps = 24;

      simulationTimerRef.current = setInterval(() => {
        step++;
        const ratio = step / totalSteps;
        const interpolated = interpolatePointAlongPolyline(dispatchPolyline, ratio);

        setLiveDriverPos(interpolated.point);
        setLiveDriverBearing(interpolated.bearing);
        setSimulatedProgress(Math.round(ratio * 30));

        if (step >= totalSteps) {
          if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

          // Stage 3: Driver Arrived at Pickup
          setLifecycleStage('driver_arrived');
          setLiveDriverPos(pickup);

          // Stage 4: Transit to Destination starts after 2.5s
          setTimeout(() => {
            setLifecycleStage('in_transit');

            const transitPolyline = triangulation.transitLeg.polyline;
            let transitStep = 0;
            const transitTotalSteps = 40;

            simulationTimerRef.current = setInterval(() => {
              transitStep++;
              const tRatio = transitStep / transitTotalSteps;
              const tInterp = interpolatePointAlongPolyline(transitPolyline, tRatio);

              setLiveDriverPos(tInterp.point);
              setLiveDriverBearing(tInterp.bearing);
              setSimulatedProgress(30 + Math.round(tRatio * 70));

              // Near destination threshold
              if (tRatio > 0.85 && lifecycleStage !== 'approaching_destination') {
                setLifecycleStage('approaching_destination');
              }

              if (transitStep >= transitTotalSteps) {
                if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
                setLifecycleStage('completed');
                setLiveDriverPos(dropoff);
                setSimulatedProgress(100);
              }
            }, 600);
          }, 2500);
        }
      }, 500);
    }, 1800);
  }, [triangulation, pickup, dropoff, lifecycleStage]);

  const handleCancelOrReset = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
    setLifecycleStage('idle');
    setSimulatedProgress(0);
    if (activeDriver) {
      setLiveDriverPos(activeDriver.coordinate);
    }
    handleFitRoute();
  }, [activeDriver, handleFitRoute]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  // Theme palettes
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0B1528' : '#F8FAFC';
  const cardBg = isDark ? '#111E35' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0B1528';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E2D4A' : '#E2E8F0';

  const stageMeta = getStageMetadata(lifecycleStage);

  const activeRideFare = rideFares?.[selectedRideTier];
  const activeDeliveryFare = deliveryFares?.[selectedDeliveryTier];

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── MAP VIEW ────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={isDark ? DARK_MATTER_MAP_STYLE : OSM_BRIGHT_SMOOTH_MAP_STYLE}
        mapType={theme === 'satellite' ? 'hybrid' : 'standard'}
        initialRegion={{
          latitude: (pickup.latitude + dropoff.latitude) / 2,
          longitude: (pickup.longitude + dropoff.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPress={handleMapPress}
      >
        {/* ── Geoapify Vector / Raster Tile Layer matching RideCard osm-bright-smooth ── */}
        {theme !== 'satellite' && (
          <UrlTile
            key={`geoapify-tile-${theme}`}
            urlTemplate={
              isDark
                ? `https://maps.geoapify.com/v1/tile/dark-matter-dark-grey/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`
                : `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`
            }
            maximumZ={19}
            flipY={false}
            zIndex={1}
            tileSize={256}
          />
        )}

        {/* ── Driver Dispatch Leg Polyline (Driver -> Pickup) ── */}
        {triangulation &&
          (lifecycleStage === 'idle' ||
            lifecycleStage === 'dispatch_searching' ||
            lifecycleStage === 'driver_assigned') && (
            <Polyline
              coordinates={triangulation.dispatchLeg.polyline}
              strokeColor="#0286FF"
              strokeWidth={4}
              lineDashPattern={[8, 5]}
              zIndex={3}
            />
          )}

        {/* ── Primary Transit Leg Polyline (Pickup -> Dropoff) ── */}
        {triangulation && (
          <Polyline
            coordinates={triangulation.transitLeg.polyline}
            strokeColor={isDark ? '#38BDF8' : '#0286FF'}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
            zIndex={4}
          />
        )}

        {/* ── Delivery Checkpoint Segments ── */}
        {triangulation &&
          triangulation.multiDropLegs.map((leg, i) => (
            <Polyline
              key={`leg-${i}`}
              coordinates={leg.polyline}
              strokeColor={i % 2 === 0 ? '#10B981' : '#8B5CF6'}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              zIndex={5}
            />
          ))}

        {/* ── Point A: Pickup Marker (Green Pill) ── */}
        <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.85 }} zIndex={10}>
          <View style={styles.markerAnchor}>
            <View style={styles.pickupPillBadge}>
              <View style={styles.pickupPillDot} />
              <Text style={styles.pickupPillText} numberOfLines={1}>
                {pickupTitle.split(',')[0]}
              </Text>
            </View>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.2],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0],
                  }),
                },
              ]}
            />
            <View style={styles.pickupCorePin}>
              <View style={styles.pickupInnerDot} />
            </View>
          </View>
        </Marker>

        {/* ── Point C: Dropoff Marker (Dark Slate Pill) ── */}
        <Marker coordinate={dropoff} anchor={{ x: 0.5, y: 0.85 }} zIndex={10}>
          <View style={styles.markerAnchor}>
            <View style={styles.dropoffPillBadge}>
              <Ionicons name="flag" size={11} color="#FFFFFF" />
              <Text style={styles.dropoffPillText} numberOfLines={1}>
                {dropoffTitle.split(',')[0]}
              </Text>
            </View>
            <View style={styles.dropoffCorePin}>
              <Ionicons name="location" size={16} color="#FFFFFF" />
            </View>
          </View>
        </Marker>

        {/* ── Point D...: Checkpoints / Stops ── */}
        {checkpoints.map((cp, idx) => (
          <Marker key={cp.id} coordinate={cp.coordinate} anchor={{ x: 0.5, y: 0.85 }} zIndex={9}>
            <View style={styles.markerAnchor}>
              <View style={styles.checkpointBadge}>
                <Text style={styles.checkpointBadgeText}>Stop {idx + 1}</Text>
              </View>
              <View style={styles.checkpointCorePin}>
                <Text style={styles.checkpointPinNumber}>{idx + 1}</Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* ── Point B: Live Dispatched Driver / Courier ── */}
        {liveDriverPos && (
          <Marker coordinate={liveDriverPos} anchor={{ x: 0.5, y: 0.5 }} zIndex={20}>
            <View style={styles.driverMarkerContainer}>
              {/* ETA / Info tag */}
              <View style={styles.driverPillTag}>
                <Text style={styles.driverPillTagText}>
                  {triangulation ? triangulation.estimatedPickupEta : '3 min'}
                </Text>
              </View>
              {/* Rotating vehicle icon pointed along bearing */}
              <View
                style={[
                  styles.driverVehicleCircle,
                  {
                    transform: [{ rotate: `${liveDriverBearing}deg` }],
                  },
                ]}
              >
                <FontAwesome5
                  name={activeDriver?.vehicleType === 'bike' ? 'motorcycle' : 'car'}
                  size={15}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </Marker>
        )}

        {/* ── Other Nearby Radar Drivers (in Idle Mode) ── */}
        {lifecycleStage === 'idle' &&
          driverPool.map((d) => {
            if (activeDriver && d.id === activeDriver.id) return null;
            return (
              <Marker key={`nearby-${d.id}`} coordinate={d.coordinate} anchor={{ x: 0.5, y: 0.5 }} zIndex={8}>
                <View style={styles.idleDriverPin}>
                  <FontAwesome5
                    name={d.vehicleType === 'bike' ? 'motorcycle' : 'car'}
                    size={11}
                    color="#0286FF"
                  />
                </View>
              </Marker>
            );
          })}

        {/* ── Discover POI Markers ── */}
        {mode === 'discover' &&
          nearbySpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.lat, longitude: spot.lng }}
              anchor={{ x: 0.5, y: 0.85 }}
              onPress={() => setSelectedSpot(spot)}
            >
              <View style={styles.spotMarkerPill}>
                <Ionicons name={spot.icon as any} size={12} color="#0286FF" />
                <Text style={styles.spotMarkerText}>{spot.name}</Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* ── TOP FLOATING NAVIGATION & SEARCH BAR ──────────────── */}
      <SafeAreaView style={styles.topSafeArea} pointerEvents="box-none">
        <View style={[styles.topBarCard, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(root)/(tabs)/home');
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={textColor} />
          </TouchableOpacity>

          {/* Search Input */}
          <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#162040' : '#F1F5F9' }]}>
            <Ionicons name="search" size={16} color={subTextColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder={mode === 'delivery' ? 'Search delivery destination...' : 'Where are you heading?'}
              placeholderTextColor={subTextColor}
              value={searchText}
              onChangeText={handleSearchTextChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={16} color={subTextColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Theme Switcher */}
          <View style={[styles.themePillToggle, { backgroundColor: isDark ? '#162040' : '#E2E8F0' }]}>
            {(['osm-bright', 'dark', 'satellite'] as MapTheme[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.themeOptionBtn, theme === t && styles.themeOptionBtnActive]}
                onPress={() => setTheme(t)}
              >
                <Text style={styles.themeOptionEmoji}>
                  {t === 'osm-bright' ? '☀️' : t === 'dark' ? '🌙' : '🛰'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Autocomplete Dropdown List */}
        {showSuggestions && (
          <View style={[styles.suggestionsDropdown, { backgroundColor: cardBg, borderColor }]}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={item.placeId || idx}
                style={[
                  styles.suggestionRow,
                  idx < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Ionicons name="location-outline" size={17} color="#0286FF" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.suggestionTitle, { color: textColor }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.suggestionSub, { color: subTextColor }]} numberOfLines={1}>
                    {item.formattedAddress}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mobility Mode Tabs: Ride vs Delivery vs Discover */}
        <View style={[styles.modeTabsRow, { backgroundColor: cardBg, borderColor }]}>
          {(
            [
              { id: 'ride', label: 'Ride Triangulation', icon: 'car-sport-outline' },
              { id: 'delivery', label: 'Courier Multi-Drop', icon: 'cube-outline' },
              { id: 'discover', label: 'Spots', icon: 'compass-outline' },
            ] as const
          ).map((tab) => {
            const isActive = mode === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.modeTabButton, isActive && styles.modeTabButtonActive]}
                onPress={() => setMode(tab.id)}
              >
                <Ionicons name={tab.icon} size={15} color={isActive ? '#FFFFFF' : subTextColor} />
                <Text style={[styles.modeTabButtonText, { color: isActive ? '#FFFFFF' : subTextColor }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* ── RECENTER & FIT BUTTONS (FAB) ─────────────────────── */}
      <View style={styles.fabControlsColumn}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: cardBg, borderColor }]}
          onPress={handleFitRoute}
          activeOpacity={0.85}
        >
          <Feather name="maximize" size={18} color="#0286FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: cardBg, borderColor, marginTop: 8 }]}
          onPress={handleRecenter}
          activeOpacity={0.85}
        >
          <MaterialIcons name="my-location" size={19} color="#0286FF" />
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM ROUTE OVERVIEW & DISPATCH CARD ───────────── */}
      <View style={[styles.bottomSheetCard, { backgroundColor: cardBg, borderColor }]}>
        {/* Drag Handle */}
        <View style={styles.sheetHandleBar} />

        {/* Triangulation Metrics Strip */}
        {triangulation ? (
          <View style={[styles.metricsStrip, { borderColor }]}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: subTextColor }]}>Driver ETA</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                {triangulation.estimatedPickupEta}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: borderColor }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: subTextColor }]}>Trip Time</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                {triangulation.estimatedDropoffEta}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: borderColor }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: subTextColor }]}>Distance</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>
                {triangulation.formattedDistance}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: borderColor }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: subTextColor }]}>Surge</Text>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>1.15×</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loadingRouteRow}>
            <ActivityIndicator size="small" color="#0286FF" />
            <Text style={[styles.loadingRouteText, { color: subTextColor }]}>
              Calculating Geoapify road triangulation...
            </Text>
          </View>
        )}

        {/* ── IDLE STAGE: TIER SELECTION & PRICING ────────────── */}
        {lifecycleStage === 'idle' && mode === 'ride' && (
          <>
            <Text style={[styles.sectionHeading, { color: textColor }]}>Select Vehicle Class</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tiersScroll}
            >
              {(Object.keys(RIDE_TIERS) as RideTierId[]).map((tierKey) => {
                const config = RIDE_TIERS[tierKey];
                const isSelected = selectedRideTier === tierKey;
                const fare = rideFares?.[tierKey];

                return (
                  <TouchableOpacity
                    key={tierKey}
                    style={[
                      styles.tierCard,
                      { backgroundColor: isDark ? '#162040' : '#F8FAFC', borderColor },
                      isSelected && styles.tierCardActive,
                    ]}
                    onPress={() => setSelectedRideTier(tierKey)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tierTopRow}>
                      <Ionicons
                        name={config.icon as any}
                        size={22}
                        color={isSelected ? '#0286FF' : subTextColor}
                      />
                      <Text style={[styles.tierPrice, { color: isSelected ? '#0286FF' : textColor }]}>
                        {fare?.formattedTotal ?? '$12.00'}
                      </Text>
                    </View>
                    <Text style={[styles.tierName, { color: textColor }]}>{config.name}</Text>
                    <Text style={[styles.tierSubtitle, { color: subTextColor }]} numberOfLines={1}>
                      {config.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Request CTA */}
            <TouchableOpacity
              style={styles.primaryCtaBtn}
              activeOpacity={0.85}
              onPress={startDispatchSimulation}
            >
              <Text style={styles.primaryCtaText}>
                Confirm {RIDE_TIERS[selectedRideTier].name} · {activeRideFare?.formattedTotal ?? '$14.50'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}

        {/* ── IDLE STAGE: DELIVERY MULTI-DROP ─────────────────── */}
        {lifecycleStage === 'idle' && mode === 'delivery' && (
          <>
            <View style={styles.deliveryHeaderRow}>
              <Text style={[styles.sectionHeading, { color: textColor }]}>Courier Parcel Dispatch</Text>
              <TouchableOpacity
                style={styles.addStopBtn}
                onPress={() => {
                  Alert.alert('Add Stop', 'Tap anywhere on the map to place an intermediate checkpoint.');
                }}
              >
                <Ionicons name="add-circle" size={15} color="#0286FF" />
                <Text style={styles.addStopBtnText}>Add Stop ({checkpoints.length})</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tiersScroll}
            >
              {(Object.keys(DELIVERY_TIERS) as DeliveryTierId[]).map((tierKey) => {
                const config = DELIVERY_TIERS[tierKey];
                const isSelected = selectedDeliveryTier === tierKey;
                const fare = deliveryFares?.[tierKey];

                return (
                  <TouchableOpacity
                    key={tierKey}
                    style={[
                      styles.tierCard,
                      { backgroundColor: isDark ? '#162040' : '#F8FAFC', borderColor },
                      isSelected && styles.tierCardActive,
                    ]}
                    onPress={() => setSelectedDeliveryTier(tierKey)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tierTopRow}>
                      <Ionicons
                        name={config.icon as any}
                        size={22}
                        color={isSelected ? '#0286FF' : subTextColor}
                      />
                      <Text style={[styles.tierPrice, { color: isSelected ? '#0286FF' : textColor }]}>
                        {fare?.formattedTotal ?? '$8.50'}
                      </Text>
                    </View>
                    <Text style={[styles.tierName, { color: textColor }]}>{config.name}</Text>
                    <Text style={[styles.tierSubtitle, { color: subTextColor }]} numberOfLines={1}>
                      {config.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.primaryCtaBtn, { backgroundColor: '#10B981' }]}
              activeOpacity={0.85}
              onPress={startDispatchSimulation}
            >
              <Text style={styles.primaryCtaText}>
                Dispatch {DELIVERY_TIERS[selectedDeliveryTier].name} ·{' '}
                {activeDeliveryFare?.formattedTotal ?? '$10.00'}
              </Text>
              <Ionicons name="cube" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}

        {/* ── IDLE STAGE: DISCOVER MODE ───────────────────────── */}
        {lifecycleStage === 'idle' && mode === 'discover' && (
          <>
            <Text style={[styles.sectionHeading, { color: textColor }]}>Nearby Places & Hotspots</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {nearbySpots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={[
                    styles.spotCard,
                    { backgroundColor: isDark ? '#162040' : '#F8FAFC', borderColor },
                  ]}
                  onPress={() => {
                    setSelectedSpot(spot);
                    setDropoff({ latitude: spot.lat, longitude: spot.lng });
                    setDropoffTitle(spot.name);
                  }}
                >
                  <View style={styles.spotIconCircle}>
                    <Ionicons name={spot.icon as any} size={18} color="#0286FF" />
                  </View>
                  <Text style={[styles.spotName, { color: textColor }]} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <Text style={[styles.spotRating, { color: '#F59E0B' }]}>★ {spot.rating}</Text>
                  <Text style={[styles.spotDist, { color: subTextColor }]}>
                    {spot.distance} · {spot.eta}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── ACTIVE LIFECYCLE SIMULATION (UBER / BOLT RADAR) ───── */}
        {lifecycleStage !== 'idle' && (
          <View style={styles.lifecycleCard}>
            <View style={styles.lifecycleHeaderRow}>
              <View style={[styles.statusBadge, { backgroundColor: stageMeta.color + '20' }]}>
                <Ionicons name={stageMeta.icon as any} size={15} color={stageMeta.color} />
                <Text style={[styles.statusBadgeText, { color: stageMeta.color }]}>
                  {stageMeta.label}
                </Text>
              </View>
              <Text style={[styles.progressNumber, { color: subTextColor }]}>
                {simulatedProgress}%
              </Text>
            </View>

            <Text style={[styles.stageDesc, { color: subTextColor }]}>
              {stageMeta.description}
            </Text>

            {/* Progress Track */}
            <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${simulatedProgress}%`, backgroundColor: stageMeta.color },
                ]}
              />
            </View>

            {/* Driver Profile Hub Strip */}
            {activeDriver && (
              <View style={[styles.activeDriverRow, { borderColor }]}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>{activeDriver.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.activeDriverName, { color: textColor }]}>
                    {activeDriver.name}
                  </Text>
                  <Text style={[styles.activeDriverSub, { color: subTextColor }]}>
                    {activeDriver.vehicleType === 'bike' ? 'Honda Ace 125' : 'Toyota Corolla 2022'} · ★{' '}
                    {activeDriver.rating}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.driverCallBtn}
                  onPress={() => Alert.alert('Calling Driver', `Dialing ${activeDriver.name}...`)}
                >
                  <Ionicons name="call" size={16} color="#0286FF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Cancel / Reset Button */}
            <TouchableOpacity style={styles.cancelTripBtn} onPress={handleCancelOrReset}>
              <Text style={styles.cancelTripBtnText}>
                {lifecycleStage === 'completed' ? 'Done & Book Another' : 'Cancel Dispatch Request'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: SPACING.screen,
  },
  topBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  themePillToggle: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  themeOptionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: RADIUS.sm - 2,
  },
  themeOptionBtnActive: {
    backgroundColor: '#0286FF',
  },
  themeOptionEmoji: {
    fontSize: 12,
  },
  suggestionsDropdown: {
    borderRadius: RADIUS.md,
    marginTop: 4,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  modeTabsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 3,
    marginTop: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  modeTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  modeTabButtonActive: {
    backgroundColor: '#0286FF',
  },
  modeTabButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fabControlsColumn: {
    position: 'absolute',
    right: 16,
    bottom: 340,
    zIndex: 25,
  },
  fabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  markerAnchor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 140,
  },
  pickupPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  pickupPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    bottom: 0,
  },
  pickupCorePin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pickupInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  dropoffPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 140,
  },
  dropoffPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dropoffCorePin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  checkpointBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 3,
  },
  checkpointBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  checkpointCorePin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8B5CF6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkpointPinNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPillTag: {
    backgroundColor: '#0286FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  driverPillTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  driverVehicleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B1528',
    borderWidth: 2,
    borderColor: '#0286FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  idleDriverPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0286FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  spotMarkerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  spotMarkerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B1528',
  },
  bottomSheetCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.modal,
    borderTopRightRadius: RADIUS.modal,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 20,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 10,
    opacity: 0.6,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 22,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  loadingRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingRouteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addStopBtnText: {
    color: '#0286FF',
    fontSize: 12,
    fontWeight: '700',
  },
  tiersScroll: {
    gap: 10,
    paddingBottom: 8,
  },
  tierCard: {
    width: 130,
    borderRadius: RADIUS.cardCompact,
    borderWidth: 1.5,
    padding: 10,
  },
  tierCardActive: {
    borderColor: '#0286FF',
    backgroundColor: '#F0F7FF',
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tierSubtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  primaryCtaBtn: {
    backgroundColor: '#0286FF',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 6,
    gap: 8,
    shadowColor: '#0286FF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  spotCard: {
    width: 140,
    borderRadius: RADIUS.cardCompact,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  spotIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  spotName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  spotRating: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  spotDist: {
    fontSize: 10,
  },
  lifecycleCard: {
    paddingVertical: 4,
  },
  lifecycleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  stageDesc: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  activeDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  driverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0286FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  activeDriverName: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeDriverSub: {
    fontSize: 11,
    marginTop: 1,
  },
  driverCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTripBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTripBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
