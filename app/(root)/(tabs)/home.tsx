// main  scren for active rides, booking rides ,chat
// Once a user books a ride and a driver is assigned, your Home screen (the map) should display a Bottom Sheet or an overlay card with the trip details.

// Placement: Right next to the driver’s name, photo, and license plate, place two prominent circular icon buttons: a phone icon (Call) and a message bubble icon (Chat).

// Behavior: Tapping the chat icon slides up a dedicated chat interface over the map. Once the ride is completed or canceled, this chat instance disappears entirely.

import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { images } from '@/constants/utils'
import Header from '@/components/Header'
import AdCarousel from '@/components/AdCarousel'
import SearchBar from '@/components/SearchBar'
import ServiceGrid from '@/components/Options'
import { rides } from '@/constants/data'
import RideCard from '@/components/RideCard'
import RideCardDeck from '@/components/RideCardDeck'
import VeyoInsightsScreen from '@/components/Insights'

const Index = () => {

  return (
    <SafeAreaView className='bg-general-500 flex-1'>

      <Header name="Leonard" image={images.logohor} onNotificationPress={() => console.log("something")} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

        <AdCarousel />

        <SearchBar title="GO" />

        <ServiceGrid />

        <RideCardDeck rides={rides.rides} />

        <View className="mt-2 flex flex-col mx-5">
          <View className='flex flex-row justify-between items-center'>
            <Text className='font-JakartaBold text-sm'>Veyo Intelligence</Text>
            <Pressable onPress={() => console.log("something")}>
              <Text className='text-blue-600 text-[9px] text-end'>View Insights</Text>
            </Pressable>
          </View>
        </View>

        <View className='mb-20'>
          <VeyoInsightsScreen />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({})