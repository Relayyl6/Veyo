import React, { useRef } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

export interface AnimatedPressableOptions {
  isPressed?: boolean;
  isToggled?: boolean;
  isSelected?: boolean;
}

export type CustomPressableProps = {
  onPress?: ((event?: any) => void) | undefined;
  onPressIn?: ((event?: any) => void) | undefined;
  onPressOut?: ((event?: any) => void) | undefined;
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  [key: string]: any;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: 'style' });

export const PressableHybrid: React.FC<CustomPressableProps> = ({
  onPress,
  onPressIn,
  onPressOut,
  children,
  className,
  style,
  disabled,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  const handlePress = (e: GestureResponderEvent) => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      className={`overflow-hidden ${className ?? ''}`}
      style={[
        style,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableHybrid;
