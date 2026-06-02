import React from 'react'
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

const Map = () => {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      // Force concrete cross-platform rendering sizing rules
      style={[styles.map, { borderRadius: 16 }]} 
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
  )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  }
});

export default Map;