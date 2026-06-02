// components/AnimatedTabBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { AnimatedTabBarBackground } from './AnimatedTabBarBackground';

export const AnimatedTabBar = ({ 
  state, 
  descriptors, 
  navigation 
}: BottomTabBarProps) => {
  const [previousRoute, setPreviousRoute] = useState(state.routes[0].name);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  // Track route changes to determine direction
  useEffect(() => {
    const currentIndex = state.index;
    const previousIndex = state.routes.findIndex(r => r.name === previousRoute);
    
    if (currentIndex > previousIndex) {
      setDirection('right'); // Moving right through tabs
    } else if (currentIndex < previousIndex) {
      setDirection('left'); // Moving left through tabs
    }
    
    setPreviousRoute(state.routes[state.index].name);
  }, [state.index]);

  // Spring animation for tab bar container
  const springAnim = useSharedValue(0);
  
  useEffect(() => {
    springAnim.value = withSequence(
      withTiming(1.02, { duration: 150, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, [state.index]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: springAnim.value }]
  }));

  return (
    <Animated.View 
      style={[
        styles.container,
        containerAnimatedStyle
      ]}
    >
      {/* Animated background */}
      <AnimatedTabBarBackground 
        currentRoute={state.routes[state.index].name}
        previousRoute={previousRoute}
        direction={direction}
      />
      
      {/* Tab buttons */}
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? 'white' : '#6B7280',
                size: 24,
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 37,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});