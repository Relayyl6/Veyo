import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocationStore } from '@/store/store'

const BookRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation
  } = useLocationStore();

  return (
    <View>
      <Text className='text-2xl'>You are here: {userAddress}</Text>
      <Text className='text-2xl'>You are going to: {destinationAddress}</Text>
    </View>
  )
}

export default BookRide

const styles = StyleSheet.create({})