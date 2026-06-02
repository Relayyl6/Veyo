import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';
import { AppleMapsMapStyleEmphasis, AppleMapsMapType } from 'expo-maps/build/apple/AppleMaps.types';
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

export default function Map() {
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(true);

  const gref = useRef<GoogleMaps.MapView>(null);
  const aref = useRef<AppleMaps.MapView>(null);

  // 1. Fetch User's Live Location on Startup
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          setIsLoadingGPS(false);
          return;
        }

        // Real-world optimization: Get last known location fast first, then look for current accurate lock
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setOrigin({ latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude });
          setIsLoadingGPS(false);
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const newCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setOrigin(newCoords);
        setIsLoadingGPS(false);

        // Animate camera to the newly found location smoothly
        const newCam = { coordinates: newCoords, zoom: 15, pitch: is3DMode ? 60 : 0 };
        if (Platform.OS === 'ios') {
          aref.current?.setCameraPosition(newCam);
        } else {
          gref.current?.setCameraPosition(newCam);
        }

      } catch (error) {
        console.error("Error securing user coordinates: ", error);
        setIsLoadingGPS(false);
      }
    })();
  }, []);

  // 2. Fetch Directions (Same as your core logic)
  useEffect(() => {
    if (!origin || !destination) return;
    const fetchDirections = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const encodedPolyline = data.routes[0].overview_polyline.points;
          const decoded = polyline.decode(encodedPolyline);
          const coords = decoded.map((point: number[]) => ({
            latitude: point[0],
            longitude: point[1],
          }));
          setRouteCoordinates(coords);
        }
      } catch (error) {
        console.error("Failed to fetch directions", error);
      }
    };
    fetchDirections();
  }, [origin, destination]);

  const markers = [];
  if (origin) markers.push({ coordinates: origin, title: "Pickup Location" });
  if (destination) markers.push({ coordinates: destination, title: "Dropoff" });

  const polylines = routeCoordinates.length > 0 ? [{
    color: "blue",
    width: 5,
    coordinates: routeCoordinates,
  }] : [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Search Bar - Always on top */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Where to?"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              setDestination({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
            }
          }}
          query={{ key: GOOGLE_MAPS_APIKEY, language: 'en' }}
          styles={{
            textInput: styles.searchInput,
            container: { flex: 0 },
            listView: { backgroundColor: 'white', borderRadius: 8, marginTop: 5 }
          }}
        />
      </View>

      {/* The Native Maps Render immediately, avoiding screen blocking */}
      {Platform.OS === 'ios' ? (
        <AppleMaps.View
          ref={aref}
          style={StyleSheet.absoluteFill}
          markers={markers}
          polylines={polylines}
          properties={{
            isMyLocationEnabled: true,
            isTrafficEnabled: true,
            selectionEnabled: true,
            emphasis: AppleMapsMapStyleEmphasis.AUTOMATIC,
            mapType: AppleMapsMapType.STANDARD,
          }}
        />
      ) : (
        <GoogleMaps.View
          ref={gref}
          style={StyleSheet.absoluteFill}
          markers={markers}
          polylines={polylines}
          properties={{
            isBuildingEnabled: true,
            isMyLocationEnabled: true,
            mapType: GoogleMapsMapType.HYBRID,
            selectionEnabled: true,
            isTrafficEnabled: true
          }}
        />
      )}

      {/* Real-World Native Overlay Loading Mask */}
      {isLoadingGPS && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#3122D2" />
          <Text style={styles.loadingText}>Locating GPS Signal...</Text>
        </View>
      )}

      {/* 3D Map Toggle Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIs3DMode(!is3DMode)}>
          <Text style={styles.buttonText}>{is3DMode ? "2D View" : "3D View"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    width: '90%',
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    flexDirection: 'row',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 10,
  },
  toggleButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});