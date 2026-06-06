import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';

// ─────────────────────────────────────────────────────────────
//  GEO HELPER
// ─────────────────────────────────────────────────────────────
export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  routeDrawn: boolean;
  driverLocation: Coords | null;
  driverEta?: string;
  confidenceScore?: number;
  surgeMultiplier?: number;
}

interface FoodOrderState {
  restaurantLocation: Coords | null;
  restaurantName?: string;
  riderLocation: Coords | null;
  deliveryEta?: string;
  orderStatus: 'idle' | 'confirmed' | 'preparing' | 'picked_up' | 'arriving';
}

const { width: SW, height: SH } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

// ─────────────────────────────────────────────────────────────
//  LEAFLET TILE SOURCES  per theme
// ─────────────────────────────────────────────────────────────
const TILE_SOURCES: Record<MapTheme, { base: string; labels?: string }> = {
  dark: {
    base: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
  light: {
    base: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  },
  satellite: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  },
};

// ─────────────────────────────────────────────────────────────
//  AI INSIGHT SIMULATOR  (replace with real Gemini calls)
// ─────────────────────────────────────────────────────────────
function generateAIInsight(mode: MapMode, surgeMultiplier: number): string {
  if (mode === 'ride') {
    if (surgeMultiplier > 1.5) return `⚡ High demand near you. Prices up ${Math.round((surgeMultiplier - 1) * 100)}%. Try in 12 min.`;
    return '🧠 Light traffic on your usual route. Best time to book.';
  }
  if (mode === 'food') return '🍽 3 restaurants nearby have < 20 min delivery right now.';
  return '📍 Popular area. 5 eateries within 400m — tap to explore.';
}

// ─────────────────────────────────────────────────────────────
//  REAL NEARBY PLACES  via Google Places API
// ─────────────────────────────────────────────────────────────
const CATEGORY_TO_GOOGLE_TYPE: Record<DiscoverCategory, string> = {
  all:        'point_of_interest',
  restaurant: 'restaurant',
  atm:        'atm',
  pos:        'finance',
  hotspot:    'tourist_attraction',
};

async function fetchNearbyPlaces(
  origin: Coords,
  category: DiscoverCategory
): Promise<NearbyPlace[]> {
  const type = CATEGORY_TO_GOOGLE_TYPE[category];
  const radius = 1500; // metres
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${origin.latitude},${origin.longitude}` +
    `&radius=${radius}` +
    `&type=${type}` +
    `&key=${GOOGLE_MAPS_APIKEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', json.status, json.error_message);
      return [];
    }

    return (json.results as any[]).slice(0, 12).map((p: any) => ({
      id:       p.place_id,
      name:     p.name,
      category: category === 'all' ? detectCategory(p.types) : category,
      lat:      p.geometry.location.lat,
      lng:      p.geometry.location.lng,
      rating:   p.rating,
      isOpen:   p.opening_hours?.open_now ?? true,
      distance: calculateHaversineDistance(
        origin.latitude, origin.longitude,
        p.geometry.location.lat, p.geometry.location.lng
      ).toFixed(2) + ' km',
      eta: `${Math.floor(
        calculateHaversineDistance(
          origin.latitude, origin.longitude,
          p.geometry.location.lat, p.geometry.location.lng
        ) / 0.08  // ~5 km/h walk
      )} min`,
    }));
  } catch (e) {
    console.error('fetchNearbyPlaces failed:', e);
    return [];
  }
}

function detectCategory(types: string[]): DiscoverCategory {
  if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
  if (types.includes('atm'))     return 'atm';
  if (types.includes('finance')) return 'pos';
  return 'hotspot';
}

// ─────────────────────────────────────────────────────────────
//  REAL ROAD ROUTE  via Google Directions API
// ─────────────────────────────────────────────────────────────

// Decode Google's encoded polyline into [lat, lng][] pairs
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

