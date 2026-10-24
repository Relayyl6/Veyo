import { discoveryData } from "@/constants/item"
import React from 'react';
import { View, Text, Image, Dimensions, Platform, Animated } from 'react-native';
import { PressableHybrid } from '@/components/CustomPressable';
import { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width minus 20px padding on each side
const CARD_HEIGHT = 150;


// --- Extracted card: each card reads scrollAnim independently in a worklet ---
type CardItem = typeof discoveryData[number];

function CarouselCard({ item, index, scrollAnim, total }: {
  item: CardItem;
  index: number;
  scrollAnim: Animated.SharedValue<number>;
  total: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const translateX = interpolate(scrollAnim.value, inputRange, [20, 0, -width * 1.5], Extrapolation.CLAMP);
    const translateY = interpolate(scrollAnim.value, inputRange, [-15, 0, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollAnim.value, inputRange, [0.9, 1, 1], Extrapolation.CLAMP);
    const opacity = interpolate(
      scrollAnim.value,
      [index - 2, index - 1, index, index + 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
      zIndex: total - index,
    };
  });

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT },
        animatedStyle,
      ]}
    >
      <View
        className="flex-1 rounded-3xl bg-white shadow-sm shadow-neutral-400"
        style={Platform.OS === 'android' ? { elevation: 0 } : undefined}
      >
        <PressableHybrid className="flex-1 rounded-3xl overflow-hidden bg-black">
          <Image
            source={{ uri: item.image }}
            className="absolute w-full h-full rounded-3xl"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40 rounded-3xl" />

          <View className="flex-1 justify-between p-4">
            <View className={`${item.tagColor} self-start px-2 py-1 rounded-md`}>
              <Text className="text-white text-[10px] font-JakartaBold tracking-wider">
                {item.tag}
              </Text>
            </View>

            <View>
              <Text className="text-white text-4xl font-JakartaBold mb-1">{item.title}</Text>
              <Text className="text-white/90 text-xs font-Jakarta">{item.subtitle}</Text>
            </View>
          </View>
        </PressableHybrid>
      </View>
    </Animated.View>
  );
}

export default CarouselCard