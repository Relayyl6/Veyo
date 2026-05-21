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
        dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />}
        loop={false}
        showsPagination
        activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {
          onboarding.map((item) => (
            <>
              <View key={item.id} className='flex items-center justify-center p-5'>
                <Image
                  source={item.image}
                  className='w-full h-[300px] bg-white'
                  alt='item.name'
                  resizeMode='contain'
                />
                <View className='flex flex-row items-center justify-center w-full mt-10'>
                  <Text className='text-black text-3xl font-bold mx-10 text-center'>
                    {item.title}
                  </Text>
                </View>
              </View>

              <Text className='text-lg font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3'>{item.description}</Text>
            </>
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