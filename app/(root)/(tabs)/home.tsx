// main  scren for active rides, booking rides ,chat
// Once a user books a ride and a driver is assigned, your Home screen (the map) should display a Bottom Sheet or an overlay card with the trip details.

// Placement: Right next to the driver’s name, photo, and license plate, place two prominent circular icon buttons: a phone icon (Call) and a message bubble icon (Chat).

// Behavior: Tapping the chat icon slides up a dedicated chat interface over the map. Once the ride is completed or canceled, this chat instance disappears entirely.

import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/expo'

const Index = () => {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // 1. Tell Clerk to kill the active session
      await signOut()
      
      // 2. Route the user back to your AuthLayout/Welcome screen
      router.replace('/(auth)/welcome')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }
  return (
    <SafeAreaView className='flex-1 justify-center items-center bg-red-900'>
      <Text>index</Text>
      <Pressable onPress={handleSignOut}>
        <Text>Sign out</Text>
      </Pressable>
      <StatusBar style='inverted'/>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({})