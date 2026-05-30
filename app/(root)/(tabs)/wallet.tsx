// // Features: Add/remove debit cards, view Veyo app balance,
// // see current promotions or discount codes, and view a 
// // summary of ride spending.

// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Wallet = () => {
//   return (
//     <View>
//       <Text>Wallet</Text>
//     </View>
//   )
// }
// // 
// export default Wallet

// const styles = StyleSheet.create({})

import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import polyline from '@mapbox/polyline';
import { locationList } from "@/constants/LocationList"
import { useRef, useState } from 'react';
import { useBottomTabOverflow } from '@/components/BlurTabBarBackground.ios'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImage } from "expo-image";

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

export default function App() {
  const [locationIndex, setLocationIndex] = useState(0);

  const bottom = useBottomTabOverflow();

  const image = useImage("https://picsum.photos/128", {
    onError(error) {
      console.error(error);
    },
  });

  const gref = useRef<GoogleMaps.MapView>(null);
  const aref = useRef<AppleMaps.MapView>(null);

  const handleChangeWithRef = (direction: "next" | "prev") => {
    const newIndex = locationIndex + (direction === "next" ? 1 : -1);
    const nextLocation = locationList[newIndex];

    // 1. Create the camera configuration object so you don't repeat yourself
    const newCameraPosition = {
      coordinates: {
        latitude: nextLocation.stores[0].point[0],
        longitude: nextLocation.stores[0].point[1],
      },
      zoom: 10,
    };

    // 2. Check the platform and trigger the correct ref
    if (Platform.OS === 'ios') {
      aref.current?.setCameraPosition(newCameraPosition);
    } else if (Platform.OS === 'android') {
      gref.current?.setCameraPosition(newCameraPosition);
    }

    // 3. Update state after animation is triggered
    setLocationIndex(newIndex);
  };

  const cameraPosition = {
    coordinates: {
      latitude: locationList[locationIndex].stores[0].point[0],
      longitude: locationList[locationIndex].stores[0].point[1]
    },
    zoom: 12
  }

  const renderMapControl = () => (
    <>
      <View style={{ flex: 8 }} pointerEvents="none" />

      <View style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }} pointerEvents="auto">
        <Button title="Prev" onPress={() => handleChangeWithRef("prev")} />
        <Button title="Next" onPress={() => handleChangeWithRef("next")} />
      </View>
    </>
  )

  if (Platform.OS === 'ios') {
    return (
      <>
        <AppleMaps.View
          ref={aref}
          style={StyleSheet.absoluteFill}
          cameraPosition={cameraPosition}
          markers={markersApple}
          annotations={[
            {
              coordinates: { latitude: 37.8199, longitude: -122.4783 },
              title: "Expo HQ",
              text: "Expo HQ",
              textColor: "white",
              backgroundColor: "black",
              icon: image ? image : undefined,
            },
          ]}
        />
        <SafeAreaView
          className='flex-1'
          style={{ paddingBottom: bottom }}
          pointerEvents='box-none'
        >
          {renderMapControl()}
        </SafeAreaView>
      </>
    );
  } else if (Platform.OS === 'android') {
    return (
      <>
        <GoogleMaps.View
          ref={gref}
          style={StyleSheet.absoluteFill}
          cameraPosition={cameraPosition}
          markers={markersGoogle}
        />
        <SafeAreaView
          className='flex-1'
          style={{ paddingBottom: bottom }}
          pointerEvents='box-none'
        >
          {renderMapControl()}
        </SafeAreaView>
      </>
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

const markersGoogle = [
  {
    coordinates: { latitude: 49.259133, longitude: -123.10079 },
    title: "49th Parallel Café & Lucky's Doughnuts - Main Street",
    snippet: "49th Parallel Café & Lucky's Doughnuts - Main Street",
    draggable: true,
  },
  {
    coordinates: { latitude: 49.268034, longitude: -123.154819 },
    title: "49th Parallel Café & Lucky's Doughnuts - 4th Ave",
    snippet: "49th Parallel Café & Lucky's Doughnuts - 4th Ave",
    draggable: true,
  },
  {
    coordinates: { latitude: 49.286036, longitude: -123.12303 },
    title: "49th Parallel Café & Lucky's Doughnuts - Thurlow",
    snippet: "49th Parallel Café & Lucky's Doughnuts - Thurlow",
    draggable: true,
  },
  {
    coordinates: { latitude: 49.311879, longitude: -123.079241 },
    title: "49th Parallel Café & Lucky's Doughnuts - Lonsdale",
    snippet: "49th Parallel Café & Lucky's Doughnuts - Lonsdale",
    draggable: true,
  },
  {
    coordinates: {
      latitude: 49.27235336018808,
      longitude: -123.13455838338278,
    },
    title: "A La Mode Pie Café - Granville Island",
    snippet: "A La Mode Pie Café - Granville Island",
    draggable: true,
  },
];

const markersApple = [
  {
    coordinates: { latitude: 49.259133, longitude: -123.10079 },
    title: "49th Parallel Café & Lucky's Doughnuts - Main Street",
    tintColor: "orange",
    systemImage: "fork.knife",
  },
  {
    coordinates: { latitude: 49.268034, longitude: -123.154819 },
    title: "49th Parallel Café & Lucky's Doughnuts - 4th Ave",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: { latitude: 49.286036, longitude: -123.12303 },
    title: "49th Parallel Café & Lucky's Doughnuts - Thurlow",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: { latitude: 49.311879, longitude: -123.079241 },
    title: "49th Parallel Café & Lucky's Doughnuts - Lonsdale",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: {
      latitude: 49.27235336018808,
      longitude: -123.13455838338278,
    },
    title: "A La Mode Pie Café - Granville Island",
    tintColor: "orange",
    systemImage: "fork.knife",
  },
];
const polylineCoordinates = [
  { latitude: 33.8121, longitude: -117.919 }, // Disneyland
  { latitude: 33.837, longitude: -117.912 },
  { latitude: 33.88, longitude: -117.9 },
  { latitude: 33.9456, longitude: -117.8735 },
  { latitude: 34.0, longitude: -117.85 },
  { latitude: 34.05, longitude: -117.82 },
  { latitude: 34.1, longitude: -117.78 },
  { latitude: 34.2, longitude: -118.0 },
  { latitude: 34.2222, longitude: -118.1234 },
  { latitude: 34.233, longitude: -118.2 },
  { latitude: 34.2355, longitude: -118.3 },
  { latitude: 34.1367, longitude: -118.2942 }, // Hollywood
  { latitude: 34.1341, longitude: -118.3215 }, // Hollywood Sign
];