import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const UtilLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="map" options={{ headerShown: false }} />
    </Stack>
  )
}

export default UtilLayout