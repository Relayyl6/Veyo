import { Stack } from 'expo-router';
import React from 'react';

const UtilLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="search" />
      <Stack.Screen name="map" />
      <Stack.Screen name="book-ride" />
      <Stack.Screen name="send-items" />
      <Stack.Screen name="trip-details" />
      <Stack.Screen name="item" />
    </Stack>
  );
};

export default UtilLayout;
