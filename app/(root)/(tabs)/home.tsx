import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
// 1. Swap SafeAreaView for useSafeAreaInsets
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { images } from '@/constants/utils'
import Header from '@/components/Header'
import AdCarousel from '@/components/AdCarousel'
import ServiceGrid from '@/components/Options'
import { rides } from '@/constants/data'
import RideCardDeck from '@/components/RideCardDeck'
import VeyoInsightsScreen from '@/components/Insights'
import { FontAwesome5 } from '@expo/vector-icons'
import { useUser } from '@clerk/expo'

const Index = () => {
  const { user } = useUser()
  // This hooks gives you the exact height of the device's notch/status bar
  const insets = useSafeAreaInsets() 

  return (
    // 3. Changed from SafeAreaView to a standard View so the blur reaches the absolute top
    <View className='bg-general-500 flex-1 relative'>

      {/* --- THE BLURRED HEADER --- */}
      <View
        style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent' // <-- Or use 'rgba(255,255,255, 0.8)' if you want a slight tint so text is readable
        }}
      >
        <Header 
          name={user?.firstName as string | undefined} 
          first={user?.firstName as string | undefined} 
          image={images.logohor} 
          onNotificationPress={() => console.log("something")} 
        />
      </View>

      {/* --- THE SCROLLABLE CONTENT --- */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        // 4. Dynamic paddingTop ensures the content starts exactly underneath the custom header
        contentContainerStyle={{ paddingBottom: 20, paddingTop: insets.top + 70 }}
      >
        <AdCarousel />

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

      {/* --- FLOATING ACTION BUTTON --- */}
      <Pressable 
        onPress={() => console.log("something")}
        className="absolute bottom-28 right-5 z-50 bg-blue-600 rounded-full px-5 py-4 flex-row items-center shadow-lg shadow-neutral-300 border border-neutral-100"
      >
        <FontAwesome5 name="plus" size={20} color="#ffffff" />
      </Pressable>
      
    </View>
  )
}

export default Index