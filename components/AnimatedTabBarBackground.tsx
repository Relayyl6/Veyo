// components/AnimatedTabBarBackground.tsx
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, useColorScheme } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS,
  Easing,
  withDelay
} from 'react-native-reanimated';

interface AnimatedTabBarBackgroundProps {
  currentRoute: string;
  previousRoute: string;
  direction: 'left' | 'right';
}

export const AnimatedTabBarBackground = ({ 
  currentRoute, 
  previousRoute, 
  direction 
}: AnimatedTabBarBackgroundProps) => {
  const colorScheme = useColorScheme();
  const bgImage = colorScheme === 'dark' 
    ? require('@/assets/images/tabbar-dark.png') 
    : require('@/assets/images/tabbar-light.png');

  // Animation values for fade transitions
  const currentOpacity = useSharedValue(1);
  const nextOpacity = useSharedValue(0);
  const slideOffset = useSharedValue(direction === 'right' ? -100 : 100);
  
  useEffect(() => {
    // Reset and start animation when route changes
    nextOpacity.value = 0;
    slideOffset.value = direction === 'right' ? -100 : 100;
    currentOpacity.value = 1;
    
    // Fade out current background towards the direction
    currentOpacity.value = withTiming(0, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
    
    // Slide and fade in new background from opposite direction
    slideOffset.value = withTiming(0, { 
      duration: 400, 
      easing: Easing.inOut(Easing.cubic) 
    });
    
    nextOpacity.value = withDelay(
      50,
      withTiming(1, { 
        duration: 350, 
        easing: Easing.in(Easing.cubic)
      })
    );
  }, [currentRoute, direction]);

  const currentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: currentOpacity.value,
    transform: [
      { translateX: slideOffset.value }
    ]
  }));

  const nextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nextOpacity.value,
    transform: [
      { translateX: 0 }
    ]
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(currentOpacity.value === 0 ? 0.3 : 0, { duration: 200 }),
    transform: [{ scale: withTiming(currentOpacity.value === 0 ? 1.2 : 1, { duration: 300 }) }]
  }));

  return (
    <>
      {/* Glow effect layer - behind everything */}
      <Animated.View style={[StyleSheet.absoluteFill, glowAnimatedStyle]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />
      </Animated.View>
      
      {/* Current background layer */}
      <Animated.View style={[StyleSheet.absoluteFill, currentAnimatedStyle]}>
        <Image 
          source={bgImage} 
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
      
      {/* Next background layer (sliding in) */}
      <Animated.View style={[StyleSheet.absoluteFill, nextAnimatedStyle]}>
        <Image 
          source={bgImage} 
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
    </>
  );
};