import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Swiper from 'react-native-swiper'
import { images, onboarding } from '@/constants/utils'
import CustomButton from '@/components/CustomButton'

const Onboarding = () => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1

  return (
    <SafeAreaView className='flex h-full items-center justify-between bg-white'>
      <Pressable onPress={() => router.replace('/(auth)/sign-up')} className='w-full flex-row justify-between items-end p-5'>
        <Image
          source={images.logohor}
          style={{ width: 76, height: 40, borderRadius: 11 }}
          resizeMode='stretch'
        />
        <Text className='text-mdr font-JakartaBold bg-[#0286FF] text-white inset-0 px-4 py-3 leading-none text-center' style={{ borderRadius: 11 }}>
          skip
        </Text>
      </Pressable>
      
      <Swiper
        ref={swiperRef}
        dot={<View className="w-[32px] h-[4px] mx-1 mt-4 bg-[#E2E8F0] rounded-full" />}
        loop={false}
        showsPagination
        paginationStyle={{ bottom: -10 }}
        activeDot={<View className="w-[32px] h-[4px] mx-1 mt-3 bg-[#0286FF] rounded-full" />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {
          onboarding.map((item) => (
            <View key={item.id} className='flex items-center justify-center py-5 w-full'>
              
              {/* 1. Added a 'relative' parent container to hold both image and text together */}
              <View className='relative w-screen h-[400px] flex items-center'>
                
                <Image
                  source={item.image}
                  className='w-screen h-full scale-110 bg-white'
                  alt={item.title}
                  resizeMode='cover'
                />

                <View pointerEvents="box-none" className='absolute -bottom-48 w-full items-center justify-center px-5 z-10'>
                  <Text className='text-black text-3xl font-bold text-center'>
                    {item.title}
                  </Text>
                  <Text className='text-sm font-JakartaSemiBold text-center text-[#858585] mt-3 mx-5'>
                    {item.description}
                  </Text>
                </View>
                
              </View>
              
            </View>
          ))
        }
      </Swiper>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"} 
        className="w-10/12 mt-10"
        onPress={() =>
          isLastSlide ? router.replace('/(auth)/sign-up') : swiperRef.current?.scrollBy(1)
        }
      />
    </SafeAreaView>
  )
}

export default Onboarding

const styles = StyleSheet.create({})