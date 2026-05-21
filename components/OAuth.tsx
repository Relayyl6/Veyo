import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomButton from './CustomButton'
import { icons } from '@/constants/utils'

const OAuth = () => {
  const handleGoogleSignIn = async () => {}
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
              className='w-5 h-5 mx-2'
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
              source={icons.google}
              className='w-5 h-5 mx-2'
              resizeMode='contain'
            />
          )}
          className='mt-3 shadow-none flex-1'
          bgVariant='outline'
          textVariant='primary'
          onPress={handleGoogleSignIn}
        />
      </View>
    </View>
  )
}

export default OAuth

const styles = StyleSheet.create({})