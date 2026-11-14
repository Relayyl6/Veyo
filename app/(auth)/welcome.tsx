import React, { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Swiper from 'react-native-swiper';
import { images, onboarding } from '@/constants/utils';
import CustomButton from '@/components/CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Onboarding = () => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white justify-between">
      {/* Top Navigation Bar */}
      <View className="w-full flex-row justify-between items-center px-6 py-3">
        <Image
          source={images.logohor}
          style={{ width: 88, height: 34 }}
          resizeMode="contain"
        />
        <Pressable
          onPress={() => router.replace('/(auth)/sign-up')}
          className="bg-neutral-100 px-4 py-1.5 rounded-full active:bg-neutral-200"
          hitSlop={12}
        >
          <Text className="text-xs font-JakartaBold text-neutral-600">
            Skip
          </Text>
        </Pressable>
      </View>
      
      {/* 3 Storytelling Slides */}
      <View className="flex-1 w-full">
        <Swiper
          ref={swiperRef}
          dot={<View className="w-5 h-1.5 mx-1 bg-neutral-200 rounded-full" />}
          activeDot={<View className="w-8 h-1.5 mx-1 bg-[#0286FF] rounded-full" />}
          loop={false}
          showsPagination
          paginationStyle={{ bottom: 12 }}
          onIndexChanged={(index) => setActiveIndex(index)}
        >
          {onboarding.map((item) => (
            <View
              key={item.id}
              className="flex-1 items-center justify-between px-6 pt-1 pb-16 w-full"
            >
              {/* Illustration Container */}
              <View
                className="w-full flex-1 items-center justify-center"
                style={{ maxHeight: SCREEN_HEIGHT * 0.44 }}
              >
                <Image
                  source={item.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                  alt={item.title}
                />
              </View>

              {/* Storytelling Text Container */}
              <View className="items-center px-2 w-full mt-2">
                {item.tag && (
                  <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2.5">
                    <Text className="text-[10.5px] font-JakartaBold text-[#0286FF] tracking-wider">
                      {item.tag}
                    </Text>
                  </View>
                )}
                <Text className="text-2xl sm:text-[26px] font-JakartaBold text-neutral-900 text-center mb-2 leading-tight">
                  {item.title}
                </Text>
                <Text className="text-sm font-JakartaMedium text-neutral-500 text-center leading-5 max-w-[330px]">
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </Swiper>
      </View>

      {/* Bottom CTA Action Button */}
      <View className="w-full px-6 pb-6 pt-2">
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"} 
          className="w-full py-3.5"
          textClassName="text-base font-JakartaBold text-white"
          onPress={() =>
            isLastSlide ? router.replace('/(auth)/sign-up') : swiperRef.current?.scrollBy(1)
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({});
