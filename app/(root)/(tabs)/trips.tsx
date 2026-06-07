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
import { styled } from 'nativewind';
import Map from '@/components/Map'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'
import { useUser } from '@clerk/expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg';
import { PressableScale } from 'pressto';
import { PressableHybrid } from '@/components/CustomPressable'
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton';
import ActionCard from '@/components/OptionBoxes';
import Drop from '@/components/drop';
import SavedPlacesRow from '@/components/SavedPlacesRow';

const Rides = () => {
  const { user } = useUser();

  const router = useRouter()
  return (
    <SafeAreaView className='flex-1'>
      <Header
        name={user?.firstName as string | undefined} 
        first={user?.firstName as string}
      />

      <ScrollView className='mx-4'>
        <View className="flex-row items-center justify-between mt-2 px-2 mb-5">
          <Text className="text-black text-[17px] font-JakartaMedium">Current Location</Text>
          <PressableHybrid
            className="flex-row items-center gap-1.5 px-2 py-1 rounded-md"
            onPress={() => router.push("/(utils)/map")} 
          >
            <Text className="text-[#3122D2] text-[10px] font-JakartaBold">
              View Map
            </Text>
            <Svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#3122D2" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Top Right Arrow */}
              <Path d="M15 3h6v6" />
              <Path d="M21 3l-7 7" />
              {/* Bottom Left Arro4w */}
              <Path d="M9 21H3v-6" />
              <Path d="M3 21l7-7" />
            </Svg>
          </PressableHybrid>
        </View>

        <View className='flex flex-row items-center h-[300px]'>
          <Map />
        </View>

        <CustomButton 
          title="Slide to Confirm Payment" 
          bgVariant="slide"
          textVariant="slide"
          onPress={() => router.push("/(root)/(tabs)/home")} 
          className='mt-2'
        />

        <View className="flex-row gap-4 w-full">
          
          {/* Card 1: Book a Ride */}
          <ActionCard
            title="Book a Ride"
            subtitle="Swift city mobility"
            iconBgColor="bg-indigo-50" // Soft purple/indigo hue tint matching the image
            onPress={() => router.push('/(utils)/book-ride')}
            Icon={() => (
              <FontAwesome5 name="car" size={20} color="#3122D2" />
            )}
          />

          {/* Card 2: Send Items */}
          <ActionCard
            title="Send Items"
            subtitle="Same-day delivery"
            iconBgColor="bg-teal-50" // Soft teal hue tint matching the image
            onPress={() => router.push('/(utils)/send-items')}
            Icon={() => (
              <Ionicons name="cube" size={22} color="#0D7A87" />
            )}
          />
        </View>

        <Drop title="Where to?" next="EDIT"/>
        <SavedPlacesRow />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Rides