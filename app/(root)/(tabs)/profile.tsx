// include an 
// Features: Emergency SOS slider, options to share live 
// trip status with trusted contacts, driver rating reviews,
// and customer support access. Inside the Profile tab, under 
// a "Help & Support" or "Contact Us" section add a chat feature
// This opens a generic customer support chat (often interacting with a bot first before routing to a human).
import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { useAuth, useUser } from '@clerk/expo'

const Profile = () => {
  const { signOut } = useAuth()
  const router = useRouter()
  const { user } = useUser()
  console.log(user)

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

export default Profile

const styles = StyleSheet.create({})