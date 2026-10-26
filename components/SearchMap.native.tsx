import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { icons } from '@/constants/utils';

export interface SearchMapItem {
  id: number | string;
  title: string;
  price?: string;
  rating?: string;
  distance?: string;
  location?: string;
  latitude: number;
  longitude: number;
  category?: string;
  vendorName?: string;
}

export interface SearchMapProps {
  items?: SearchMapItem[];
  selectedItem?: SearchMapItem | null;
  onSelectMarker?: (item: SearchMapItem) => void;
  style?: object;
}

const DEFAULT_LAGOS_REGION = {
  latitude: 6.4350,
  longitude: 3.4260,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

// Route polyline coordinates matching the visual curve in the screenshot
const ROUTE_COORDINATES = [
  { latitude: 6.4440, longitude: 3.4190 }, // 12 min arrival origin
  { latitude: 6.4390, longitude: 3.4215 },
  { latitude: 6.4345, longitude: 3.4250 },
  { latitude: 6.4300, longitude: 3.4280 }, // Destination
];

const NEARBY_COURIERS = [
  { id: 'c1', latitude: 6.4410, longitude: 3.4360 },
  { id: 'c2', latitude: 6.4290, longitude: 3.4200 },
  { id: 'c3', latitude: 6.4470, longitude: 3.4320 },
];

const FOOD_HOTSPOTS = [
  { id: 'v1', title: 'Healthy Habits', category: 'healthy', latitude: 6.4330, longitude: 3.4290, color: '#3122D2' },
  { id: 'v2', title: 'Zest Juice Bar', category: 'drinks', latitude: 6.4420, longitude: 3.4370, color: '#0D7A87' },
  { id: 'v3', title: 'Fresh Greens Co', category: 'salad', latitude: 6.4270, longitude: 3.4160, color: '#D97706' },
  { id: 'v4', title: 'Ocean Catch', category: 'seafood', latitude: 6.4370, longitude: 3.4240, color: '#4F46E5' },
];

const SearchMap: React.FC<SearchMapProps> = ({
  items = [],
  selectedItem,
  onSelectMarker,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  // Smoothly center when selectedItem changes
  useEffect(() => {
    if (selectedItem && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedItem.latitude,
          longitude: selectedItem.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [selectedItem]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={DEFAULT_LAGOS_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
        showsPointsOfInterest={false}
      >
        {/* 1. Curved Delivery Route Line */}
        <Polyline
          coordinates={ROUTE_COORDINATES}
          strokeColor="#E11D48" // Vibrant delivery accent line
          strokeWidth={3.5}
          lineDashPattern={[0]}
        />

        {/* 2. Top-Left ETA Arrival Marker Callout */}
        <Marker
          coordinate={ROUTE_COORDINATES[0]}
          anchor={{ x: 0.5, y: 1.0 }}
        >
          <View style={styles.etaMarkerContainer}>
            <View style={styles.etaPill}>
              <Ionicons name="time" size={13} color="#FFFFFF" />
              <Text style={styles.etaText}>12 min arrival</Text>
            </View>
            <View style={styles.etaPinDot}>
              <Ionicons name="location" size={14} color="#3122D2" />
            </View>
          </View>
        </Marker>

        {/* 3. Delivery Route Destination Icon */}
        <Marker coordinate={ROUTE_COORDINATES[ROUTE_COORDINATES.length - 1]}>
          <View style={styles.destinationPinCircle}>
            <Ionicons name="home" size={13} color="#FFFFFF" />
          </View>
        </Marker>

        {/* 4. Vendor Pill Markers on Map */}
        {FOOD_HOTSPOTS.map((hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={{ latitude: hotspot.latitude, longitude: hotspot.longitude }}
          >
            <View style={[styles.vendorPill, { backgroundColor: hotspot.color }]}>
              <Text style={styles.vendorPillText}>{hotspot.title}</Text>
            </View>
          </Marker>
        ))}

        {/* 5. Search Results Markers */}
        {items.map((item, index) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <Marker
              key={`search-item-${item.id || index}`}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              onPress={() => onSelectMarker && onSelectMarker(item)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.resultPin, isSelected && styles.resultPinActive]}>
                <Ionicons
                  name="restaurant"
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#3122D2'}
                />
              </View>
            </Marker>
          );
        })}

        {/* 6. Nearby Couriers & Driver Cars */}
        {NEARBY_COURIERS.map((courier) => (
          <Marker
            key={courier.id}
            coordinate={{ latitude: courier.latitude, longitude: courier.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.courierCircle}>
              <FontAwesome5 name="car" size={11} color="#3122D2" />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

export default SearchMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8F0F2',
  },
  etaMarkerContainer: {
    alignItems: 'center',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3122D2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  etaText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  etaPinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3122D2',
  },
  destinationPinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3122D2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  vendorPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  vendorPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  resultPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3122D2',
    ...Platform.select({
      ios: {
        shadowColor: '#3122D2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultPinActive: {
    backgroundColor: '#3122D2',
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  courierCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C3D9FF',
  },
});
