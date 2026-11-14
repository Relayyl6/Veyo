import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import { PressableHybrid } from '@/components/CustomPressable'; 
import { ButtonProps } from '@/types/type';

const getBgVariantStyle = (variant: string) => {
  switch (variant) {
    case 'secondary': return 'bg-gray-500';
    case 'danger':    return 'bg-red-500';
    case 'success':   return 'bg-green-500';
    case 'outline':   return 'bg-transparent border-neutral-300 border-[0.5px]';
    case 'slide':     return 'bg-blue-100 p-1 justify-center';
    default:          return 'bg-[#0286FF]';
  }
};

const getTextVariantStyle = (variant: string) => {
  switch (variant) {
    case 'primary':   return 'text-black';
    case 'secondary': return 'text-gray-100';
    case 'danger':    return 'text-red-100';
    case 'success':   return 'text-green-100';
    case 'slide':     return 'text-blue-600 font-JakartaBold tracking-wide';
    default:          return 'text-white';
  }
};

const triggerSuccessHaptic = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {}
};

const triggerSelectionHaptic = () => {
  try {
    Haptics.selectionAsync().catch(() => {});
  } catch {}
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = 'primary',
  textVariant = 'default',
  IconLeft,
  IconRight,
  className = '',
  textClassName = '',
  trackHeight = 56,
  thumbSize = 48,
  ...props
}: ButtonProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);

  const THUMB_SIZE = thumbSize;
  const PADDING = 4;
  const MAX_TRANSLATE = Math.max(0, trackWidth - THUMB_SIZE - (PADDING * 2));

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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isCompleted.value || MAX_TRANSLATE <= 0) return;
      const newPosition = Math.max(0, Math.min(event.translationX, MAX_TRANSLATE));
      translateX.value = newPosition;

      if (Math.floor(newPosition) % 30 === 0) {
        runOnJS(triggerSelectionHaptic)();
      }
    })
    .onEnd((_gestureEvent) => {
      if (isCompleted.value) return;

      if (translateX.value > MAX_TRANSLATE * 0.8) {
        isCompleted.value = true;

        translateX.value = withSpring(MAX_TRANSLATE, { damping: 15 }, (finished) => {
          if (finished) {
            translateX.value = withDelay(500, withSpring(0, { damping: 15, stiffness: 150 }));
            isCompleted.value = false;
          }
        });

        runOnJS(triggerSuccessHaptic)();
        if (onPress) {
          runOnJS(onPress)(_gestureEvent as any);
        }
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  if (bgVariant === 'slide') {
    return (
      <View 
        className={`w-full rounded-full relative ${getBgVariantStyle(bgVariant)} ${className}`}
        style={{ height: trackHeight }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={textAnimatedStyle} className="absolute w-full items-center pointer-events-none z-0">
          <Text className={`text-base ml-6 ${getTextVariantStyle(textVariant)}`}>
            {title}
          </Text>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View 
            style={[thumbAnimatedStyle, { height: thumbSize, width: thumbSize }]} 
            className="bg-blue-600 rounded-full items-center justify-center shadow-md shadow-neutral-400/80 z-10"
          >
            <FontAwesome5 name="chevron-right" size={16} color="#ffffff" />
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }

  const { onLongPress, onPressIn, onPressOut, ...cleanProps } = props;
  const hasPadding = /p[xy]?-|p-\d/.test(className);
  const paddingClass = hasPadding ? '' : 'py-2.5 px-5';
  const hasAlignSelf = /self-/.test(className);
  const alignClass = hasAlignSelf ? '' : 'self-center';

  return (
    <PressableHybrid 
      onPress={onPress} 
      className={`rounded-full flex-row items-center justify-center shadow-sm shadow-neutral-400/50 ${getBgVariantStyle(bgVariant)} ${paddingClass} ${alignClass} ${className}`} 
      {...cleanProps}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-sm font-JakartaBold mx-1.5 ${getTextVariantStyle(textVariant)} ${textClassName}`} numberOfLines={1}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </PressableHybrid>
  );
};

export default CustomButton;
