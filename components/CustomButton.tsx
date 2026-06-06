import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Presets, useRealtimeComposer } from 'react-native-pulsar';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import { PressableHybrid } from '@/components/CustomPressable'; 
import { ButtonProps } from '@/types/type';

import { runOnJS } from "react-native-worklets"

const getBgVariantStyle = (variant: string) => {
  switch (variant) {
    case "secondary": return 'bg-gray-500';
    case "danger":    return 'bg-red-500';
    case "success":   return 'bg-green-500';
    case "outline":   return 'bg-transparent border-neutral-300 border-[0.5px]';
    case "slide":     return 'bg-blue-100 p-1 justify-center';
    default:          return 'bg-[#0286FF]';
  }
};

const getTextVariantStyle = (variant: string) => {
  switch (variant) {
    case "primary":   return "text-black";
    case "secondary": return "text-gray-100";
    case "danger":    return "text-red-100";
    case "success":   return "text-green-100";
    case "slide":     return "text-blue-600 font-JakartaBold tracking-wide";
    default:          return "text-white";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = 'primary',
  textVariant = 'default',
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps) => {
  // --- UNCONDITIONAL HOOK INITIALIZATIONS (Must stay at the top layer) ---
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  
  // RealtimeComposer hook handles conditional checks under the hood safely
  const pulsarComposer = useRealtimeComposer();

  const THUMB_SIZE = 48;
  const PADDING = 4;
  const MAX_TRANSLATE = Math.max(0, trackWidth - THUMB_SIZE - (PADDING * 2));

  // These styles run unconditionally on every render pass now
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, MAX_TRANSLATE / 2],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const triggerSuccessHaptic = () => {
    try {
      Presets.lock();
    } catch(e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!isCompleted.value && MAX_TRANSLATE > 0)
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(event.translationX, MAX_TRANSLATE));
      translateX.value = newPosition;

      const intensity = newPosition / MAX_TRANSLATE;
      if (pulsarComposer?.set) {
        pulsarComposer.set(intensity, intensity);
      } else {
        if (Math.floor(newPosition) % 30 === 0) {
          runOnJS(Haptics.selectionAsync)();
        }
      }
    })
    .onEnd(() => {
      if (pulsarComposer?.stop) pulsarComposer.stop();

      if (translateX.value > MAX_TRANSLATE * 0.8) {
        isCompleted.value = true;
        translateX.value = withSpring(MAX_TRANSLATE, { damping: 15 });
        
        runOnJS(triggerSuccessHaptic)();
        
        // THE TYPE FIX: Safely assert that onPress exists before scheduling it on the JS Thread
        if (onPress) {
          runOnJS(onPress)();
        }
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  // --- EVALUATION BRANCHING (Safely handled below hook sequence) ---
  if (bgVariant === 'slide') {
    return (
      <View 
        className={`h-14 w-full rounded-full relative ${getBgVariantStyle(bgVariant)} ${className}`}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={textAnimatedStyle} className="absolute w-full items-center pointer-events-none z-0">
          <Text className={`text-base ${getTextVariantStyle(textVariant)}`}>
            {title}
          </Text>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View 
            style={thumbAnimatedStyle} 
            className="h-12 w-12 bg-blue-600 rounded-full items-center justify-center shadow-md shadow-neutral-400/80 z-10"
          >
            <FontAwesome5 name="chevron-right" size={16} color="#ffffff" />
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }

  return (
    <PressableHybrid 
      onPress={onPress} 
      className={`flex rounded-full flex-row items-center justify-center shadow-md shadow-neutral-400/70 p-4 ${getBgVariantStyle(bgVariant)} ${className}`} 
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-bold mx-2 ${getTextVariantStyle(textVariant)}`} numberOfLines={1}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </PressableHybrid>
  );
};

export default CustomButton;