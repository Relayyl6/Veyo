import { Image, StyleSheet, Text, View, Alert, Platform, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomButton from './CustomButton'
import { icons } from '@/constants/utils'
import { useSignInWithGoogle } from '@clerk/expo/google'
import { useRouter } from 'expo-router'

declare interface GoogleSignInButtonProps {
  onSignInComplete?: () => void
} 

const OAuth = () => {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle()
  const router = useRouter()

  // Only render on iOS and Android
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null
  }
  
  const handleGoogleSignIn = async ({
    onSignInComplete,
  }: GoogleSignInButtonProps) => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow()

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })

        if (onSignInComplete) {
          onSignInComplete()
        } else {
          router.replace('/(root)/(tabs)/home')
        }
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
        return
      }

      Alert.alert('Error', err.message || 'An error occurred during Google sign-in')
      console.error('Sign in with Google error:', JSON.stringify(err, null, 2))
    }
  }
  const handleAppleSignIn = async () => {}
  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-3 gap-x-3">
        <View className="h-px flex-1 bg-general-100" />
        <Text>
          Or Continue With
        </Text>
        <View className="h-px flex-1 bg-general-100" />
      </View>

      <View className='flex flex-row w-fit mx-auto gap-3'>
        <CustomButton
          title=" Google" 
          IconLeft={() => (
            <Image
              source={icons.google}
              className='w-5 h-5 mx-1'
              resizeMode='contain'
            />
          )}
          className='mt-3 shadow-none flex-1'
          bgVariant='outline'
          textVariant='primary'
          onPress={handleGoogleSignIn}
        />
        <CustomButton
          title=" Apple" 
          IconLeft={() => (
            <Image
              source={icons.apple}
              className='w-7 h-7 mx-1'
              resizeMode='contain'
            />
          )}
          className='mt-3 shadow-none flex-1'
          bgVariant='outline'
          textVariant='primary'
          onPress={handleAppleSignIn}
        />
      </View>
    </View>
  )
}

export default OAuth

const styles = StyleSheet.create({})