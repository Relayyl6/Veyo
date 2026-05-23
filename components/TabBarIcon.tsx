import React from 'react';
import { Text } from 'react-native';
// Notice we don't import Image from react-native anymore
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface TabBarIconProps {
  name?: any;
  title?: string;
  color: string;
  focused: boolean;
}

export const TabBarIcon = ({ name, title, focused }: TabBarIconProps) => {
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        focused ? '#2563EB' : 'transparent', 
        { duration: 250 }
      ),
      // Optional: This gives the whole button a slight "pop" to simulate momentum
      transform: [
        { scale: withTiming(focused ? 1.0 : 0.98, { duration: 250 }) }
      ]
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(focused ? 40 : 24, { duration: 250 }), // 40 = w-10, 24 = w-6
      height: withTiming(focused ? 40 : 24, { duration: 250 }),
      transform: [
        { rotate: withTiming(focused && title === "Trips" ? '45deg' : '0deg', { duration: 250 }) }
      ]
    };
  });

  return (
    <Animated.View 
      style={[animatedContainerStyle]}
      className="flex flex-col justify-center items-center rounded-full w-14 h-14 mt-2"
    >
      
      {/* Changed to Animated.Image and swapped Tailwind size classes for our animated style */}
      <Animated.Image
        source={name}
        alt={title || "icon"}
        tintColor={focused ? "white" : "#6B7280"} 
        resizeMode="contain"
        style={animatedIconStyle}
      />

      {!focused && (
        <Text 
          className="font-Jakarta-Bold text-[10px] mt-1"
          style={{ color: focused ? '#FFFFFF' : '#000000' }} 
        >
          {title}
        </Text>
      )}
      
    </Animated.View>
  );
};

export default TabBarIcon;