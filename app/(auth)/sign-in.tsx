import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons, images } from '@/constants/utils'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import { Link, useRouter, type Href } from 'expo-router'
import OAuth from '@/components/OAuth'
import { useSignIn } from '@clerk/expo'

const SignIn = () => {
  // Using the new Clerk Signals API
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  })
  
  const [secure, setSecure] = useState(true)

  const validateFields = () => {
    const localErrors = { email: '', password: '' }
    let isValid = true

    if (!form.email.trim()) {
      localErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      localErrors.email = 'Please enter a valid email'
      isValid = false
    }

    if (!form.password) {
      localErrors.password = 'Password is required'
      isValid = false
    }

    setFieldErrors(localErrors)
    return isValid
  }

  const onSignInPress = async () => {
    if (fetchStatus === 'fetching') return

    // Clear previous local errors
    setFieldErrors({ email: '', password: '' })

    // Validate fields locally first
    if (!validateFields()) return

    // Create the sign in attempt (Returns an error instead of throwing)
    const { error } = await signIn.create({
      identifier: form.email,
      password: form.password,
    })

    if (error) {
      console.error('Sign-in error:', JSON.stringify(error, null, 2))
      return // The 'errors' object from useSignIn() will automatically update the UI
    }

    // Finalize the sign-in if complete
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log('Pending session tasks:', session?.currentTask)
            return
          }
          // Navigate to the home page
          const url = decorateUrl('/(root)/(tabs)/home')
          router.push(url as Href)
        },
      })
    } else {
      // Useful if you ever add Multi-Factor Authentication (MFA)
      console.error('Sign-in not complete. Current status:', signIn.status)
    }
  }

  // Combine your local validation errors with Clerk's automatic API errors
  // Clerk uses 'identifier' instead of 'email' for the sign-in field
  const emailError = fieldErrors.email || errors.fields.identifier?.message
  const passwordError = fieldErrors.password || errors.fields.password?.message || errors.fields.form?.message // 'form' catches general wrong credentials

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView className='flex-1 bg-white'>
        <View className='flex-1 bg-white'>
          <View className='relative w-full h-[250px]'>
            <Image
              source={images.signUpCar}
              className='z-0 w-full h-[250px]'
            />
            <Text className='text-2xl font-JakartaSemiBold text-black absolute bottom-5 left-5'>
              Sign Into your Account
            </Text>
          </View>

          <View className='p-5'>
            <InputField
              label="Email"
              placeholder="johndoe@example.com"
              icon={icons.email}
              value={form.email}
              onChangeText={(value: string) => {
                setForm({ ...form, email: value })
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: '' })
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
            
            <InputField
              label="Password"
              placeholder="Min. 8 characters"
              icon={icons.lock}
              value={form.password}
              secure={secure}
              setSecure={setSecure}
              onChangeText={(value: string) => {
                setForm({ ...form, password: value })
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: '' })
                }
              }}
              error={passwordError}
            />

            <CustomButton
              title={fetchStatus === 'fetching' ? "Signing In..." : "Sign In"}
              onPress={onSignInPress}
              className='mt-6'
              disabled={fetchStatus === 'fetching'}
            />

            <OAuth />

            <Link href="/sign-up" className='flex flex-row text-center text-lg text-general-200 mt-10 justify-center'>
              <Text>Don't have an account?</Text>
              <Text className="text-primary-500"> Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignIn

const styles = StyleSheet.create({})