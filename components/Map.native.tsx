import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useDriverStore, useLocationStore } from '@/store/store';
import { calculateRegion, generateMarkersFromData, MapMarker, DEFAULT_REGION } from '@/lib/map';
import { icons } from '@/constants/utils';
import { driver_profiles } from '@/constants/data';

export interface MapProps {
  height?: number;
  showExpandButton?: boolean;
  showRecenterButton?: boolean;
  showDriverCount?: boolean;
  interactive?: boolean;
  containerStyle?: object;
  onExpandPress?: () => void;
}

const Map: React.FC<MapProps> = ({
  height = 240,
  showExpandButton = true,
  showRecenterButton = true,
  showDriverCount = true,
  interactive = true,
  containerStyle,
  onExpandPress,
}) => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const {
    userLatitude,
    userLongitude,
    userAddress,
    destinationLatitude,
    destinationLongitude,
    setUserLocation,
  } = useLocationStore();

  const { selectedDriver, setSelectedDriver, drivers } = useDriverStore();

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Fallback / Active coordinate resolution
  const activeLat =
    typeof userLatitude === 'number' && Number.isFinite(userLatitude)
      ? userLatitude
      : DEFAULT_REGION.latitude;

  const activeLng =
    typeof userLongitude === 'number' && Number.isFinite(userLongitude)
      ? userLongitude
      : DEFAULT_REGION.longitude;

  const hasCoords =
    typeof userLatitude === 'number' &&
    Number.isFinite(userLatitude) &&
    typeof userLongitude === 'number' &&
    Number.isFinite(userLongitude);

  // Request location once if store is uninitialized
  useEffect(() => {
    if (!hasCoords) {
      (async () => {
        try {
          setIsLocating(true);
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc =
              (await Location.getLastKnownPositionAsync({})) ||
              (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

            if (loc?.coords) {
              setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                address: userAddress || 'Current Location',
              });
            }
          }
        } catch (e) {
          console.log('[Map] Location fetch fallback:', e);
        } finally {
          setIsLocating(false);
        }
      })();
    }
  }, [hasCoords, setUserLocation, userAddress]);

  // Generate driver markers around active coordinate
  useEffect(() => {
    const rawDriverPool =
      Array.isArray(drivers) && drivers.length > 0
        ? drivers
        : driver_profiles.driver_profiles;

    const generated = generateMarkersFromData({
      data: rawDriverPool as any,
      userLatitude: activeLat,
      userLongitude: activeLng,
      options: { maxOffsetMeters: 600, avgSpeedKmh: 35 },
    });

    setMarkers(generated.slice(0, 6));
  }, [drivers, activeLat, activeLng]);

  // Recenter handler
  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: activeLat,
          longitude: activeLng,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        600
      );
    }
  }, [activeLat, activeLng]);

  // Navigate to full map
  const handleOpenFullMap = useCallback(() => {
    if (onExpandPress) {
      onExpandPress();
    } else {
      router.push('/(utils)/map');
    }
  }, [onExpandPress, router]);

  const initialRegion = calculateRegion({
    userLatitude: activeLat,
    userLongitude: activeLng,
    destinationLatitude,
    destinationLongitude,
  });

  return (
    <View style={[styles.container, { height }, containerStyle]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
        showsPointsOfInterest={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={false}
        onMapReady={() => setMapReady(true)}
      >
        {/* User Marker if native indicator is delayed */}
        {hasCoords && (
          <Marker
            coordinate={{ latitude: activeLat, longitude: activeLng }}
            title="You are here"
            description={userAddress || 'Current Location'}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userPin}>
              <View style={styles.userPinInner} />
            </View>
          </Marker>
        )}

        {/* Nearby Drivers */}
        {markers.map((marker, index) => {
          const markerId = marker.id ? Number(marker.id) : index;
          const isSelected = selectedDriver === markerId;

          return (
            <Marker
              key={`driver-${markerId}-${index}`}
              coordinate={{
                latitude: Number(marker.latitude),
                longitude: Number(marker.longitude),
              }}
              title={marker.title || 'Available Driver'}
              description={
                marker.eta_minutes
                  ? `ETA ~${Math.round(marker.eta_minutes)} mins`
                  : 'Ready for ride'
              }
              onPress={() => setSelectedDriver(markerId)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image
                source={isSelected ? icons.selectedMarker : icons.marker}
                style={[
                  styles.driverMarkerIcon,
                  isSelected && styles.driverMarkerIconSelected,
                ]}
                resizeMode="contain"
              />
              <Callout tooltip>
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle}>{marker.title || 'Driver'}</Text>
                  {marker.eta_minutes && (
                    <Text style={styles.calloutSubtitle}>
                      {Math.round(marker.eta_minutes)} min away
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Top Floating Badge Bar */}
      <View style={styles.topBar}>
        {showDriverCount && (
          <View style={styles.driverCountPill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.driverCountText}>
              {markers.length > 0 ? `${markers.length} Drivers Nearby` : 'GPS Connected'}
            </Text>
          </View>
        )}

        {showExpandButton && (
          <TouchableOpacity
            style={styles.expandButton}
            activeOpacity={0.8}
            onPress={handleOpenFullMap}
          >
            <Text style={styles.expandButtonText}>Full Map</Text>
            <Feather name="maximize-2" size={13} color="#0286FF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Right Floating Controls */}
      {showRecenterButton && (
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.recenterButton}
            activeOpacity={0.85}
            onPress={handleRecenter}
          >
            <MaterialIcons name="my-location" size={18} color="#0286FF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Subtle Bottom Location Strip */}
      <TouchableOpacity
        style={styles.bottomInfoStrip}
        activeOpacity={0.9}
        onPress={handleOpenFullMap}
      >
        <Ionicons name="navigate-circle" size={18} color="#0286FF" />
        <Text style={styles.bottomInfoText} numberOfLines={1}>
          {userAddress || (hasCoords ? 'Live GPS Location active' : 'Locating device...')}
        </Text>
        <Feather name="chevron-right" size={16} color="#858585" />
      </TouchableOpacity>

      {/* Loading overlay if fetching */}
      {isLocating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#0286FF" />
        </View>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EBF4FF',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  driverCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBF4FF',
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0CC25F',
    marginRight: 6,
  },
  driverCountText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0B1528',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3D9FF',
  },
  expandButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
  },
  bottomControls: {
    position: 'absolute',
    right: 12,
    bottom: 52,
    zIndex: 10,
  },
  recenterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF4FF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bottomInfoStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    zIndex: 10,
  },
  bottomInfoText: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#364573',
  },
  userPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(2, 134, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0286FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverMarkerIcon: {
    width: 28,
    height: 28,
  },
  driverMarkerIconSelected: {
    width: 34,
    height: 34,
    transform: [{ scale: 1.15 }],
  },
  calloutCard: {
    backgroundColor: '#0B1528',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  calloutTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  calloutSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 9,
    color: '#9BBFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});
