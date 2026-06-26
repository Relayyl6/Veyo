import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, StyleSheet, Image, Text } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface SlideProps {
  onActivate: () => void;
}

const SlideToAddButton = ({ onActivate }: SlideProps) => {
  // const [activated, setActivated] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Dimensions for the mini slider
  const TRACK_WIDTH = 60;
  const THUMB_SIZE = 28;
  const MAX_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4; // 4px for padding

  const panResponder = useRef(
    PanResponder.create({
      // Only capture horizontal swipes (allows vertical scrolling to pass through to the screen)
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        if (gesture.dx > MAX_TRAVEL / 2) {
          Animated.spring(pan, {
            toValue: { x: MAX_TRAVEL, y: 0 },
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
              }).start();
            }
          });
          onActivate(); // increments count immediately
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Clamp the animation so the thumb doesn't slide outside the box
  const translateX = pan.x.interpolate({
    inputRange: [0, MAX_TRAVEL],
    outputRange: [0, MAX_TRAVEL],
    extrapolate: 'clamp',
  });

  return (
    <View className="h-8 justify-center rounded-full bg-black" style={{ width: TRACK_WIDTH }}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[{ transform: [{ translateX }] }]}
        className="w-7 h-7 rounded-full bg-white items-center justify-center ml-0.5 shadow-sm absolute z-10"
      >
        <Ionicons name="add" size={18} color="black" />
      </Animated.View>
    </View>
  );
};

interface MealCardProps {
  title: string;
  time: string;
  price: string;
  rating: string;
  imageUrl: string;
  quantity?: number;
  onAdd: () => void;
}

const MealCard = ({ title, time, price, rating, imageUrl, quantity, onAdd }: MealCardProps) => {
  return (
    // w-[48%] ensures it takes up just under half the screen for a 2-column layout
    <View className="w-[48%] p-2 rounded-[16px] bg-[#FFF8F5] mb-4 shadow-sm shadow-neutral-100">
      
      {/* Image & Badge Container */}
      <View className="relative w-full aspect-square">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full rounded-[12px]"
          resizeMode="cover"
        />

        {quantity as number > 0 && (
          <View className="absolute top-2 left-2 bg-black w-7 h-7 rounded-full flex items-center justify-center shadow-sm border-2 border-[#FFF8F5] z-10">
            <Text className="text-white font-JakartaBold text-xs">{quantity}</Text>
          </View>
        )}

        {/* Absolute Rating Badge */}
        <View className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center gap-1 shadow-sm">
          <FontAwesome name="star" size={12} color="#FBBF24" />
          <Text className="font-JakartaBold text-xs text-black">{rating}</Text>
        </View>
      </View>

      {/* Text Content */}
      <View className="mt-3 px-1">
        <Text className="font-JakartaBold text-[15px] text-[#0f172a]" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-[#64748b] text-xs font-Jakarta mt-1">
          Cooking Time : {time}
        </Text>

        {/* Bottom Row (Price & Slider) */}
        <View className="flex-row items-center justify-between mt-4 mb-1">
          <Text className="font-JakartaBold text-[17px] text-[#0f172a]">
            ${price}
          </Text>
          
          <SlideToAddButton onActivate={onAdd} />
        </View>
      </View>

    </View>
  );
};

export default MealCard;