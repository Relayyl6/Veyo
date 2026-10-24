import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Switch } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import { useDriverStore, useLocationStore } from '@/store/store';
import { calculateRegion, generateMarkersFromData, MapMarker } from '@/lib/map';
import { MarkerData } from '@/types/type';
import { icons } from '@/constants/utils';

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false); // Controls WebView vs Native Map view state
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const webViewRef = useRef<WebView>(null);
  const mapRef = useRef<MapView>(null); // Ref handler for smooth native camera tracking pan movements
  const { userLatitude, userLongitude, destinationLatitude, destinationLongitude, isLoading, setIsLoading } = useLocationStore();
  const { selectedDriver, setDrivers, drivers } = useDriverStore()

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;
      
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude
      })

      setMarkers(newMarkers)
    }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const hasStoreCoords = (
          typeof userLatitude === 'number' && Number.isFinite(userLatitude) &&
          typeof userLongitude === 'number' && Number.isFinite(userLongitude)
        );

        // Prefer store coordinates when available
        if (hasStoreCoords) {
          setUserLocation({ latitude: userLatitude as number, longitude: userLongitude as number });
        }

        setIsLoading(false);

        // Update WebView script layer only when we have valid numeric coords
        if (hasStoreCoords) {
          const updateJS = `
            if (typeof map !== 'undefined') {
              map.flyTo([${userLatitude}, ${userLongitude}], 14, { animate: true, duration: 1.5 });
              L.marker([${userLatitude}, ${userLongitude}]).addTo(map).bindPopup("You are here").openPopup();
            }
            true;
          `;
          webViewRef.current?.injectJavaScript(updateJS);
        }

        // Smoothly animate native map camera if we have coordinates from either source
        const latToUse = hasStoreCoords ? userLatitude : userLocation?.latitude;
        const lngToUse = hasStoreCoords ? userLongitude : userLocation?.longitude;

        if (typeof latToUse === 'number' && typeof lngToUse === 'number') {
          mapRef.current?.animateToRegion({
            latitude: latToUse,
            longitude: lngToUse,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }, 1000);
        }

      } catch (error) {
        console.error("Error securing live coordinates: ", error);
        setIsLoading(false);
      }
    })();
  }, [userLatitude, userLongitude]);

  // Structural coordinate system fallbacks (Lagos, Nigeria)
  const startLat = (typeof userLatitude === 'number' && Number.isFinite(userLatitude))
    ? userLatitude
    : (typeof userLocation?.latitude === 'number' && Number.isFinite(userLocation.latitude))
      ? userLocation.latitude
      : 6.5244;

  const startLng = (typeof userLongitude === 'number' && Number.isFinite(userLongitude))
    ? userLongitude
    : (typeof userLocation?.longitude === 'number' && Number.isFinite(userLocation.longitude))
      ? userLocation.longitude
      : 3.3792;

  const hasRealLocation = (typeof userLatitude === 'number' && Number.isFinite(userLatitude)) || userLocation !== null;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #0b1528; }
        .leaflet-control-attribution { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${startLat}, ${startLng}], 13);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        if (${hasRealLocation}) {
          L.marker([${startLat}, ${startLng}]).addTo(map).bindPopup("You are here").openPopup();
        }
      </script>
    </body>
    </html>
  `;

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const region = calculateRegion({
    userLatitude: startLat,
    userLongitude: startLng,
    destinationLatitude: destinationLatitude,
    destinationLongitude: destinationLongitude
  })

  return (
    <View style={[styles.wrapper, { borderRadius: 16 }]}>
      <Switch
        className='top-4 right-4 absolute z-50' // Increased z-index to stay accessible over native map stacks
        trackColor={{false: '#767577', true: '#3122D2'}}
        thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />

      {!isEnabled ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map} 
          showsUserLocation={true}
          mapType='hybrid'
          showsPointsOfInterests={false}
          userInterfaceStyle='dark' 
          showsMyLocationButton={true}
          initialRegion={region}
        >
          {userLocation && (
            <Marker 
              coordinate={{ latitude: startLat, longitude: startLng }}
              title="You are here"
            />
          )}
          {
            markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude as number,
                  longitude: marker.longitude as number
                }}
                title={marker.title}
                image={selectedDriver === marker.id ? icons.selectedMarker : icons.marker} 
              />
            ))
          }
        </MapView>
      )}

      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color="#3122D2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1, // Forces the view structure components to fill out container boundaries completely
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 21, 40, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40
  }
});

export default Map;