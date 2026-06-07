import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Switch } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
// 1. PROVIDER_DEFAULT forces Apple Maps on iOS and Google Maps on Android
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false); // Controls WebView vs Native Map view state
  const webViewRef = useRef<WebView>(null);
  const mapRef = useRef<MapView>(null); // Ref handler for smooth native camera tracking pan movements

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          setIsLoading(false);
          return;
        }

        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setUserLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
          setIsLoading(false);
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const liveCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(liveCoords);
        setIsLoading(false);

        // Update WebView script layer if active
        const updateJS = `
          if (typeof map !== 'undefined') {
            map.flyTo([${liveCoords.latitude}, ${liveCoords.longitude}], 14, { animate: true, duration: 1.5 });
            L.marker([${liveCoords.latitude}, ${liveCoords.longitude}]).addTo(map).bindPopup("You are here").openPopup();
          }
          true;
        `;
        webViewRef.current?.injectJavaScript(updateJS);

        // Dynamically update Native MapView camera coordinates smoothly if user has flipped the toggle
        mapRef.current?.animateToRegion({
          ...liveCoords,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1000);

      } catch (error) {
        console.error("Error securing live coordinates: ", error);
        setIsLoading(false);
      }
    })();
  }, []);

  // Structural coordinate system fallbacks (Lagos, Nigeria)
  const startLat = userLocation?.latitude ?? 6.5244;
  const startLng = userLocation?.longitude ?? 3.3792;

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
        if (${userLocation !== null}) {
          L.marker([${startLat}, ${startLng}]).addTo(map).bindPopup("You are here").openPopup();
        }
      </script>
    </body>
    </html>
  `;

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

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
          showsMyLocationButton={true}
          initialRegion={{
            latitude: startLat,
            longitude: startLng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
        >
          {userLocation && (
            <Marker 
              coordinate={{ latitude: startLat, longitude: startLng }}
              title="You are here"
            />
          )}
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