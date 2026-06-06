import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Switch } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import MapView, {PROVIDER_DEFAULT} from "react-native-maps";

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Replaces: showsUserLocation={true} & initialRegion
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          setIsLoading(false);
          return;
        }

        // Fast fallback check using cached device coordinates
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setUserLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
          setIsLoading(false);
        }

        // Live highly accurate location polling lock
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const liveCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(liveCoords);
        setIsLoading(false);

        // Dynamically shift the browser frame center to live coordinates without re-rendering the root tree
        const updateJS = `
          if (typeof map !== 'undefined') {
            map.flyTo([${liveCoords.latitude}, ${liveCoords.longitude}], 14, { animate: true, duration: 1.5 });
            L.marker([${liveCoords.latitude}, ${liveCoords.longitude}]).addTo(map).bindPopup("You are here").openPopup();
          }
          true;
        `;
        webViewRef.current?.injectJavaScript(updateJS);

      } catch (error) {
        console.error("Error securing live coordinates: ", error);
        setIsLoading(false);
      }
    })();
  }, []);

  // Set default structural safety coordinates (e.g. Lagos, Nigeria) if phone fails device location retrieval
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
        // Equates to: provider={PROVIDER_DEFAULT} & initialRegion setup details
        var map = L.map('map', { 
          zoomControl: false, 
          attributionControl: false 
        }).setView([${startLat}, ${startLng}], 13);
        
        // Equates to: mapType='satellite' (Esri World Imagery)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(map);

        // Equates to: showsPointsOfInterests={true} (CartoDB Hybrid Vector Street Typography & POIs Overlay)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        // If location is already ready on mounting layout, drop active locator marker instantly
        if (${userLocation !== null}) {
          L.marker([${startLat}, ${startLng}]).addTo(map).bindPopup("You are here").openPopup();
        }
      </script>
    </body>
    </html>
  `;

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);


  return (
    <View style={[styles.wrapper, { borderRadius: 16 }]}>
      <Switch
        className='top-2 right-2 absolute z-10'
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
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
          provider={PROVIDER_DEFAULT}
        />
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
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 21, 40, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Map;