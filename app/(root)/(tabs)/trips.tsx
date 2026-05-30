// include a planner and history feature 
// Features: Instead of just booking a ride for right now, 
// this tab allows users to manage future rides (e.g.,
//     booking a trip to the airport for 4:00 AM tomorrow).
// They can view upcoming scheduled rides, edit times, o
// // cancel them before the driver is dispatched.


// Users often need to chat after a ride if they left an item in the car or had a billing issue.

// Placement: When a user taps into a specific past ride in the History tab, provide a "Help with this trip" or "Contact Support/Driver" button

import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Map from '@/components/Map'
import { Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'
import { useUser } from '@clerk/expo'
import { SafeAreaView } from 'react-native-safe-area-context'

const Rides = () => {
  const { user } = useUser()
  return (
    <SafeAreaView className='flex-1'>
      <Header
        name="Leonard"
        first={user?.firstName as string}
      />

      <ScrollView className='mx-4'>
        <View className="flex-row items-center justify-between mt-2 px-2 mb-5">
          <Text className="text-black text-[17px] font-JakartaMedium">Weekend Hangouts</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[#3122D2] text-[10px] font-JakartaBold">View Map</Text>
          </View>
        </View>

        <View className='flex flex-row items-center h-[300px] bg-red-200'>
          <Map />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Rides

const styles = StyleSheet.create({})