async function fetchRoadRoute(
  origin: Coords,
  destination: Coords
): Promise<{ polyline: [number, number][]; durationText: string; distanceText: string } | null> {
  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=driving` +
    `&key=${GOOGLE_MAPS_APIKEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK') {
      console.error('Directions API error:', json.status, json.error_message);
      return null;
    }

    const leg      = json.routes[0].legs[0];
    const encoded  = json.routes[0].overview_polyline.points;
    return {
      polyline:     decodePolyline(encoded),
      durationText: leg.duration.text,
      distanceText: leg.distance.text,
    };
  } catch (e) {
    console.error('fetchRoadRoute failed:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  PLACES AUTOCOMPLETE  via Google Places API
// ─────────────────────────────────────────────────────────────
async function fetchAutocompleteSuggestions(
  input: string,
  origin: Coords
): Promise<{ placeId: string; description: string }[]> {
  if (input.length < 2) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&location=${origin.latitude},${origin.longitude}` +
    `&radius=50000` +          // bias within 50 km of user
    `&key=${GOOGLE_MAPS_APIKEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return [];
    return json.predictions.slice(0, 5).map((p: any) => ({
      placeId:     p.place_id,
      description: p.description,
    }));
  } catch (e) {
    return [];
  }
}

// Resolve a placeId to lat/lng
async function fetchPlaceCoords(placeId: string): Promise<Coords | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}` +
    `&fields=geometry` +
    `&key=${GOOGLE_MAPS_APIKEY}`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return null;
    const loc = json.result.geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  CATEGORY META
// ─────────────────────────────────────────────────────────────
const CATEGORY_META: Record<DiscoverCategory, { label: string; color: string; icon: string }> = {
  all:        { label: 'All',         color: '#1C75FF', icon: '🗺' },
  restaurant: { label: 'Eateries',    color: '#FF6B35', icon: '🍽' },
  atm:        { label: 'ATMs',        color: '#00C896', icon: '🏧' },
  pos:        { label: 'POS Agents',  color: '#A259FF', icon: '💳' },
  hotspot:    { label: 'Hotspots',    color: '#FFD93D', icon: '🔥' },
};

// ─────────────────────────────────────────────────────────────
//  MAP HTML GENERATOR
// ─────────────────────────────────────────────────────────────
function buildMapHtml(theme: MapTheme, centerLat: number, centerLng: number): string {
  const tiles = TILE_SOURCES[theme];
  const satelliteLayer = theme === 'satellite'
    ? `L.tileLayer('${tiles.labels}', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);`
    : '';

  const uiColors = theme === 'dark'
    ? { pulse: '#1C75FF', route: '#1C75FF', driver: '#00E5FF', rider: '#FF6B35', heatLow: '26,117,255', heatHigh: '255,107,53' }
    : { pulse: '#1C75FF', route: '#1C75FF', driver: '#0051CC', rider: '#E8490F', heatLow: '255,107,53', heatHigh: '255,50,50' };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body,html,#map{width:100%;height:100%;background:#0b1528}
    .leaflet-control-attribution,.leaflet-control-zoom{display:none!important}

    /* ── USER PULSE ── */
    .veyo-user-dot{width:20px;height:20px;position:relative}
    .veyo-user-dot .core{
      width:14px;height:14px;
      background:${uiColors.pulse};border:3px solid white;
      border-radius:50%;position:absolute;top:3px;left:3px;
      box-shadow:0 0 10px rgba(28,117,255,0.8)
    }
    .veyo-user-dot .ring{
      width:28px;height:28px;
      border:2px solid ${uiColors.pulse};border-radius:50%;
      position:absolute;top:-4px;left:-4px;
      animation:ping 1.8s ease-out infinite;opacity:0
    }
    @keyframes ping{0%{transform:scale(0.6);opacity:0.8}100%{transform:scale(1.6);opacity:0}}

    /* ── DRIVER MARKER ── */
    .veyo-driver{
      width:36px;height:36px;
      background:${uiColors.driver};border:3px solid white;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,0.4);
      animation:driverBob 2s ease-in-out infinite
    }
    @keyframes driverBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

    /* ── RIDER MARKER ── */
    .veyo-rider{
      width:36px;height:36px;
      background:${uiColors.rider};border:3px solid white;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,0.4)
    }

    /* ── PLACE MARKERS ── */
    .veyo-place{
      padding:4px 10px;border-radius:20px;
      font-size:11px;font-weight:700;color:white;
      white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      cursor:pointer;border:1.5px solid rgba(255,255,255,0.3)
    }
    .veyo-place.restaurant{background:#FF6B35}
    .veyo-place.atm{background:#00C896}
    .veyo-place.pos{background:#A259FF}
    .veyo-place.hotspot{background:linear-gradient(135deg,#FFD93D,#FF6B35);color:#111}

    /* ── PICKUP/DROP MARKERS ── */
    .pickup-pin{
      width:14px;height:14px;background:#00C896;
      border:3px solid white;border-radius:50%;
      box-shadow:0 0 8px rgba(0,200,150,0.6)
    }
    .dropoff-pin{
      width:14px;height:14px;background:#FF3B30;
      border:3px solid white;border-radius:50%;
      box-shadow:0 0 8px rgba(255,59,48,0.6)
    }

    /* ── HEATMAP CELLS ── */
    .heat-cell{
      border-radius:50%;pointer-events:none;
      animation:heatPulse 3s ease-in-out infinite
    }
    @keyframes heatPulse{0%,100%{opacity:0.35}50%{opacity:0.6}}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:false,attributionControl:false}).setView([${centerLat},${centerLng}],14);

  L.tileLayer('${tiles.base}',{maxZoom:19,subdomains:'abcd'}).addTo(map);
  ${satelliteLayer}

  var userMarker=null, driverMarker=null, riderMarker=null;
  var routeLayer=null, driverRouteLayer=null, deliveryRouteLayer=null;
  var pickupMarker=null, dropoffMarker=null;
  var placeMarkers=[], heatLayers=[];

  // ── Init user location marker
  function setUserLocation(lat,lng){
    if(userMarker) map.removeLayer(userMarker);
    userMarker=L.marker([lat,lng],{
      icon:L.divIcon({
        className:'',
        html:'<div class="veyo-user-dot"><div class="ring"></div><div class="core"></div></div>',
        iconSize:[20,20],iconAnchor:[10,10]
      }),zIndexOffset:1000
    }).addTo(map);
    map.setView([lat,lng],14,{animate:true,duration:1.2});
  }

  // ── Set pickup pin
  function setPickupPin(lat,lng){
    if(pickupMarker) map.removeLayer(pickupMarker);
    pickupMarker=L.marker([lat,lng],{
      icon:L.divIcon({className:'',html:'<div class="pickup-pin"></div>',iconSize:[14,14],iconAnchor:[7,7]})
    }).addTo(map).bindTooltip('Pickup',{permanent:false,direction:'top'});
  }

  // ── Set dropoff pin
  function setDropoffPin(lat,lng){
    if(dropoffMarker) map.removeLayer(dropoffMarker);
    dropoffMarker=L.marker([lat,lng],{
      icon:L.divIcon({className:'',html:'<div class="dropoff-pin"></div>',iconSize:[14,14],iconAnchor:[7,7]})
    }).addTo(map).bindTooltip('Drop-off',{permanent:false,direction:'top'});
  }

  // ── Draw route polyline
  function drawRoute(coords,color,dashArray){
    var layer=L.polyline(coords,{color:color||'${uiColors.route}',weight:5,opacity:0.85,dashArray:dashArray||null,lineCap:'round'}).addTo(map);
    map.fitBounds(layer.getBounds(),{padding:[60,60],animate:true,duration:0.8});
    return layer;
  }

  // ── Move driver marker (smooth interpolation via animation frames)
  function moveDriver(lat,lng){
    if(!driverMarker){
      driverMarker=L.marker([lat,lng],{
        icon:L.divIcon({className:'',html:'<div class="veyo-driver">🚗</div>',iconSize:[36,36],iconAnchor:[18,18]}),
        zIndexOffset:900
      }).addTo(map);
    } else {
      var start=driverMarker.getLatLng();
      var steps=30,i=0;
      var iv=setInterval(function(){
        i++;
        var t=i/steps;
        driverMarker.setLatLng([start.lat+(lat-start.lat)*t, start.lng+(lng-start.lng)*t]);
        if(i>=steps){clearInterval(iv);}
      },50);
    }
  }

  // ── Move rider/delivery marker
  function moveRider(lat,lng){
    if(!riderMarker){
      riderMarker=L.marker([lat,lng],{
        icon:L.divIcon({className:'',html:'<div class="veyo-rider">🛵</div>',iconSize:[36,36],iconAnchor:[18,18]}),
        zIndexOffset:900
      }).addTo(map);
    } else {
      riderMarker.setLatLng([lat,lng]);
    }
  }

  // ── Render nearby place markers
  function renderPlaces(places){
    placeMarkers.forEach(function(m){map.removeLayer(m);});
    placeMarkers=[];
    places.forEach(function(p){
      var icon=p.category==='restaurant'?'🍽':p.category==='atm'?'🏧':p.category==='pos'?'💳':'🔥';
      var m=L.marker([p.lat,p.lng],{
        icon:L.divIcon({
          className:'',
          html:'<div class="veyo-place '+p.category+'">'+icon+' '+p.name+'</div>',
          iconAnchor:[0,0]
        })
      }).addTo(map);
      m.on('click',function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'PLACE_TAPPED',id:p.id}));
      });
      placeMarkers.push(m);
    });
  }

  // ── Demand heatmap overlay
  function renderHeatmap(cells){
    heatLayers.forEach(function(l){map.removeLayer(l);});
    heatLayers=[];
    cells.forEach(function(c){
      var intensity=c.intensity||0.5;
      var size=Math.round(60+intensity*80);
      var r=intensity>0.6?255:Math.round(28+intensity*200);
      var g=intensity>0.6?Math.round(107*(1-intensity)):Math.round(117+intensity*50);
      var b=intensity>0.6?53:255;
      var el=L.divIcon({
        className:'',
        html:'<div class="heat-cell" style="width:'+size+'px;height:'+size+'px;background:rgba('+r+','+g+','+b+',0.4)"></div>',
        iconSize:[size,size],iconAnchor:[size/2,size/2]
      });
      var l=L.marker([c.lat,c.lng],{icon:el,interactive:false}).addTo(map);
      heatLayers.push(l);
    });
  }

  // ── Clear all layers
  function clearAll(){
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
    if(driverRouteLayer){map.removeLayer(driverRouteLayer);driverRouteLayer=null;}
    if(deliveryRouteLayer){map.removeLayer(deliveryRouteLayer);deliveryRouteLayer=null;}
    if(driverMarker){map.removeLayer(driverMarker);driverMarker=null;}
    if(riderMarker){map.removeLayer(riderMarker);riderMarker=null;}
    if(pickupMarker){map.removeLayer(pickupMarker);pickupMarker=null;}
    if(dropoffMarker){map.removeLayer(dropoffMarker);dropoffMarker=null;}
    placeMarkers.forEach(function(m){map.removeLayer(m);});
    placeMarkers=[];
    heatLayers.forEach(function(l){map.removeLayer(l);});
    heatLayers=[];
  }

  // ── Map tap for pin drop
  map.on('click',function(e){
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type:'MAP_TAPPED',lat:e.latlng.lat,lng:e.latlng.lng
    }));
  });
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function VeyoMapScreen() {
  // ── Core state
  const [theme, setTheme] = useState<MapTheme>('dark');
  const [mode, setMode] = useState<MapMode>('ride');
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(true);

  // ── Discover state
  const [discoverCategory, setDiscoverCategory] = useState<DiscoverCategory>('all');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // ── Ride state
  const [rideState, setRideState] = useState<RideState>({
    pickup: null, dropoff: null, routeDrawn: false,
    driverLocation: null, driverEta: '4 min', confidenceScore: 87, surgeMultiplier: 1.2,
  });
  const [pickupStage, setPickupStage] = useState<'pickup' | 'dropoff'>('pickup');

  // ── Food state
  const [foodState, setFoodState] = useState<FoodOrderState>({
    restaurantLocation: null, riderLocation: null,
    deliveryEta: '22 min', orderStatus: 'idle',
  });

  // ── AI insight
  const [aiInsight, setAiInsight] = useState('');

  // ── Search
  const [searchText, setSearchText] = useState('');

  // Autocomplete
  const [suggestions, setSuggestions] = useState<{ placeId: string; description: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Route meta from Directions API
  const [routeMeta, setRouteMeta] = useState<{ duration: string; distance: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs
  const webViewRef = useRef<WebView>(null);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;

  // ─────────────────────────
  //  JS injection helper
  // ─────────────────────────
  const injectJS = useCallback((js: string) => {
    webViewRef.current?.injectJavaScript(`(function(){${js}})(); true;`);
  }, []);

  // ─────────────────────────
  //  Boot: GPS
  // ─────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setIsLoadingGPS(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setOrigin(coords);
      setIsLoadingGPS(false);
    })();
  }, []);

  // ─────────────────────────
  //  When origin loads → init map
  // ─────────────────────────
  useEffect(() => {
    if (!origin) return;
    setAiInsight(generateAIInsight(mode, rideState.surgeMultiplier ?? 1));
    Animated.timing(insightAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Load real places for default category
    loadDiscoverLayer('all');
  }, [origin]);

  // ─────────────────────────
  //  When theme changes → rebuild map HTML (via key prop)
  // ─────────────────────────
  const mapKey = `${theme}-${origin?.latitude ?? 0}`;

  // ─────────────────────────
  //  When mode changes → update AI insight + clear layers
  // ─────────────────────────
  useEffect(() => {
    setAiInsight(generateAIInsight(mode, rideState.surgeMultiplier ?? 1));
    setSelectedPlace(null);
    injectJS('clearAll();');
    if (origin && mode === 'discover') {
      loadDiscoverLayer(discoverCategory);
    }
    if (mode === 'food' && foodState.orderStatus !== 'idle') {
      simulateFoodDelivery();
    }
  }, [mode]);

  // ─────────────────────────
  //  Discover: render places on map
  // ─────────────────────────
  const loadDiscoverLayer = useCallback(async (cat: DiscoverCategory) => {
    if (!origin) return;
    const places = await fetchNearbyPlaces(origin, cat);
    setNearbyPlaces(places);
    injectJS(`renderPlaces(${JSON.stringify(places)});`);
    if (showHeatmap) renderHeatmapOverlay();
  }, [origin, showHeatmap]);

  useEffect(() => {
    if (mode === 'discover') loadDiscoverLayer(discoverCategory);
  }, [discoverCategory]);

  // ─────────────────────────
  //  Heatmap overlay
  // ─────────────────────────
  const renderHeatmapOverlay = useCallback(() => {
    if (!origin) return;
    const cells = Array.from({ length: 12 }, (_, i) => ({
      lat: origin.latitude + (Math.random() - 0.5) * 0.025,
      lng: origin.longitude + (Math.random() - 0.5) * 0.025,
      intensity: Math.random(),
    }));
    injectJS(`renderHeatmap(${JSON.stringify(cells)});`);
  }, [origin]);

  useEffect(() => {
    if (showHeatmap) renderHeatmapOverlay();
    else injectJS('heatLayers.forEach(function(l){map.removeLayer(l);}); heatLayers=[];');
  }, [showHeatmap]);

  // ─────────────────────────
  //  Ride: map tap handler
  // ─────────────────────────
  const handleRideTap = useCallback(async (lat: number, lng: number) => {
    if (pickupStage === 'pickup') {
      setRideState(prev => ({ ...prev, pickup: { latitude: lat, longitude: lng } }));
      injectJS(`setPickupPin(${lat},${lng});`);
      setPickupStage('dropoff');
    } else {
      const dropoff = { latitude: lat, longitude: lng };
      setRideState(prev => ({ ...prev, dropoff }));
      injectJS(`setDropoffPin(${lat},${lng});`);

      if (rideState.pickup) {
        // Real road route instead of straight line
        const route = await fetchRoadRoute(rideState.pickup, dropoff);
        if (route) {
          setRouteMeta({ duration: route.durationText, distance: route.distanceText });
          injectJS(`routeLayer=drawRoute(${JSON.stringify(route.polyline)},'#1C75FF',null);`);
          setRideState(prev => ({ ...prev, routeDrawn: true }));
          simulateDriverApproach(rideState.pickup);
        }
      }
      setPickupStage('pickup');
    }
  }, [pickupStage, rideState.pickup]);

  // ─────────────────────────
  //  Driver simulation
  // ─────────────────────────
  const simulateDriverApproach = (pickup: Coords) => {
    // Start driver off-screen from pickup
    const startLat = pickup.latitude + 0.008;
    const startLng = pickup.longitude + 0.006;
    let step = 0;
    const steps = 20;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const lat = startLat + (pickup.latitude - startLat) * t;
      const lng = startLng + (pickup.longitude - startLng) * t;
      injectJS(`moveDriver(${lat},${lng});`);
      const etaMins = Math.max(1, Math.round((1 - t) * 5));
      setRideState(prev => ({ ...prev, driverEta: `${etaMins} min` }));
      if (step >= steps) clearInterval(iv);
    }, 800);
  };

  // ─────────────────────────
  //  Food delivery simulation
  // ─────────────────────────
  const simulateFoodDelivery = useCallback(() => {
    if (!origin) return;
    const restaurant = {
      latitude: origin.latitude + 0.006,
      longitude: origin.longitude + 0.004,
    };
    setFoodState(prev => ({ ...prev, restaurantLocation: restaurant, orderStatus: 'confirmed', restaurantName: 'Amala Joint' }));
    injectJS(`setPickupPin(${restaurant.latitude},${restaurant.longitude});`);
    injectJS(`setDropoffPin(${origin.latitude},${origin.longitude});`);
    const coords = [[restaurant.latitude, restaurant.longitude], [origin.latitude, origin.longitude]];
    injectJS(`deliveryRouteLayer=drawRoute(${JSON.stringify(coords)},'#FF6B35','6,6');`);

    // Animate rider after 2s
    setTimeout(() => {
      setFoodState(prev => ({ ...prev, orderStatus: 'picked_up' }));
      let step = 0;
      const steps = 25;
      const iv = setInterval(() => {
        step++;
        const t = step / steps;
        const lat = restaurant.latitude + (origin.latitude - restaurant.latitude) * t;
        const lng = restaurant.longitude + (origin.longitude - restaurant.longitude) * t;
        injectJS(`moveRider(${lat},${lng});`);
        const etaMins = Math.max(1, Math.round((1 - t) * 18));
        setFoodState(prev => ({ ...prev, deliveryEta: `${etaMins} min` }));
        if (step >= steps) {
          clearInterval(iv);
          setFoodState(prev => ({ ...prev, orderStatus: 'arriving' }));
        }
      }, 700);
    }, 2000);
  }, [origin]);

  // ─────────────────────────
  //  WebView message handler
  // ─────────────────────────
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_TAPPED') {
        if (mode === 'ride') handleRideTap(data.lat, data.lng);
      }
      if (data.type === 'PLACE_TAPPED') {
        const place = nearbyPlaces.find(p => p.id === data.id);
        if (place) {
          setSelectedPlace(place);
          Animated.spring(bottomSheetAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }).start();
        }
      }
    } catch (e) { /* no-op */ }
  }, [mode, handleRideTap, nearbyPlaces]);

  // ─────────────────────────
  //  Theme colors
  // ─────────────────────────
  const TC = theme === 'dark'
    ? { bg: '#0B1528', surface: '#111E35', card: '#162040', text: '#F0F4FF', sub: '#7A8BAA', border: '#1E2D4A', pill: '#1C2E4A', pillActive: '#1C75FF' }
    : { bg: '#F5F7FA', surface: '#FFFFFF', card: '#FFFFFF', text: '#0D1B35', sub: '#6B7A99', border: '#DDE3F0', pill: '#E8EDF5', pillActive: '#1C75FF' };

  // ─────────────────────────
  //  Render
  // ─────────────────────────
  const centerLat = origin?.latitude ?? 6.5244;
  const centerLng = origin?.longitude ?? 3.3792;

  return (
    <View style={[styles.root, { backgroundColor: TC.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── MAP ──────────────────────────── */}
      <WebView
        key={mapKey}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: buildMapHtml(theme, centerLat, centerLng) }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleWebViewMessage}
        onLoad={() => {
          if (origin) {
            setTimeout(() => injectJS(`setUserLocation(${origin.latitude},${origin.longitude});`), 300);
            if (mode === 'discover') loadDiscoverLayer(discoverCategory);
          }
        }}
      />

      {/* ── TOP BAR ─────────────────────── */}
      <SafeAreaView style={styles.safeTop} pointerEvents="box-none">
        {/* Search + Theme Toggle */}
        <View style={[styles.topBar, { backgroundColor: TC.surface + 'F2' }]}>
          <View style={[styles.searchBox, { backgroundColor: TC.card, borderColor: TC.border }]}>
            <Text style={{ fontSize: 15, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: TC.text }]}
              placeholder={
                mode === 'ride'     ? 'Where to?' :
                mode === 'food'     ? 'Search restaurants...' :
                                      'Find places near you...'
              }
              placeholderTextColor={TC.sub}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (debounceRef.current) clearTimeout(debounceRef.current);
                if (!origin || text.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
                debounceRef.current = setTimeout(async () => {
                  const results = await fetchAutocompleteSuggestions(text, origin);
                  setSuggestions(results);
                  setShowSuggestions(results.length > 0);
                }, 350); // 350ms debounce — avoids hammering the API on every keystroke
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
          </View>
          {/* Theme toggle */}
          <View style={[styles.themeToggleRow, { backgroundColor: TC.pill }]}>
            {(['dark', 'light', 'satellite'] as MapTheme[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.themeBtn, theme === t && { backgroundColor: TC.pillActive }]}
                onPress={() => setTheme(t)}
              >
                <Text style={{ fontSize: 13 }}>
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🛰'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* ── AUTOCOMPLETE DROPDOWN ─────── */}
        {showSuggestions && (
          <View style={[styles.suggestionsBox, { backgroundColor: TC.surface, borderColor: TC.border }]}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={s.placeId}
                style={[
                  styles.suggestionRow,
                  { borderBottomColor: TC.border, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0 }
                ]}
                onPress={async () => {
                  setShowSuggestions(false);
                  setSearchText(s.description);
                  const coords = await fetchPlaceCoords(s.placeId);
                  if (!coords) return;

                  if (mode === 'ride') {
                    // First tap sets pickup, second sets dropoff and draws route
                    if (!rideState.pickup) {
                      setRideState(prev => ({ ...prev, pickup: coords }));
                      injectJS(`setPickupPin(${coords.latitude},${coords.longitude});`);
                      setPickupStage('dropoff');
                    } else {
                      setRideState(prev => ({ ...prev, dropoff: coords }));
                      injectJS(`setDropoffPin(${coords.latitude},${coords.longitude});`);
                      // Real road route
                      const route = await fetchRoadRoute(rideState.pickup, coords);
                      if (route) {
                        setRouteMeta({ duration: route.durationText, distance: route.distanceText });
                        injectJS(`routeLayer=drawRoute(${JSON.stringify(route.polyline)},'#1C75FF',null);`);
                        setRideState(prev => ({ ...prev, routeDrawn: true }));
                        if (rideState.pickup) simulateDriverApproach(rideState.pickup);
                      }
                      setPickupStage('pickup');
                    }
                  } else {
                    // In discover/food mode — just fly the map to the result
                    injectJS(`map.flyTo([${coords.latitude},${coords.longitude}],15,{animate:true,duration:1});`);
                  }
                }}
              >
                <Text style={{ fontSize: 13 }}>📍</Text>
                <Text style={[styles.suggestionText, { color: TC.text }]} numberOfLines={1}>
                  {s.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mode Tabs */}
        <View style={[styles.modeTabs, { backgroundColor: TC.surface + 'EE' }]}>
          {([
            { id: 'ride', label: 'Ride', icon: '🚗' },
            { id: 'food', label: 'Delivery', icon: '🛵' },
            { id: 'discover', label: 'Discover', icon: '🔍' },
          ] as { id: MapMode; label: string; icon: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.modeTab, mode === tab.id && { backgroundColor: TC.pillActive }]}
              onPress={() => setMode(tab.id)}
            >
              <Text style={{ fontSize: 14 }}>{tab.icon}</Text>
              <Text style={[styles.modeTabText, { color: mode === tab.id ? '#FFF' : TC.sub }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Insight bar */}
        {aiInsight ? (
          <Animated.View
            style={[
              styles.aiInsightBar,
              { backgroundColor: TC.surface + 'EE', opacity: insightAnim, transform: [{ translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] },
            ]}
          >
            <Text style={[styles.aiInsightText, { color: TC.text }]}>{aiInsight}</Text>
          </Animated.View>
        ) : null}

        {/* ── DISCOVER: Category pills ── */}
        {mode === 'discover' && (
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {(Object.keys(CATEGORY_META) as DiscoverCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              const active = discoverCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, { backgroundColor: active ? meta.color : TC.pill, borderColor: active ? meta.color : TC.border }]}
                  onPress={() => setDiscoverCategory(cat)}
                >
                  <Text style={{ fontSize: 12 }}>{meta.icon}</Text>
                  <Text style={[styles.categoryPillText, { color: active ? '#FFF' : TC.sub }]}>{meta.label}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Heatmap toggle */}
            <TouchableOpacity
              style={[styles.categoryPill, { backgroundColor: showHeatmap ? '#FF3B30' : TC.pill, borderColor: showHeatmap ? '#FF3B30' : TC.border }]}
              onPress={() => setShowHeatmap(h => !h)}
            >
              <Text style={{ fontSize: 12 }}>🌡</Text>
              <Text style={[styles.categoryPillText, { color: showHeatmap ? '#FFF' : TC.sub }]}>Demand</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── RIDE BOTTOM CARD ─────────────── */}
      {mode === 'ride' && (
        <View style={[styles.rideCard, { backgroundColor: TC.surface }]}>
          {/* Route hint */}
          <View style={styles.rideHintRow}>
            <View style={styles.routeDots}>
              <View style={[styles.dot, { backgroundColor: '#00C896' }]} />
              <View style={[styles.dotLine, { backgroundColor: TC.border }]} />
              <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rideHintLabel, { color: TC.sub }]}>
                {pickupStage === 'pickup' ? 'TAP MAP FOR PICKUP' : 'NOW TAP FOR DROP-OFF'}
              </Text>
              <Text style={[styles.rideHintValue, { color: TC.text }]}>
                {pickupStage === 'pickup'
                  ? rideState.pickup ? `${rideState.pickup.latitude.toFixed(4)}, ${rideState.pickup.longitude.toFixed(4)}` : 'Set your pickup point'
                  : rideState.dropoff ? `${rideState.dropoff.latitude.toFixed(4)}, ${rideState.dropoff.longitude.toFixed(4)}` : 'Where are you going?'}
              </Text>
            </View>
          </View>

          {/* ETA + Confidence + Surge row */}
          {rideState.routeDrawn && routeMeta && (
            <View style={[styles.rideMetaRow, { borderColor: TC.border }]}>
              <View style={styles.rideMetaItem}>
                <Text style={[styles.rideMetaValue, { color: TC.text }]}>{rideState.driverEta}</Text>
                <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>Driver ETA</Text>
              </View>
              <View style={[styles.rideMetaDivider, { backgroundColor: TC.border }]} />
              <View style={styles.rideMetaItem}>
                <Text style={[styles.rideMetaValue, { color: TC.text }]}>{routeMeta.duration}</Text>
                <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>Trip Time</Text>
              </View>
              <View style={[styles.rideMetaDivider, { backgroundColor: TC.border }]} />
              <View style={styles.rideMetaItem}>
                <Text style={[styles.rideMetaValue, { color: TC.text }]}>{routeMeta.distance}</Text>
                <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>Distance</Text>
              </View>
              <View style={[styles.rideMetaDivider, { backgroundColor: TC.border }]} />
              <View style={styles.rideMetaItem}>
                <Text style={[styles.rideMetaValue, { color: rideState.surgeMultiplier && rideState.surgeMultiplier > 1.3 ? '#FF6B35' : TC.text }]}>
                  {rideState.surgeMultiplier}×
                </Text>
                <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>Surge</Text>
              </View>
            </View>
          )}

          {rideState.routeDrawn && (
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Book Ride</Text>
            </TouchableOpacity>
          )}

          {/* Reset */}
          {(rideState.pickup || rideState.dropoff) && (
            <TouchableOpacity onPress={() => {
              setRideState({ pickup: null, dropoff: null, routeDrawn: false, driverLocation: null, driverEta: '4 min', confidenceScore: 87, surgeMultiplier: 1.2 });
              setPickupStage('pickup');
              injectJS('clearAll();');
            }}>
              <Text style={[styles.resetText, { color: TC.sub }]}>Clear route</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── FOOD BOTTOM CARD ─────────────── */}
      {mode === 'food' && (
        <View style={[styles.rideCard, { backgroundColor: TC.surface }]}>
          {foodState.orderStatus === 'idle' ? (
            <>
              <Text style={[styles.foodTitle, { color: TC.text }]}>Track a delivery</Text>
              <Text style={[styles.foodSub, { color: TC.sub }]}>Start an order to see live rider tracking on the map</Text>
              <TouchableOpacity style={[styles.bookBtn, { backgroundColor: '#FF6B35' }]} onPress={simulateFoodDelivery}>
                <Text style={styles.bookBtnText}>🛵  Simulate Live Order</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.foodStatusRow}>
                <View style={[styles.foodStatusDot, {
                  backgroundColor:
                    foodState.orderStatus === 'arriving' ? '#00C896'
                    : foodState.orderStatus === 'picked_up' ? '#FF6B35'
                    : '#1C75FF'
                }]} />
                <View>
                  <Text style={[styles.foodRestaurant, { color: TC.text }]}>{foodState.restaurantName}</Text>
                  <Text style={[styles.foodStatusText, { color: TC.sub }]}>
                    {foodState.orderStatus === 'confirmed' ? 'Order confirmed — preparing...'
                      : foodState.orderStatus === 'picked_up' ? 'Rider picked up your order'
                      : '🎉 Your order is arriving!'}
                  </Text>
                </View>
              </View>
              <View style={[styles.rideMetaRow, { borderColor: TC.border, marginTop: 12 }]}>
                <View style={styles.rideMetaItem}>
                  <Text style={[styles.rideMetaValue, { color: TC.text }]}>{foodState.deliveryEta}</Text>
                  <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>ETA</Text>
                </View>
                <View style={[styles.rideMetaDivider, { backgroundColor: TC.border }]} />
                <View style={styles.rideMetaItem}>
                  <Text style={[styles.rideMetaValue, { color: '#FF6B35' }]}>🛵 Live</Text>
                  <Text style={[styles.rideMetaLabel, { color: TC.sub }]}>Rider</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── DISCOVER: Nearby list (bottom sheet) ── */}
      {mode === 'discover' && !selectedPlace && (
        <View style={[styles.discoverSheet, { backgroundColor: TC.surface }]}>
          <View style={[styles.sheetHandle, { backgroundColor: TC.border }]} />
          <Text style={[styles.discoverTitle, { color: TC.text }]}>
            {CATEGORY_META[discoverCategory].icon} {CATEGORY_META[discoverCategory].label} Near You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.discoverScroll}>
            {nearbyPlaces
              .filter(p => discoverCategory === 'all' || p.category === discoverCategory)
              .map(place => (
                <TouchableOpacity
                  key={place.id}
                  style={[styles.discoverCard, { backgroundColor: TC.card, borderColor: TC.border }]}
                  onPress={() => setSelectedPlace(place)}
                >
                  <Text style={styles.discoverCardIcon}>
                    {CATEGORY_META[place.category]?.icon ?? '📍'}
                  </Text>
                  <Text style={[styles.discoverCardName, { color: TC.text }]} numberOfLines={1}>{place.name}</Text>
                  {place.rating && <Text style={styles.discoverCardRating}>⭐ {place.rating}</Text>}
                  <Text style={[styles.discoverCardDist, { color: TC.sub }]}>{place.distance}</Text>
                  <View style={[styles.discoverCardStatus, { backgroundColor: place.isOpen ? '#00C896' : '#FF3B30' }]}>
                    <Text style={styles.discoverCardStatusText}>{place.isOpen ? 'Open' : 'Closed'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {/* ── SELECTED PLACE DETAIL ─────────── */}
      {mode === 'discover' && selectedPlace && (
        <Animated.View style={[styles.placeDetail, { backgroundColor: TC.surface }]}>
          <View style={styles.placeDetailHeader}>
            <View>
              <Text style={[styles.placeDetailName, { color: TC.text }]}>{selectedPlace.name}</Text>
              <Text style={[styles.placeDetailCategory, { color: CATEGORY_META[selectedPlace.category].color }]}>
                {CATEGORY_META[selectedPlace.category].icon} {CATEGORY_META[selectedPlace.category].label}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPlace(null)} style={[styles.closeBtn, { backgroundColor: TC.pill }]}>
              <Text style={{ color: TC.sub, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.placeMetaRow, { borderColor: TC.border }]}>
            {selectedPlace.rating && (
              <View style={styles.placeMeta}>
                <Text style={[styles.placeMetaVal, { color: TC.text }]}>⭐ {selectedPlace.rating}</Text>
                <Text style={[styles.placeMetaLbl, { color: TC.sub }]}>Rating</Text>
              </View>
            )}
            <View style={styles.placeMeta}>
              <Text style={[styles.placeMetaVal, { color: TC.text }]}>{selectedPlace.distance}</Text>
              <Text style={[styles.placeMetaLbl, { color: TC.sub }]}>Distance</Text>
            </View>
            <View style={styles.placeMeta}>
              <Text style={[styles.placeMetaVal, { color: TC.text }]}>{selectedPlace.eta}</Text>
              <Text style={[styles.placeMetaLbl, { color: TC.sub }]}>Walk ETA</Text>
            </View>
            <View style={styles.placeMeta}>
              <Text style={[styles.placeMetaVal, { color: selectedPlace.isOpen ? '#00C896' : '#FF3B30' }]}>
                {selectedPlace.isOpen ? 'Open' : 'Closed'}
              </Text>
              <Text style={[styles.placeMetaLbl, { color: TC.sub }]}>Status</Text>
            </View>
          </View>
          {/* CTA based on category */}
          {selectedPlace.category === 'restaurant' && (
            <TouchableOpacity style={[styles.bookBtn, { backgroundColor: '#FF6B35' }]}>
              <Text style={styles.bookBtnText}>🛵  Order from here</Text>
            </TouchableOpacity>
          )}
          {(selectedPlace.category === 'atm' || selectedPlace.category === 'pos') && (
            <TouchableOpacity style={[styles.bookBtn, { backgroundColor: '#00C896' }]}>
              <Text style={styles.bookBtnText}>🚗  Ride here</Text>
            </TouchableOpacity>
          )}
          {selectedPlace.category === 'hotspot' && (
            <TouchableOpacity style={[styles.bookBtn, { backgroundColor: '#FFD93D' }]}>
              <Text style={[styles.bookBtnText, { color: '#111' }]}>🔍  Explore Hotspot</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* ── GPS LOADING OVERLAY ───────────── */}
      {isLoadingGPS && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1C75FF" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* ── RECENTER BUTTON ──────────────── */}
      {!isLoadingGPS && origin && (
        <TouchableOpacity
          style={[styles.recenterBtn, { backgroundColor: TC.surface, borderColor: TC.border }]}
          onPress={() => injectJS(`map.flyTo([${origin.latitude},${origin.longitude}],14,{animate:true,duration:1});`)}
        >
          <Text style={{ fontSize: 18 }}>◎</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },

  // Top bar
  topBar: { marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  themeToggleRow: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', padding: 2 },
  themeBtn: { padding: 7, borderRadius: 8 },

  // Mode tabs
  modeTabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, borderRadius: 14, padding: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5 },
  modeTabText: { fontSize: 13, fontWeight: '700' },

  // AI insight
  aiInsightBar: { marginHorizontal: 16, marginTop: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  aiInsightText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  // Category pills
  categoryScroll: { marginTop: 8 },
  categoryScrollContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, gap: 5 },
  categoryPillText: { fontSize: 12, fontWeight: '700' },

  // Ride card
  rideCard: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 },
  rideHintRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  routeDots: { alignItems: 'center', gap: 3 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotLine: { width: 2, height: 20, borderRadius: 1 },
  rideHintLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  rideHintValue: { fontSize: 14, fontWeight: '600' },
  rideMetaRow: { flexDirection: 'row', borderTopWidth: 1, marginTop: 16, paddingTop: 14, marginBottom: 4 },
  rideMetaItem: { flex: 1, alignItems: 'center' },
  rideMetaDivider: { width: 1, height: '100%' },
  rideMetaValue: { fontSize: 18, fontWeight: '800' },
  rideMetaLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  bookBtn: { backgroundColor: '#1C75FF', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  bookBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  resetText: { textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: '500' },

  // Suggestions
  suggestionsBox: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },

  // Food card
  foodTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  foodSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  foodStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  foodStatusDot: { width: 12, height: 12, borderRadius: 6 },
  foodRestaurant: { fontSize: 15, fontWeight: '700' },
  foodStatusText: { fontSize: 12, marginTop: 2 },

  // Discover sheet
  discoverSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  discoverTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  discoverScroll: {},
  discoverCard: { width: 140, borderRadius: 14, padding: 12, marginRight: 10, borderWidth: 1 },
  discoverCardIcon: { fontSize: 22, marginBottom: 6 },
  discoverCardName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  discoverCardRating: { fontSize: 12, color: '#FFD93D', marginBottom: 2 },
  discoverCardDist: { fontSize: 11, marginBottom: 6 },
  discoverCardStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  discoverCardStatusText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // Place detail
  placeDetail: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  placeDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  placeDetailName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  placeDetailCategory: { fontSize: 13, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  placeMetaRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14, marginBottom: 16 },
  placeMeta: { flex: 1, alignItems: 'center' },
  placeMetaVal: { fontSize: 15, fontWeight: '800' },
  placeMetaLbl: { fontSize: 10, fontWeight: '500', marginTop: 2 },

  // Utils
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,40,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '600' },
  recenterBtn: { position: 'absolute', right: 16, bottom: 220, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
});